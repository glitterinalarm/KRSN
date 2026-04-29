import requests
import feedparser
import os
import re

# We reuse the feed logic from the main site
feeds = [
  { "name": "It's Nice That", "url": "https://www.itsnicethat.com/articles.rss", "category": "GRAPHISME" },
  { "name": "Ads of the World", "url": "https://www.adsoftheworld.com/feed", "category": "PUBLICITÉ" },
  { "name": "Motionographer", "url": "https://motionographer.com/feed/", "category": "INNOVATION" },
]

news_items = []

for f in feeds:
    print(f"Fetching {f['name']} for Monolith...")
    try:
        d = feedparser.parse(f['url'])
        if d.entries:
            entry = d.entries[0]
            news_items.append({
                "title": entry.title,
                "link": entry.link,
                "source": f['name'],
                "date": "LATEST",
                "desc": entry.get('summary', '')[:120] + "..."
            })
    except Exception as e:
        print(f"Error: {e}")

# Build the Matrix HTML for Monolith
matrix_html = ''
for item in news_items[:3]:
    matrix_html += f'''
    <div style="border-left: 1px solid var(--electric-green); padding-left: 1.5rem; transition: all 0.5s;" class="insight-card">
        <div style="font-family: var(--font-mono); font-size: 9px; color: var(--electric-green); margin-bottom: 0.5rem; opacity: 0.7;">[ {item['source']} // {item['date']} ]</div>
        <h4 style="font-family: var(--font-serif); font-size: 1.3rem; margin-bottom: 1rem; line-height: 1.2;">{item['title']}</h4>
        <p style="font-family: var(--font-inter); font-size: 11px; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem;">{item['desc']}</p>
        <a href="{item['link']}" target="_blank" style="font-family: var(--font-mono); font-size: 9px; color: white; text-decoration: none; border: 1px solid rgba(255,255,255,0.2); padding: 5px 10px;">READ_INSIGHT_</a>
    </div>
    '''

# Inject into monolith.html
path = "monolith.html"
if os.path.exists(path):
    with open(path, "r") as f:
        content = f.read()

    # Target the feed container
    pattern = r'<div id="insights-feed".*?>(.*?)</div>'
    replacement = f'<div id="insights-feed" style="margin-top: 2rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">\n{matrix_html}\n</div>'
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(path, "w") as f:
        f.write(new_content)
    print("Monolith Insights synchronized.")
else:
    print("Error: monolith.html not found.")
