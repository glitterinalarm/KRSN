import re
import os
import requests
import json
from bs4 import BeautifulSoup

def fetch_kerosene_insights():
    url = "https://veille-creative.vercel.app/"
    try:
        response = requests.get(url, timeout=15)
        soup = BeautifulSoup(response.text, 'html.parser')
        articles = []
        
        # Target the category blocks
        rubriques = soup.select('h3') # Categories are often H3 or similar
        for r in rubriques:
            # Look for the immediate next articles
            card = r.find_next('a')
            if not card or 'href' not in card.attrs: continue
            
            title = card.get_text(strip=True)
            link = card['href']
            if not link.startswith('http'): link = url.rstrip('/') + '/' + link.lstrip('/')
            
            # Simple heuristic for image
            img_src = "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800"
            img_el = card.find('img')
            if img_el and 'src' in img_el.attrs:
                img_src = img_el['src']
            
            articles.append({
                'title': title[:60] + "..." if len(title) > 60 else title,
                'link': link,
                'img': img_src,
                'meta': r.get_text(strip=True).upper(),
                'summary': "Latest transmission from the creative front."
            })
            if len(articles) >= 8: break
            
        return articles
    except Exception as e:
        print(f"Scraping failed: {e}")
        return [] # Fallback will be handled in update_lab_page

def get_media_html(urls, css_class=""):
    if not isinstance(urls, list): urls = [urls] if urls else []
    
    # Separate videos and images
    videos = [u for u in urls if "youtube.com" in u or "youtu.be" in u]
    images = [u for u in urls if u not in videos and u]
    
    if not urls:
        return f'<div class="{css_class} bg-gray-100 flex items-center justify-center text-[9px] uppercase opacity-20">No Media</div>'

    html = f'<div class="media-container relative w-full aspect-[16/10] overflow-hidden mb-6 group">'
    
    # 1. Video Layer (Hidden by default, shown on hover if exists)
    if videos:
        vid_id = videos[0].split("v=")[1].split("&")[0] if "v=" in videos[0] else videos[0].split("/")[-1]
        html += f'''
        <div class="video-overlay absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none">
            <iframe class="w-full h-full" src="https://www.youtube.com/embed/{vid_id}?autoplay=1&mute=1&loop=1&playlist={vid_id}&controls=0&showinfo=0&rel=0&disablekb=1" frameborder="0" allow="autoplay; encrypted-media"></iframe>
        </div>'''

    # 2. Image/Slideshow Layer
    if len(images) > 1:
        slides_html = ""
        for i, url in enumerate(images):
            slides_html += f'<div class="slideshow-item absolute inset-0 transition-opacity duration-1000 { "opacity-100" if i == 0 else "opacity-0" }" data-index="{i}"><img src="{url}" class="w-full h-full object-cover"></div>'
        html += f'<div class="slideshow-container absolute inset-0" data-count="{len(images)}">{slides_html}</div>'
    elif len(images) == 1:
        html += f'<img src="{images[0]}" class="absolute inset-0 w-full h-full object-cover">'
    elif not images and videos:
        # If ONLY video, show a placeholder or the video directly
        html += f'<div class="absolute inset-0 bg-black flex items-center justify-center text-[9px] text-white uppercase tracking-widest opacity-20 italic">Hover to Play Video</div>'

    html += '</div>'
    return html

def update_pages():
    data_path = "site_data.json"
    if not os.path.exists(data_path): return
    # Load data
    with open(data_path, "r", encoding="utf-8", errors="ignore") as f:
        site_data = json.load(f)

    # Slideshow Script for injection
    slideshow_js = """
    <script id="slideshow-logic">
        function initSlideshows() {
            const containers = document.querySelectorAll('.slideshow-container');
            containers.forEach(container => {
                if (container.dataset.initialized) return;
                container.dataset.initialized = "true";
                let current = 0;
                const slides = container.querySelectorAll('.slideshow-item');
                const count = parseInt(container.dataset.count);
                if (count <= 1) return;
                
                setInterval(() => {
                    slides[current].classList.remove('opacity-100');
                    slides[current].classList.add('opacity-0');
                    current = (current + 1) % count;
                    slides[current].classList.remove('opacity-0');
                    slides[current].classList.add('opacity-100');
                }, 3000);
            });
        }
        document.addEventListener('DOMContentLoaded', initSlideshows);
    </script>"""

    # 1. Update WORK.HTML
    work_path = "work.html"
    if os.path.exists(work_path):
        with open(work_path, "r") as f: content = f.read()
        work_html = ""
        for item in site_data["works"]:
            images = item.get('images', [item.get('image', '')])
            media = get_media_html(images, "w-full aspect-[16/10] object-cover mb-8")
            link = item.get('link', '#')
            work_html += f'''
            <div class="work-gallery-item cursor-pointer" onclick="window.open('{link}', '_blank')">
                {media}
                <div class="mt-8 flex justify-between items-baseline">
                    <h3 class="text-2xl font-black uppercase">{item['title']}</h3>
                    <span class="label-mono opacity-40">{item.get('year', '2026')} / {item.get('category', 'BRANDING')}</span>
                </div>
            </div>'''
        content = re.sub(r'<div class="work-gallery-container" id="gallery">.*?</div>', 
                         f'<div class="work-gallery-container" id="gallery">{work_html}</div>', 
                         content, flags=re.DOTALL)
        if 'id="slideshow-logic"' not in content: content = content.replace('</body>', f'{slideshow_js}</body>')
        with open(work_path, "w") as f: f.write(content)

    # 2. Update LAB.HTML
    lab_path = "lab.html"
    if os.path.exists(lab_path):
        with open(lab_path, "r") as f: content = f.read()
        lab_html = ""
        for i, item in enumerate(site_data["lab"]):
            images = item.get('images', [item.get('image', '')])
            media = get_media_html(images, "w-full aspect-[16/10] object-cover mb-6")
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
        
        insights = fetch_kerosene_insights()
        insights_html = ""
        for art in insights:
            insights_html += f'''
                    <div class="insight-item">
                        <img src="{art['img']}" class="w-full aspect-[21/9] object-cover mb-6">
                        <div class="insight-content">
                            <div class="text-[9px] opacity-40 uppercase tracking-widest mb-4">{art['meta']}</div>
                            <h3 class="text-3xl font-bold uppercase leading-tight mb-4">{art['title']}</h3>
                            <p class="text-sm opacity-60 leading-relaxed mb-6">{art['summary']}</p>
                            <a href="{art['link']}" target="_blank" class="text-[9px] font-bold uppercase tracking-widest border-b border-black pb-1 hover:opacity-50 transition-opacity">READ DEEP DIVE ></a>
                        </div>
                    </div>'''
        content = re.sub(r'<!-- START_INSIGHTS_FEED -->.*?<!-- END_INSIGHTS_FEED -->', 
                         f'<!-- START_INSIGHTS_FEED -->{insights_html}<!-- END_INSIGHTS_FEED -->', 
                         content, flags=re.DOTALL)
        if 'id="slideshow-logic"' not in content: content = content.replace('</body>', f'{slideshow_js}</body>')
        with open(lab_path, "w") as f: f.write(content)
    print("All pages synchronized successfully.")

if __name__ == "__main__":
    update_pages()
