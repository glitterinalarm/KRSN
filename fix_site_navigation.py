import os
import re
from bs4 import BeautifulSoup

dist_dir = 'dist'
files = [f for f in os.listdir(dist_dir) if f.endswith('.html')]

# The universal nav template (with invisible i18n support)
NAV_TEMPLATE = '''
<style>
/* Headless Google Translate */
.goog-te-banner-frame.skiptranslate { display: none !important; } 
body { top: 0px !important; }
.goog-tooltip { display: none !important; }
.goog-tooltip:hover { display: none !important; }
.goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
#google_translate_element { display: none !important; }
</style>
<nav class="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10 transition-all duration-300">
   <div class="flex justify-between items-center px-6 py-4 w-full max-w-full mx-auto">
    <div class="flex items-center gap-6">
        <a class="text-xl font-black tracking-widest text-white uppercase font-inter no-underline" href="index.html">
         PARAFFIN
        </a>
        <!-- Language Toggle Next To Logo -->
        <div class="hidden md:flex items-center gap-2 font-inter text-[9px] uppercase tracking-widest text-outline-variant border-l border-white/10 pl-6">
            <button onclick="switchLang('fr')" class="hover:text-primary transition-colors focus:outline-none" id="lang-fr">FR</button>
            <span class="opacity-30">/</span>
            <button onclick="switchLang('en')" class="hover:text-primary transition-colors focus:outline-none" id="lang-en">EN</button>
        </div>
    </div>
    
    <div class="hidden md:flex items-center gap-8 font-inter tracking-tighter uppercase text-xs font-light">
     <a class="text-gray-400 hover:text-white transition-all duration-300 no-underline" href="work.html#directed-by-humans" id="nav-human">By Human</a>
     <a class="text-gray-400 hover:text-white transition-all duration-300 no-underline" href="work.html#generative-systems" id="nav-ai">AI Native</a>
     <a class="text-gray-400 hover:text-white transition-all duration-300 no-underline" href="lab.html">Lab</a>
     <a class="text-gray-400 hover:text-white transition-all duration-300 no-underline" href="insights.html">Insights</a>
     <a class="text-gray-400 hover:text-white transition-all duration-300 no-underline" href="contact.html">Contact</a>
     <a href="contact.html" class="bg-white text-black px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:opacity-70 transition-opacity ml-4 no-underline">
      Inquire
     </a>
    </div>
    <div class="flex items-center gap-4 md:hidden">
        <!-- Mobile Lang Toggle -->
        <div class="flex items-center gap-2 font-inter text-[9px] uppercase tracking-widest text-outline-variant mr-4">
            <button onclick="switchLang('fr')" class="hover:text-primary transition-colors focus:outline-none">FR</button>
            <span class="opacity-30">/</span>
            <button onclick="switchLang('en')" class="hover:text-primary transition-colors focus:outline-none">EN</button>
        </div>
        <button class="text-white active:scale-95 duration-200" id="mobile-menu-trigger">
          <span class="material-symbols-outlined" data-icon="menu">menu</span>
        </button>
    </div>
   </div>
   
   <script type="text/javascript">
    function checkCurrentLang() {
        if(window.location.pathname.startsWith('/fr')) {
            document.querySelectorAll('#lang-fr').forEach(el => el.classList.add('text-primary'));
        } else {
            document.querySelectorAll('#lang-en').forEach(el => el.classList.add('text-primary'));
        }
    }
    
    function switchLang(lang) {
        var path = window.location.pathname;
        var file = path.split('/').pop();
        if(!file || file === 'fr') file = 'index.html';
        
        var isFr = path.startsWith('/fr');
        
        if(lang === 'fr' && !isFr) {
            window.location.href = '/fr/' + file;
        } else if (lang === 'en' && isFr) {
            window.location.href = '/' + file;
        }
    }
    
    document.addEventListener('DOMContentLoaded', checkCurrentLang);
   </script>
</nav>
'''

def fix_navigation(filename):
    path = os.path.join(dist_dir, filename)
    with open(path, 'r') as f:
        content = f.read()
    
    # 1. Identify the existing nav and replace it
    # We look for <nav ... </nav> across multiple lines
    soup = BeautifulSoup(content, 'html.parser')
    existing_nav = soup.find('nav')
    
    if existing_nav:
        # Create new nav from template
        new_nav = BeautifulSoup(NAV_TEMPLATE, 'html.parser').find('nav')
        
        # Adjust links active state if on specific page
        if filename == 'work.html':
            # Optionally highlight work related links
            pass
            
        existing_nav.replace_with(new_nav)
    else:
        # If no nav found, prepend to body
        if soup.body:
            new_nav = BeautifulSoup(NAV_TEMPLATE, 'html.parser').find('nav')
            soup.body.insert(0, new_nav)

    # 2. Fix the Mobile Menu Overlay links too for consistency
    mobile_menu = soup.find(id='mobile-menu')
    if mobile_menu:
        for a in mobile_menu.find_all('a'):
            href = a.get('href', '')
            if 'work' in href: a['href'] = 'work.html'
            elif 'index' in href or href == '/': a['href'] = 'index.html'

    with open(path, 'w') as f:
        # Use str(soup) to avoid prettify issues
        # But we remove extra whitespace that bs4 adds sometimes
        html = str(soup)
        # Fix: ensure no "pointer-events-none" is blocking the nav
        html = html.replace('pointer-events: none; z-index: 9999;', 'pointer-events: none; z-index: 40;')
        f.write(html)

for f in files:
    print(f"Applying Universal Nav to {f}...")
    try:
        fix_navigation(f)
    except Exception as e:
        print(f"  Error on {f}: {e}")
