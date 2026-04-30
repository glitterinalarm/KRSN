import os
import glob

html_files = glob.glob('*.html')

burger_html = """
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
    <a href="contact.html">Contact</a>
  </div>
</div>
<script>
function toggleMenu() {
  document.getElementById('mobile-menu').classList.toggle('active');
}
</script>
"""

for filename in html_files:
    if filename == "old_insights.html": continue
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "mobile-menu-overlay" in content:
        print(f"Skipping {filename}, already has burger menu")
        continue

    # Replace the closing </nav> with the burger menu + closing </nav> + overlay html
    new_content = content.replace('</nav>', burger_html)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Updated {filename}")
