import requests
import feedparser
import os
import re

feeds = [
  { "name": "It's Nice That", "url": "https://www.itsnicethat.com/articles.rss", "category": "GRAPHISME" },
  { "name": "Ads of the World", "url": "https://www.adsoftheworld.com/feed", "category": "PUBLICITÉ" },
  { "name": "Motionographer", "url": "https://motionographer.com/feed/", "category": "INNOVATION" },
  { "name": "Highsnobiety", "url": "https://www.highsnobiety.com/feeds/rss", "category": "DROP" },
  { "name": "Dazed", "url": "https://www.dazeddigital.com/rss", "category": "TREND" },
  { "name": "We Are Social Global", "url": "https://wearesocial.com/feed/", "category": "SOCIAL MEDIA" },
  { "name": "Maginative", "url": "https://www.maginative.com/perspectives/rss/", "category": "IA CRÉATIVE" },
]

news_by_category = {}

for f in feeds:
    print(f"Fetching {f['name']}...")
    try:
        d = feedparser.parse(f['url'])
        if d.entries:
            entry = d.entries[0]
            img = None
            if 'media_content' in entry:
                img = entry.media_content[0]['url']
            elif 'media_thumbnail' in entry:
                img = entry.media_thumbnail[0]['url']
            elif 'description' in entry:
                matches = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', entry.description)
                if matches:
                    img = matches.group(1)
            
            # Fallback: Fetch OG image if RSS image is missing or is the generic placeholder
            if not img or "unsplash.com" in img:
                print(f"  Attempting OG fetch for {entry.link}")
                try:
                    og_res = requests.get(entry.link, timeout=5)
                    og_img_match = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']', og_res.text)
                    if og_img_match:
                        img = og_img_match.group(1)
                        print(f"  Found OG image: {img[:50]}...")
                except Exception as og_e:
                    print(f"  OG fetch failed: {og_e}")
            
            news_by_category[f['category']] = {
                "title": entry.title,
                "link": entry.link,
                "source": f['name'],
                "image": img or "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop"
            }
    except Exception as e:
        print(f"Error fetching {f['name']}: {e}")

# Build the grid HTML
grid_html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">\n'
for category, news in news_by_category.items():
    grid_html += f'''
    <div class="flex flex-col gap-6 group cursor-pointer" onclick="window.open('{news['link']}', '_blank')">
        <div class="aspect-video bg-surface-container-lowest overflow-hidden">
            <img src="{news['image']}" alt="{news['title']}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700">
        </div>
        <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
                <span class="text-[9px] font-label uppercase tracking-widest text-primary">{category}</span>
                <span class="text-[9px] font-label uppercase tracking-widest text-outline-variant">{news['source']}</span>
            </div>
            <h4 class="text-lg font-serif-italic leading-tight group-hover:text-primary transition-colors">{news['title']}</h4>
        </div>
    </div>
    '''
grid_html += '</div>'

# Inject into insights.html
path = "insights.html"
with open(path, "r") as f:
    content = f.read()

# 1. Inject Grid
# Pattern that matches either the original Stitch grid or our dynamic grid
grid_pattern = r'<!-- Editorial Grid -->\s*<section class="px-10 mb-32">\s*<div class="max-w-7xl mx-auto">.*?</div>\s*</section>'
grid_replacement = f'<!-- Editorial Grid -->\n<section class="px-10 mb-32">\n<div class="max-w-7xl mx-auto">\n<div class="mb-12 flex items-center justify-between border-b border-outline-variant pb-4">\n    <h3 class="font-label text-xs uppercase tracking-[0.4em]">Kérosène Daily Curation</h3>\n    <a href="https://veille-creative.vercel.app/" target="_blank" class="text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors">View All Transmissions →</a>\n</div>\n{grid_html}\n</div>\n</section>'
content = re.sub(grid_pattern, grid_replacement, content, flags=re.DOTALL)

