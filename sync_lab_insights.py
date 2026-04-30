import json
import os
import re

def get_work_media_html(urls, project_link=""):
    """Slideshow format with Video Hover support: 16/9 aspect ratio"""
    if not urls:
        return '<div class="bg-gray-100 flex items-center justify-center text-[9px] uppercase opacity-20">No Media</div>'

    # Flatten list if needed and filter
    all_urls = [u for url_list in urls for u in (url_list if isinstance(url_list, list) else [url_list]) if u]
    images = [u for u in all_urls if not any(x in u for x in ["youtube.com", "youtu.be", "vimeo.com"])]
    
    # Use the project_link or check if any of all_urls is a video
    video_url = project_link if any(x in project_link for x in ["youtube.com", "youtu.be", "vimeo.com"]) else ""
    if not video_url:
        videos = [u for u in all_urls if any(x in u for x in ["youtube.com", "youtu.be", "vimeo.com"])]
        if videos: video_url = videos[0]

    html = f'<div class="media-container relative overflow-hidden group">'
    
    # 1. Video Overlay (Hidden by default, shown on hover via JS/CSS)
    if video_url:
        vid_id = None
        if 'youtube.com' in video_url or 'youtu.be' in video_url:
            vid_id = re.search(r'v=([^&]+)', video_url).group(1) if 'v=' in video_url else video_url.split('/')[-1]
            video_embed = f"https://www.youtube.com/embed/{vid_id}?autoplay=1&mute=1&loop=1&playlist={vid_id}&controls=0&showinfo=0&rel=0&disablekb=1"
        elif 'vimeo.com' in video_url:
            vid_id = video_url.split('/')[-1]
            video_embed = f"https://player.vimeo.com/video/{vid_id}?autoplay=1&muted=1&background=1&loop=1"
        
        if vid_id:
            html += f'''
            <div class="video-hover-container absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 pointer-events-none">
                <iframe class="w-full h-full object-contain" data-src="{video_embed}" frameborder="0" allow="autoplay; encrypted-media"></iframe>
            </div>'''

    # 2. Base Image / Slideshow
    if len(images) > 1:
        slides_html = ""
        for i, url in enumerate(images):
            slides_html += f'<div class="slideshow-item absolute inset-0 transition-opacity duration-1000" style="opacity: { "1" if i == 0 else "0" }; z-index: { 1 if i == 0 else 0 };" data-index="{i}"><img src="{url}" class="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700"></div>'
        html += f'<div class="slideshow-container absolute inset-0" data-count="{len(images)}">{slides_html}</div>'
    elif images:
        html += f'<img src="{images[0]}" class="absolute inset-0 w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700">'
    
    html += '</div>'
    return html

def get_lab_media_html(urls):
    """Lab format: 16/9 aspect ratio as requested by user"""
    if not urls:
        return '<div class="bg-gray-100 aspect-video flex items-center justify-center text-[9px] uppercase opacity-20">No Media</div>'

    urls = [u for url_list in urls for u in (url_list if isinstance(url_list, list) else [url_list]) if u]
    images = [u for u in urls if not any(x in u for x in ["youtube.com", "youtu.be", "vimeo.com"])]
    videos = [u for u in urls if any(x in u for x in ["youtube.com", "youtu.be", "vimeo.com"])]

    html = f'<div class="media-container relative w-full overflow-hidden mb-6 group">'
    
    if videos:
        vid_id = videos[0].split("v=")[1].split("&")[0] if "v=" in videos[0] else videos[0].split("/")[-1]
        html += f'''
        <div class="video-overlay absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none">
            <iframe class="w-full h-full grayscale hover:grayscale-0 transition-all duration-700" src="https://www.youtube.com/embed/{vid_id}?autoplay=1&mute=1&loop=1&playlist={vid_id}&controls=0&showinfo=0&rel=0&disablekb=1" frameborder="0" allow="autoplay; encrypted-media"></iframe>
        </div>'''

    if len(images) > 1:
        slides_html = ""
        for i, url in enumerate(images):
            slides_html += f'<div class="slideshow-item absolute inset-0 transition-opacity duration-1000" style="opacity: { "1" if i == 0 else "0" }; z-index: { 1 if i == 0 else 0 };" data-index="{i}"><img src="{url}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"></div>'
        html += f'<div class="slideshow-container absolute inset-0" data-count="{len(images)}">{slides_html}</div>'
    elif len(images) == 1:
        html += f'<img src="{images[0]}" class="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700">'
    
    html += '</div>'
    return html

