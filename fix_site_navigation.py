import os
import re
from bs4 import BeautifulSoup

dist_dirs = ['.', 'dist']
ignore_files = ['error.html', '404.html']

# The universal nav template (ISO Ref 02)
NAV_TEMPLATE = '''
<nav class="nav-classic">
    <div class="nav-links-left">
        <div class="nav-links">
            <a href="work.html">Works</a>
            <a href="lab.html">Lab</a>
        </div>
    </div>
    <div class="nav-brand-center">PARAFFINE</div>
    <div class="nav-links-right">
        <div class="nav-links">
            <a href="insights.html">Insights</a>
            <a href="studio.html">Studio</a>
            <a href="contact.html">Contact</a>
        </div>
    </div>
</nav>
'''

def fix_navigation(path, filename):
    with open(path, 'r') as f:
        content = f.read()
    
    # 1. Identify the existing nav and replace it
    soup = BeautifulSoup(content, 'html.parser')
    existing_nav = soup.find('nav')
    
    if existing_nav:
        new_nav = BeautifulSoup(NAV_TEMPLATE, 'html.parser').find('nav')
        existing_nav.replace_with(new_nav)
    else:
        if soup.body:
            new_nav = BeautifulSoup(NAV_TEMPLATE, 'html.parser').find('nav')
            soup.body.insert(0, new_nav)

    with open(path, 'w') as f:
        html = str(soup)
        f.write(html)

if __name__ == "__main__":
    for d in dist_dirs:
        if not os.path.exists(d): continue
        files = [f for f in os.listdir(d) if f.endswith('.html') and f not in ignore_files]
        for f in files:
            print(f"Applying Universal Nav to {d}/{f}...")
            try:
                fix_navigation(os.path.join(d, f), f)
            except Exception as e:
                print(f"  Error on {f}: {e}")
