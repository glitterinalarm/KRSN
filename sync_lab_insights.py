import re
import os
import requests
from bs4 import BeautifulSoup

def fetch_kerosene_insights():
    url = "https://veille-creative.vercel.app/"
    fallback_articles = [
        {
            'title': 'THE DEATH OF THE PIXEL',
            'link': 'https://veille-creative.vercel.app/insights/the-death-of-the-pixel',
            'img': 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800',
            'meta': 'EDITORIAL // 2026',
            'summary': 'Exploring the shift from rasterized assets to infinite generative fidelity.'
        },
        {
            'title': 'SYNTHETIC CULTURE',
            'link': 'https://veille-creative.vercel.app/insights/synthetic-culture',
            'img': 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800',
            'meta': 'RESEARCH // 2026',
            'summary': 'How AI archives are redefining our relationship with brand heritage.'
        },
        {
            'title': 'PRIVATE ISLAND',
            'link': 'https://veille-creative.vercel.app/insights/private-island',
            'img': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800',
            'meta': 'CURATED // 2026',
            'summary': 'The emergence of isolated creative ecosystems in the age of mass AI.'
        }
    ]
    
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        articles = []
        # Look for the main article feed container
        # On Kerosene, articles are often in 'div.group' inside a main feed
        cards = soup.select('div.group, article')
        for card in cards:
            title_el = card.select_one('h3, h2')
            if not title_el: continue
            
            title = title_el.get_text(strip=True)
            link = card.select_one('a')
            href = link['href'] if link and 'href' in link.attrs else "#"
            if not href.startswith('http') and href != "#":
                href = url.rstrip('/') + '/' + href.lstrip('/')
                
            img = card.select_one('img')
            img_src = img['src'] if img and 'src' in img.attrs else "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800"
            if not img_src.startswith('http'):
                img_src = url.rstrip('/') + '/' + img_src.lstrip('/')
            
            meta = card.select_one('span, div.text-xs, p.text-xs')
            meta_text = meta.get_text(strip=True) if meta else "EDITORIAL // 2026"
            
            summary = card.select_one('p')
            summary_text = summary.get_text(strip=True) if summary else "Strategic perspectives on the future of creative direction."
            
            articles.append({
                'title': title,
                'link': href,
                'img': img_src,
                'meta': meta_text,
                'summary': summary_text
            })
            if len(articles) >= 6: break
            
        return articles if articles else fallback_articles
    except Exception as e:
        print(f"Error fetching Kerosene: {e}")
        return fallback_articles

def update_lab_page():
    path = "lab.html"
    if not os.path.exists(path): return
    
    with open(path, "r") as f:
        content = f.read()

    # 1. LAB FEED (STATIC LINKS)
    lab_items = [
        {
            'title': 'KÉROSÈNE RSS',
            'meta': 'AI CURATED // WEBZINE',
            'img': 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800',
            'link': 'https://veille-creative.vercel.app/'
        },
        {
            'title': 'TLDR CREATIVE',
            'meta': 'INSTAGRAM // ARCHIVE',
            'img': 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800',
            'link': 'https://www.instagram.com/tldr_creative/'
        },
        {
            'title': 'PROXY READING',
            'meta': 'VISUAL RESEARCH // INSTA',
            'img': 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800',
            'link': 'https://www.instagram.com/proxyreading/'
        },
        {
            'title': 'CELLULAR TYPOS',
            'meta': 'GENERATIVE // EXPERIMENT',
            'img': 'https://images.unsplash.com/photo-1635314150640-3023e1075678?auto=format&fit=crop&w=800',
            'link': 'lab.html#cellular' # Placeholder for internal experiment
        }
    ]
    
    lab_html = ""
    for item in lab_items:
        lab_html += f'''
                <div class="lab-item cursor-pointer" onclick="window.open('{item['link']}', '_blank')">
                    <img src="{item['img']}">
                    <div class="flex justify-between items-baseline">
                        <div>
                            <div class="text-[9px] opacity-40 uppercase tracking-widest mb-1">{item['meta']}</div>
                            <h3 class="text-2xl font-bold uppercase">{item['title']}</h3>
                        </div>
                    </div>
                </div>'''

    # 2. INSIGHTS FEED (DYNAMIC)
    insights = fetch_kerosene_insights()
    insights_html = ""
    for art in insights:
        insights_html += f'''
                <div class="insight-item">
                    <img src="{art['img']}">
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
    print("Lab & Insights synced successfully.")

if __name__ == "__main__":
    update_lab_page()
