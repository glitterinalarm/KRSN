import json
import os
import re
from bs4 import BeautifulSoup

# Load project media
with open('projects_media.json', 'r') as f:
    projects_media = json.load(f)

path = "dist/work.html"
with open(path, "r") as f:
    soup = BeautifulSoup(f, "html.parser")

# Find all project blocks
# They are containers with a group class and an h3 inside
projects = soup.find_all(class_="group")

import unicodedata

def normalize(text):
    """Normalize text: lowercase, remove accents, strip spaces."""
    text = str(text).lower().strip()
    return "".join(c for c in unicodedata.normalize('NFD', text)
                  if unicodedata.category(c) != 'Mn')

# Create normalized map
norm_media = {normalize(k): v for k, v in projects_media.items()}

for project in projects:
    h3 = project.find('h3')
    if h3:
        project_name = normalize(h3.get_text(strip=True))
        # Check if any key is contained in or equals the project_name
        matching_key = next((k for k in norm_media if k in project_name), None)
        
        if matching_key:
            project_data = norm_media[matching_key]
            
            # --- 1. Remove Case Study Buttons ---
            case_study_buttons = project.find_all('a', string=re.compile(r'View Case Study', re.I))
            for btn in case_study_buttons:
                btn.decompose()
                print(f"Removed Case Study button for {matching_key}")

            # --- 2. Handle Media ---
            img = project.find('img')
            if img:
                # Ensure it has a z-index to stay below iframe
                existing_classes = img.get('class', [])
                if isinstance(existing_classes, str):
                    existing_classes = existing_classes.split()
                if 'z-10' not in existing_classes:
                    img['class'] = existing_classes + ['z-10']
                
                # Check for Video Link (Youtube/Vimeo)
                p_link = project_data.get('link', '').strip()
                if 'youtube.com' in p_link or 'youtu.be' in p_link:
                    # Extract Video ID
                    if 'youtu.be' in p_link:
                        v_id = p_link.split('/')[-1]
                    else:
                        match = re.search(r'v=([^&]+)', p_link)
                        v_id = match.group(1) if match else p_link.split('/')[-1]
                    img['data-video'] = f"https://www.youtube.com/embed/{v_id}?autoplay=1&mute=1&controls=0&loop=1&playlist={v_id}&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0"
                    print(f"Added video hover for {matching_key}")
                elif 'vimeo.com' in p_link:
                    v_id = p_link.split('/')[-1]
                    img['data-video'] = f"https://player.vimeo.com/video/{v_id}?autoplay=1&muted=1&background=1&loop=1"
                    print(f"Added vimeo hover for {matching_key}")
                else:
                    # Slideshow Mode
                    raw_slides = [s.strip() for s in project_data.get('images', []) if s.strip()]
                    slides = []
                    for s in raw_slides:
                        if s not in slides:
                            slides.append(s)
                    if slides:
                        img['data-slideshow'] = ",".join(slides)
                        print(f"Added slideshow to {matching_key}")

# Inject JS/CSS logic before </body>
script_logic = '''
<script>
    document.querySelectorAll('img[data-slideshow], img[data-video]').forEach(img => {
        let interval = null;
        const videoUrl = img.getAttribute('data-video');
        const slidesStr = img.getAttribute('data-slideshow');
        const originalSrc = img.src;
        const container = img.closest('.group');
        if (!container) return;

        container.style.position = 'relative'; // Ensure absolute children work

        container.addEventListener('mouseenter', () => {
            if (videoUrl) {
                // Remove existing iframes just in case
                container.querySelectorAll('iframe').forEach(f => f.remove());
                
                const iframe = document.createElement('iframe');
                iframe.src = videoUrl;
                iframe.style.position = 'absolute';
                iframe.style.inset = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.zIndex = '30';
                iframe.style.pointerEvents = 'none';
                iframe.style.border = '0';
                iframe.style.opacity = '0';
                iframe.style.transition = 'opacity 0.6s ease';
                iframe.allow = "autoplay; encrypted-media; gyroscope; picture-in-picture";
                
                container.appendChild(iframe);
                // Force a reflow then show
                iframe.offsetHeight; 
                iframe.style.opacity = '1';
            } else if (slidesStr) {
                const slides = slidesStr.split(',');
                let index = 0;
                if (interval) clearInterval(interval);
                interval = setInterval(() => {
                    img.src = slides[index];
                    index = (index + 1) % slides.length;
                }, 400);
            }
        });

        container.addEventListener('mouseleave', () => {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
            const iframes = container.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                iframe.style.opacity = '0';
                setTimeout(() => iframe.remove(), 600);
            });
            img.src = originalSrc;
        });
        
        if (slidesStr) {
            slidesStr.split(',').forEach(src => {
                const temp = new Image();
                temp.src = src;
            });
        }
    });
</script>
'''

# Save back
html_content = str(soup)
if '</body>' in html_content:
    html_content = html_content.replace('</body>', f'{script_logic}</body>')

with open(path, "w") as f:
    f.write(html_content)
