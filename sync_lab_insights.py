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

def get_media_html(url, css_class=""):
    if "youtube.com" in url or "youtu.be" in url:
        # Extract video ID
        vid_id = url.split("v=")[1].split("&")[0] if "v=" in url else url.split("/")[-1]
        return f'<div class="{css_class} relative overflow-hidden"><iframe class="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/{vid_id}?autoplay=1&mute=1&loop=1&playlist={vid_id}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>'
    else:
        return f'<img src="{url}" class="{css_class}">'

def update_lab_page():
    path = "lab.html"
    data_path = "site_data.json"
    if not os.path.exists(path) or not os.path.exists(data_path): return
    
    with open(data_path, "r") as f:
        site_data = json.load(f)

    with open(path, "r") as f:
        content = f.read()

    # 1. LAB FEED
    lab_html = ""
    for i, item in enumerate(site_data["lab"]):
        media = get_media_html(item['image'], "w-full aspect-[16/10] object-cover mb-6")
        lab_html += f'''
                <div class="lab-item cursor-pointer" onclick="window.open('{item['link']}', '_blank')">
                    {media}
                    <div class="flex justify-between items-baseline">
                        <div>
                            <div class="text-[9px] opacity-40 uppercase tracking-widest mb-1">{item['meta']} // {i+1:02d}</div>
                            <h3 class="text-2xl font-bold uppercase">{item['title']}</h3>
                        </div>
                    </div>
                </div>'''

    # 2. INSIGHTS FEED
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

    # Inject
    content = re.sub(r'<!-- START_LAB_FEED -->.*?<!-- END_LAB_FEED -->', 
                     f'<!-- START_LAB_FEED -->{lab_html}<!-- END_LAB_FEED -->', 
                     content, flags=re.DOTALL)
    
    content = re.sub(r'<!-- START_INSIGHTS_FEED -->.*?<!-- END_INSIGHTS_FEED -->', 
                     f'<!-- START_INSIGHTS_FEED -->{insights_html}<!-- END_INSIGHTS_FEED -->', 
                     content, flags=re.DOTALL)

    with open(path, "w") as f:
        f.write(content)
    print("Lab & Insights synced.")

    # Inject
    content = re.sub(r'<!-- START_LAB_FEED -->.*?<!-- END_LAB_FEED -->', 
                     f'<!-- START_LAB_FEED -->{lab_html}<!-- END_LAB_FEED -->', 
                     content, flags=re.DOTALL)
    
    content = re.sub(r'<!-- START_INSIGHTS_FEED -->.*?<!-- END_INSIGHTS_FEED -->', 
                     f'<!-- START_INSIGHTS_FEED -->{insights_html}<!-- END_INSIGHTS_FEED -->', 
                     content, flags=re.DOTALL)

    with open(path, "w") as f:
        f.write(content)
    print("Lab & Insights synced successfully.")

if __name__ == "__main__":
    update_lab_page()