# 2. Fetch Hero Data
hero_url = "https://2vfzwmqqws8h2xfv.public.blob.vercel-storage.com/editorial/hero.json"
print("Fetching Kérosène Hero...")
try:
    hero_res = requests.get(hero_url)
    hero_data = hero_res.json()
    if hero_data.get('enabled'):
        # Detect if we have a video
        hero_video = next((b['content'] for b in hero_data['blocks'] if b['type'] == 'youtube'), None)
        hero_img = next((b['content'] for b in hero_data['blocks'] if b['type'] == 'image'), news_by_category.get('IA CRÉATIVE', {}).get('image'))
        
        # If video exists, extract ID for thumbnail if image is missing
        if hero_video and not hero_img:
            video_id = None
            if "v=" in hero_video: video_id = hero_video.split("v=")[1].split("&")[0]
            elif "youtu.be/" in hero_video: video_id = hero_video.split("youtu.be/")[1].split("?")[0]
            if video_id:
                hero_img = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"

        hero_title = hero_data['title']
        hero_excerpt = hero_data['excerpt']
        hero_link = "https://veille-creative.vercel.app/article/manual-hero"
        hero_category = hero_data.get('category', 'EDITORIAL').upper()
        hero_date = "NEW TRANSMISSION"
        
        # Build Media Content (Image or Video Iframe)
        if hero_video:
            video_id = None
            if "v=" in hero_video: video_id = hero_video.split("v=")[1].split("&")[0]
            elif "youtu.be/" in hero_video: video_id = hero_video.split("youtu.be/")[1].split("?")[0]
            
            media_html = f'''<div class="aspect-[16/9] relative bg-black">
                <iframe class="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/{video_id}?autoplay=0&controls=1&rel=0&modestbranding=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>'''
        else:
            media_html = f'''<div class="aspect-[16/9] overflow-hidden">
<img alt="{hero_title}" class="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700" src="{hero_img}"/>
</div>'''

        # Inject Hero
        hero_pattern = r'<!-- Featured Article \(Bento Style\) -->\s*<section class="px-10 mb-32">.*?</section>'
        hero_html = f'''<!-- Featured Article (Bento Style) -->
<section class="px-10 mb-32">
<div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 border-collapse">
<!-- Large Feature -->
<div class="md:col-span-8 bg-surface-container-low group relative overflow-hidden">
{media_html}
<div class="p-10 cursor-pointer" onclick="window.open('{hero_link}', '_blank')">
<div class="flex items-center gap-4 mb-6">
<span class="text-primary font-label text-xs uppercase tracking-widest">{hero_category}</span>
<span class="text-outline-variant text-[10px] font-label">/ {hero_date}</span>
</div>
<h2 class="text-4xl md:text-5xl font-serif-italic mb-6 max-w-2xl">{hero_title}</h2>
<div class="w-12 h-[1px] bg-primary group-hover:w-full transition-all duration-500"></div>
</div>
</div>
<!-- Secondary Feature (Dynamic from Trends) -->
<div class="md:col-span-4 bg-surface-container flex flex-col justify-between p-10 border-l border-outline-variant/10">
<div>
<span class="text-primary font-label text-xs uppercase tracking-widest mb-6 block">Transmission Insights</span>
<h3 class="text-2xl font-serif-italic mb-4">{hero_title.split(':')[0]}</h3>
<p class="text-on-surface-variant text-sm leading-relaxed mb-8">
    {hero_excerpt}
</p>
</div>
<a class="font-label text-xs uppercase tracking-[0.2em] flex items-center gap-2 group" href="{hero_link}" target="_blank">
    Explore Entry
    <span class="material-symbols-outlined text-sm group-hover:translate-x-2 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</a>
</div>
</div>
</section>'''
        content = re.sub(hero_pattern, hero_html, content, flags=re.DOTALL)
except Exception as e:
    print(f"Error updating Hero: {e}")

with open(path, "w") as f:
    f.write(content)

print("Full Kérosène integration complete (Hero + Grid)")
