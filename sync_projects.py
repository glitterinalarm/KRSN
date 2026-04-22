import os
import re
import json
import unicodedata
from bs4 import BeautifulSoup

def normalize(text):
    """Normalize text for matching purposes."""
    text = str(text).lower().strip()
    return "".join(c for c in unicodedata.normalize('NFD', text)
                  if unicodedata.category(c) != 'Mn')

# Load State
STATE_FILE = 'projects_state.json'
with open(STATE_FILE, 'r') as f:
    state_data = json.load(f)

# Load HTML
WORK_FILE = 'dist/work.html'
if not os.path.exists(WORK_FILE):
    print("Work file not found.")
    exit()

with open(WORK_FILE, 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

# Find all project containers (.group)
projects = soup.find_all(class_="group")

# Map slots by original titles
slot_map = [
    "police",    # Slot 1
    "leboncoin",  # Slot 2
    "bnp",       # Slot 3
    "tourisme",  # Slot 4
    "westfield", # Slot 5
    "mondoffice",# Slot 6
    "casden"     # Slot 7
]

# Track updated slots (we only use the first 7 that match our known cases)
updated_count = 0

for project in projects:
    # 1. Identify which slot this is based on current h3 text
    h3 = project.find('h3')
    if not h3: continue
    
    current_title_text = normalize(h3.get_text(separator=" ", strip=True))
    
    matching_key = None
    for key, data in state_data.items():
        # Matching logic: data title vs current text
        if normalize(data['title']) in current_title_text or normalize(key) in current_title_text:
            matching_key = key
            break
            
    if matching_key:
        data = state_data[matching_key]
        print(f"Syncing slot: {matching_key} (identified as {current_title_text})")
        
        # --- 1. Remove Case Study Buttons ---
        for a in project.find_all('a'):
            if "View Case Study" in a.get_text():
                print(f"Removing View Case Study button for {matching_key}")
                a.decompose()

        # --- 2. Update Title & Category ---
        # Robust title update: find the text node or the deepest span and update its text
        def update_deepest_text(element, new_text):
            target = element
            while target.find('span'):
                target = target.find('span')
            target.string = new_text

        update_deepest_text(h3, data['title'])
        
        # For category, look for the badge span or label p
        category_el = project.find(['p', 'span'], class_=re.compile(r'label|text-\[10px\]|tracking-widest'))
        if category_el:
            category_el.string = data['category']

        # --- 3. Update Description ---
        desc_p = project.find('p', class_=re.compile(r'text-sm|text-on-surface-variant'))
        # If it's a category p (already updated), look for another one or create it
        if desc_p and desc_p == category_el:
             desc_p = project.find('p', class_=lambda c: c and 'font-light' in c)
        
        if not desc_p:
            # Try to find any p that isn't the category one
            ps = project.find_all('p')
            for p in ps:
                if p != category_el:
                    desc_p = p
                    break
        
        if desc_p:
            desc_p.string = data.get('description', '')
        else:
            # Create if missing (e.g. for Human projects)
            new_p = soup.new_tag('p', attrs={"class": "text-sm text-on-surface-variant font-light mt-4 line-clamp-3"})
            new_p.string = data.get('description', '')
            h3.parent.append(new_p)

        # --- 4. Update Media ---
        img = project.find('img')
        if img:
            # First Image (Cover)
            if data['images']:
                img['src'] = data['images'][0]
                # Reset lazy loading or other attributes if present
                if 'srcset' in img.attrs: del img['srcset']
            
            # Slideshow
            if len(data['images']) > 1:
                img['data-slideshow'] = ",".join(data['images'])
                if 'data-video' in img.attrs: del img['data-video']
            else:
                if 'data-slideshow' in img.attrs: img['data-slideshow'] = ""

            # Video Link
            p_link = data.get('link', '').strip()
            if p_link:
                v_id = None
                if 'youtube.com' in p_link or 'youtu.be' in p_link:
                    v_id = re.search(r'v=([^&]+)', p_link).group(1) if 'v=' in p_link else p_link.split('/')[-1]
                    img['data-video'] = f"https://www.youtube.com/embed/{v_id}?autoplay=1&mute=1&controls=0&loop=1&playlist={v_id}&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0"
                elif 'vimeo.com' in p_link:
                    v_id = p_link.split('/')[-1]
                    img['data-video'] = f"https://player.vimeo.com/video/{v_id}?autoplay=1&muted=1&background=1&loop=1"
                
                if v_id:
                    # If video, ensure slideshow is empty
                    if 'data-slideshow' in img.attrs: img['data-slideshow'] = ""
            elif 'data-video' in img.attrs:
                del img['data-video']
        
        updated_count += 1

# Inject Video/Slideshow Logic (same as before)
script_logic = """
<script>
    document.querySelectorAll('img[data-slideshow], img[data-video]').forEach(img => {
        let interval = null;
        const videoUrl = img.getAttribute('data-video');
        const slidesStr = img.getAttribute('data-slideshow');
        const originalSrc = img.src;
        const container = img.closest('.group');
        if (!container) return;

        container.style.position = 'relative';

        container.addEventListener('mouseenter', () => {
            if (videoUrl) {
                container.querySelectorAll('iframe').forEach(f => f.remove());
                const iframe = document.createElement('iframe');
                iframe.src = videoUrl;
                iframe.style.position = 'absolute'; iframe.style.inset = '0';
                iframe.style.width = '100%'; iframe.style.height = '100%';
                iframe.style.zIndex = '30'; iframe.style.pointerEvents = 'none';
                iframe.style.border = '0'; iframe.style.opacity = '0';
                iframe.style.transition = 'opacity 0.6s ease';
                iframe.allow = "autoplay; encrypted-media; gyroscope; picture-in-picture";
                container.appendChild(iframe);
                iframe.offsetHeight; iframe.style.opacity = '1';
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
            if (interval) { clearInterval(interval); interval = null; }
            const iframes = container.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                iframe.style.opacity = '0';
                setTimeout(() => iframe.remove(), 600);
            });
            img.src = originalSrc;
        });
        if (slidesStr) {
            slidesStr.split(',').forEach(src => { (new Image()).src = src; });
        }
    });
</script>
"""

# Append script before </body> if not present
if "document.querySelectorAll('img[data-slideshow]" not in str(soup):
    soup.body.append(BeautifulSoup(script_logic, 'html.parser'))

with open(WORK_FILE, 'w') as f:
    f.write(soup.prettify())
