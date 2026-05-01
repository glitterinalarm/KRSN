import os
import re

dist_dirs = [".", "fr"]
files = []
for d in dist_dirs:
    if os.path.exists(d):
        for f in os.listdir(d):
            if f.endswith(".html") and f not in ["admin.html", "error.html"]:
                files.append(os.path.join(d, f))

mobile_menu_html = '''
<!-- Mobile Menu Overlay -->
<div id="mobile-menu" class="fixed inset-0 z-[100] flex flex-col justify-center items-center gap-12 transition-all duration-500 opacity-0 pointer-events-none md:hidden" style="background-color: rgba(0,0,0,0.95);">
    <button id="close-menu" class="absolute top-8 right-10 material-symbols-outlined text-white text-3xl">close</button>
    <a href="index.html" class="text-4xl font-serif-italic text-white hover:text-primary transition-colors">Home</a>
    <a href="work.html" class="text-4xl font-serif-italic text-white hover:text-primary transition-colors">Work</a>
    <a href="lab.html" class="text-4xl font-serif-italic text-white hover:text-primary transition-colors">Laboratory</a>
    <a href="insights.html" class="text-4xl font-serif-italic text-white hover:text-primary transition-colors">Insights</a>
    <a href="contact.html" class="text-4xl font-serif-italic text-white hover:text-primary transition-colors">Contact</a>
</div>

<script>
    const menuBtn = document.getElementById('mobile-menu-trigger');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeBtn = document.getElementById('close-menu');
    const menuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

    function toggleMenu() {
        mobileMenu.classList.toggle('opacity-0');
        mobileMenu.classList.toggle('pointer-events-none');
        document.body.classList.toggle('overflow-hidden');
    }

    if (menuBtn && mobileMenu) menuBtn.addEventListener('click', toggleMenu);
    if (closeBtn && mobileMenu) closeBtn.addEventListener('click', toggleMenu);
    
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('opacity-0');
            mobileMenu.classList.add('pointer-events-none');
            document.body.classList.remove('overflow-hidden');
        });
    });
</script>
'''

for path in files:
    with open(path, "r") as f:
        content = f.read()
    
    # Inject before </body>
    if '</body>' in content:
        new_content = content.replace('</body>', f'{mobile_menu_html}</body>')
        with open(path, "w") as f:
            f.write(new_content)
    print(f"Added mobile menu to {filename}")
