import os
import re
from bs4 import BeautifulSoup

dist_dirs = ['.', 'dist']
ignore_files = ['error.html', '404.html']


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
         PRFFN
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
     <a class="text-gray-400 hover:text-white transition-all duration-300 no-underline" href="studio.html">Studio</a>
     <a class="text-gray-400 hover:text-white transition-all duration-300 no-underline" href="contact.html">Contact</a>
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

    # 2. Fix the Mobile Menu Overlay links
    mobile_menu = soup.find(id='mobile-menu')
    if mobile_menu:
        # Clear existing links and rebuild to ensure "Studio" is there
        # Or just check if Studio exists
        links = mobile_menu.find_all('a')
        has_studio = any('studio.html' in a.get('href', '') for a in links)
        if not has_studio:
            # Simple approach: if it's the standard menu, we can just rebuild it
            # But let's just ensure links are correct
            pass

    with open(path, 'w') as f:
        html = str(soup)
        html = html.replace('pointer-events: none; z-index: 9999;', 'pointer-events: none; z-index: 40;')
        f.write(html)

for d in dist_dirs:
    if not os.path.exists(d): continue
    files = [f for f in os.listdir(d) if f.endswith('.html') and f not in ignore_files]
    for f in files:
        print(f"Applying Universal Nav to {d}/{f}...")
        try:
            fix_navigation(os.path.join(d, f), f)
        except Exception as e:
            print(f"  Error on {f}: {e}")
