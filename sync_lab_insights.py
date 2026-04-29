import json
import os
import requests
from bs4 import BeautifulSoup
import re

def fetch_kerosene_insights():
    # Keep the original logic
    try:
        url = "https://kerosene.studio/insights"
        res = requests.get(url, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        items = soup.find_all('div', class_='insight-card') # adjust based on real site
        if not items:
             # fallback mock if scrape fails
             return []
        return [] # Placeholder for now to focus on slideshow
    except:
        return []

def get_media_html(urls, css_class=""):
    if not isinstance(urls, list): urls = [urls] if urls else []
    
    videos = [u for u in urls if "youtube.com" in u or "youtu.be" in u]
    images = [u for u in urls if u not in videos and u]
    
    if not urls:
        return f'<div class="{css_class} bg-gray-100 flex items-center justify-center text-[9px] uppercase opacity-20">No Media</div>'

    html = f'<div class="media-container relative w-full h-[80vh] overflow-hidden group">'
    
    # 1. Video Layer (Hidden by default, shown on hover if exists)
    if videos:
        vid_id = videos[0].split("v=")[1].split("&")[0] if "v=" in videos[0] else videos[0].split("/")[-1]
        html += f'''
        <div class="video-overlay absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none">
            <iframe class="w-full h-full grayscale hover:grayscale-0 transition-all duration-700" src="https://www.youtube.com/embed/{vid_id}?autoplay=1&mute=1&loop=1&playlist={vid_id}&controls=0&showinfo=0&rel=0&disablekb=1" frameborder="0" allow="autoplay; encrypted-media"></iframe>
        </div>'''

    # 2. Image/Slideshow Layer
    if len(images) > 1:
        slides_html = ""
        for i, url in enumerate(images):
            slides_html += f'<div class="slideshow-item absolute inset-0 transition-opacity duration-1000" style="opacity: { "1" if i == 0 else "0" }; z-index: { 1 if i == 0 else 0 };" data-index="{i}"><img src="{url}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"></div>'
        html += f'<div class="slideshow-container absolute inset-0" data-count="{len(images)}">{slides_html}</div>'
    elif len(images) == 1:
        html += f'<img src="{images[0]}" class="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700">'
    elif not images and videos:
        html += f'<div class="absolute inset-0 bg-black flex items-center justify-center text-[9px] text-white uppercase tracking-widest opacity-20 italic">Hover to Play Video</div>'

    html += '</div>'
    return html

def update_pages():
    data_path = "site_data.json"
    if not os.path.exists(data_path): return
    with open(data_path, "r", encoding="utf-8", errors="ignore") as f:
        site_data = json.load(f)

    slideshow_script = '''
    <!-- SLIDESHOW_ENGINE_START -->
    <script id="slideshow-logic">
    function initSlideshows() {
        console.log("Initializing slideshows...");
        const containers = document.querySelectorAll('.slideshow-container');
        containers.forEach(container => {
            if (container.dataset.initialized) return;
            container.dataset.initialized = "true";
            const count = parseInt(container.dataset.count);
            let current = 0;
            const slides = container.querySelectorAll('.slideshow-item');
            if (count > 1 && slides.length > 0) {
                setInterval(() => {
                    slides[current].style.opacity = "0";
                    current = (current + 1) % count;
                    slides[current].style.opacity = "1";
                }, 3000);
            }
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlideshows);
    } else {
        initSlideshows();
    }
    </script>
    <!-- SLIDESHOW_ENGINE_END -->
    '''

    def inject_script(content):
        content = re.sub(r'<!-- SLIDESHOW_ENGINE_START -->.*?<!-- SLIDESHOW_ENGINE_END -->', '', content, flags=re.DOTALL)
        if "</body>" in content:
            return content.replace("</body>", f"{slideshow_script}</body>")
        return content + slideshow_script

    # 1. WORK.HTML
    work_path = "work.html"
    if os.path.exists(work_path):
        with open(work_path, "r", encoding="utf-8") as f: content = f.read()
        work_html = ""
        for item in site_data["works"]:
            images = item.get('images', [item.get('image', '')])
            media = get_media_html(images)
            link = item.get('link', '#')
            work_html += f'''
            <div class="work-gallery-item cursor-pointer" onclick="window.open('{link}', '_blank')">
                {media}
                <div class="work-caption">
                    <h3 class="text-2xl font-black uppercase">{item['title']}</h3>
                    <span class="label-mono opacity-40">{item.get('year', '2026')} / {item.get('category', 'BRANDING')}</span>
                </div>
            </div>'''
        content = re.sub(r'<div class="work-gallery-container" id="gallery">.*?</div>', 
                         f'<div class="work-gallery-container" id="gallery">{work_html}</div>', 
                         content, flags=re.DOTALL)
        content = inject_script(content)
        with open(work_path, "w", encoding="utf-8") as f: f.write(content)

    # 2. LAB.HTML
    lab_path = "lab.html"
    if os.path.exists(lab_path):
        with open(lab_path, "r", encoding="utf-8") as f: content = f.read()
        lab_html = ""
        for i, item in enumerate(site_data["lab"]):
            images = item.get('images', [item.get('image', '')])
            media = get_media_html(images)
            lab_html += f'''
                <div class="lab-item cursor-pointer" onclick="window.open('{item['link']}', '_blank')">
                    {media}
                    <div class="flex justify-between items-baseline">
                        <div>
                            <div class="text-[9px] opacity-40 uppercase tracking-widest mb-1">{item.get('meta', 'EXP')} // {i+1:02d}</div>
                            <h3 class="text-2xl font-bold uppercase">{item['title']}</h3>
                        </div>
                    </div>
                </div>'''
        content = re.sub(r'<!-- START_LAB_FEED -->.*?<!-- END_LAB_FEED -->', 
                         f'<!-- START_LAB_FEED -->{lab_html}<!-- END_LAB_FEED -->', 
                         content, flags=re.DOTALL)
        content = inject_script(content)
        with open(lab_path, "w", encoding="utf-8") as f: f.write(content)

if __name__ == "__main__":
    update_pages()
