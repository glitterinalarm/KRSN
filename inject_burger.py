import os
import glob
import re

html_files = glob.glob('*.html')

# We'll use markers to make it easy to update/remove
burger_html = """
<!-- BURGER_START -->
<div class="burger-icon" onclick="toggleMenu()">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
</div>
</nav>

<div id="mobile-menu" class="mobile-menu-overlay">
  <div class="mobile-menu-close" onclick="toggleMenu()">✕</div>
  <div class="mobile-menu-content">
    <a href="lab.html">Lab</a>
    <a href="insights.html">Insights</a>
    <a href="work.html">Works</a>
    <a href="studio.html">Studio</a>
    <a href="studio.html">Contact</a>
  </div>
</div>
<script id="burger-logic">
function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('active');
}
</script>
<!-- BURGER_END -->
"""

for filename in html_files:
    if filename in ["old_insights.html", "admin.html"]: continue
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Clean up any existing burger menu parts to ensure a fresh injection
    content = re.sub(r'<!-- BURGER_START -->.*?<!-- BURGER_END -->', '', content, flags=re.DOTALL)
    
    # 2. Clean up legacy versions from add_mobile_menu.py
    content = re.sub(r'<!-- Mobile Menu Overlay -->.*?<script>.*?const menuBtn = document\.getElementById\(\'mobile-menu-trigger\'\);.*?</script>', '', content, flags=re.DOTALL)
    
    # 3. Clean up other variations of the mobile menu and redundant markers
    content = re.sub(r'<div class="burger-icon".*?</div>', '', content, flags=re.DOTALL)
    # Target mobile-menu-overlay with any attribute order
    content = re.sub(r'<div[^>]*class="mobile-menu-overlay"[^>]*>.*?</div>\s*</div>', '', content, flags=re.DOTALL)
    content = re.sub(r'<div[^>]*id="mobile-menu"[^>]*class="mobile-menu-overlay"[^>]*>.*?</div>\s*</div>', '', content, flags=re.DOTALL)
    
    # Remove toggle script
    content = re.sub(r'<script id="burger-logic">.*?</script>', '', content, flags=re.DOTALL)
    content = re.sub(r'<script>\s*function toggleMenu\(\).*?\s*</script>', '', content, flags=re.DOTALL)
    
    # Remove lingering markers
    content = re.sub(r'<!-- BURGER_(START|END) -->', '', content)

    if "</nav>" in content:
        # Inject the new burger bundle by replacing the closing </nav>
        new_content = content.replace('</nav>', burger_html)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✓ {filename} updated with burger menu")
    else:
        print(f"✗ {filename} skipped (no </nav> tag found)")