def inject_script(content):
    script = '''
  <!-- SLIDESHOW_ENGINE_START -->
  <script id="slideshow-logic">
    function initSlideshows() {
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
    
    function initVideoHovers() {
        document.querySelectorAll('.media-container').forEach(container => {
            const videoContainer = container.querySelector('.video-hover-container');
            if (!videoContainer) return;
            const iframe = videoContainer.querySelector('iframe');
            
            container.addEventListener('mouseenter', () => {
                if (iframe && iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                }
            });
            
            container.addEventListener('mouseleave', () => {
                if (iframe) iframe.src = '';
            });
        });
    }

    function initAll() {
        initSlideshows();
        initVideoHovers();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
  </script>
  <!-- SLIDESHOW_ENGINE_END -->'''
    content = re.sub(r'<!-- SLIDESHOW_ENGINE_START -->.*?<!-- SLIDESHOW_ENGINE_END -->', '', content, flags=re.DOTALL)
    content = re.sub(r'<script id="slideshow-logic">.*?</script>', '<!-- REMOVED -->', content, flags=re.DOTALL)
    content = content.replace('<!-- REMOVED -->', '')
    return content.replace('</body>', f'{script}\n</body>')

def update_pages():
    if not os.path.exists("site_data.json"):
        return

    try:
        with open("site_data.json", "r", encoding="utf-8") as f:
            site_data = json.load(f)
    except UnicodeDecodeError:
        with open("site_data.json", "r", encoding="latin-1") as f:
            site_data = json.load(f)

    # 1. WORKS (GALLERY)
    work_html = ""
    for item in site_data.get("works", []):
        images = item.get('images', [item.get('image', '')])
        # Filter and generate the media (slideshow or single image)
        media = get_work_media_html(images, item.get('link', ''))
        
        work_html += f'''
        <div class="work-gallery-item">
            {media}
            <div class="work-caption">
                <h3 class="text-2xl font-black uppercase">{item['title']}</h3>
                <div class="flex justify-between items-baseline opacity-40">
                    <span class="label-mono uppercase">{item.get('year', '2026')} / {item.get('category', 'BRANDING')}</span>
                </div>
            </div>
        </div>'''

    # 2. LAB (16/9)
    lab_html = ""
    for i, item in enumerate(site_data.get("lab", [])):
        images = item.get('images', [item.get('image', '')])
        media = get_lab_media_html(images)
        lab_html += f'''
                <div class="lab-item cursor-pointer" onclick="window.open('{item['link']}', '_blank')">
                    {media}
                    <div class="flex justify-between items-baseline">
                        <div>
                            <div class="text-[9px] opacity-40 uppercase tracking-widest mb-1">{item.get('category', 'RESEARCH')} // {item.get('id', i+1)}</div>
                            <h3 class="text-2xl font-bold uppercase">{item.get('title', 'UNTITLED')}</h3>
                        </div>
                    </div>
                </div>'''

    # 3. INSIGHTS
    insights_html = ""
    for item in site_data.get("insights", []):
        insights_html += f'''
                <div class="insight-item">
                    <img class="w-full aspect-[21/9] object-cover mb-6" src="{item['image']}"/>
                    <div class="insight-content">
                        <div class="text-[9px] opacity-40 uppercase tracking-widest mb-4">{item['title']}</div>
                        <h3 class="text-3xl font-bold uppercase leading-tight mb-4">{item['description'][:60]}...</h3>
                        <p class="text-sm opacity-60 leading-relaxed mb-6">Latest transmission from the creative front.</p>
                        <a class="text-[9px] font-bold uppercase tracking-widest border-b border-black pb-1 hover:opacity-50 transition-opacity" href="{item['link']}" target="_blank">READ DEEP DIVE ></a>
                    </div>
                </div>'''

    # INJECTION
    if os.path.exists("work.html"):
        with open("work.html", "r", encoding="utf-8") as f: content = f.read()
        if "<!-- GALLERY_START -->" in content and "<!-- GALLERY_END -->" in content:
            parts = content.split("<!-- GALLERY_START -->")
            rest = parts[1].split("<!-- GALLERY_END -->")
            content = parts[0] + "<!-- GALLERY_START -->\n" + work_html + "\n    <!-- GALLERY_END -->" + rest[1]
            content = inject_script(content)
            with open("work.html", "w", encoding="utf-8") as f: f.write(content)
            print("✓ work.html updated (GALLERY)")

    if os.path.exists("lab.html"):
        with open("lab.html", "r", encoding="utf-8") as f: content = f.read()
        if "<!-- START_LAB_FEED -->" in content and "<!-- END_LAB_FEED -->" in content:
            parts = content.split("<!-- START_LAB_FEED -->")
            rest = parts[1].split("<!-- END_LAB_FEED -->")
            content = parts[0] + "<!-- START_LAB_FEED -->\n" + lab_html + "\n<!-- END_LAB_FEED -->" + rest[1]
        content = inject_script(content)
        with open("lab.html", "w", encoding="utf-8") as f: f.write(content)
        print("✓ lab.html updated (16/9)")

if __name__ == "__main__":
    update_pages()
