import re
import os

path = "dist/lab.html"
if not os.path.exists(path):
    print("dist/lab.html not found!")
    exit(0)

with open(path, "r") as f:
    content = f.read()

# We will replace the "Secondary: Spatial Logic" and the "Small: Micro Interaction/Asset" blocks
pattern = r'<!-- Bento Grid Experiments -->\s*<section class="px-10 mb-32">\s*<div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-\[auto\] md:h-\[900px\]">.*?</div>\s*</section>'

replacement = '''<!-- Bento Grid Experiments -->
<section class="px-10 mb-32">
<div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[auto] md:h-[900px]">
    <!-- Featured: Kerosene Webzine (Large) -->
    <div class="md:col-span-2 md:row-span-2 bg-surface-container p-12 flex flex-col justify-between border border-outline-variant/10 group cursor-pointer hover:bg-surface-container-high transition-all duration-700 relative overflow-hidden" onclick="window.open('https://kerosene-seven.vercel.app/', '_blank')">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.03] grayscale group-hover:scale-110 transition-transform duration-1000"></div>
        <div class="absolute right-0 top-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000"></div>
        <div class="relative z-10 flex justify-between items-start">
            <h4 class="font-body uppercase text-sm tracking-[0.4em] text-outline-variant">Laboratory Featured Project</h4>
            <span class="flex items-center gap-3 text-primary font-body text-xs uppercase tracking-[0.3em]">
                <span class="w-2 h-2 bg-primary animate-pulse"></span>
                ACTIVE AI ECOSYSTEM
            </span>
        </div>
        <div class="relative z-10">
            <h3 class="font-headline italic text-7xl md:text-8xl text-on-surface group-hover:text-primary transition-all duration-500">KÉROSÈNE</h3>
            <p class="text-on-surface-variant font-body text-lg mt-8 max-w-lg leading-relaxed font-light">
                Une plateforme de veille créative luxueuse, entièrement gérée en autonomie par des agents IA sur le sourcing et la rédaction d'articles.
            </p>
        </div>
        <div class="relative z-10 flex gap-6 mt-12">
            <div class="h-16 px-10 bg-surface-container-highest flex items-center justify-center border-l-4 border-primary transition-all group-hover:bg-white group-hover:text-black">
                <span class="font-body text-xs tracking-widest uppercase font-bold">Launch Webzine</span>
            </div>
            <div class="h-16 w-16 border border-outline-variant/20 flex items-center justify-center text-outline-variant group-hover:text-white transition-colors">
                <span class="material-symbols-outlined">arrow_outward</span>
            </div>
        </div>
    </div>

    <!-- Proxy Reading (Instagram) -->
    <div class="md:col-span-2 bg-surface-container-high p-8 flex flex-col justify-between border border-outline-variant/10 group cursor-pointer hover:bg-surface-container-highest transition-colors relative overflow-hidden" onclick="window.open('https://www.instagram.com/proxyreading/?hl=en', '_blank')">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.05] grayscale group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000"></div>
        <div class="relative z-10 flex justify-between items-start">
            <h4 class="font-body uppercase text-xs tracking-[0.2em] text-primary">Visual Research</h4>
            <span class="bg-surface-container-highest text-outline-variant text-[10px] px-2 py-1 uppercase tracking-widest border border-outline-variant/20">INSTAGRAM ARCHIVE</span>
        </div>
        <div class="relative z-10 py-10">
            <h3 class="font-headline italic text-4xl md:text-5xl text-on-surface group-hover:text-primary transition-colors">Relecture Contemporaine</h3>
            <p class="text-outline text-sm mt-4 leading-relaxed font-light">Redéfinition des peintures du passé à l'ère de l'intelligence visuelle.</p>
        </div>
        <div class="relative z-10 flex gap-4 items-center">
            <div class="w-8 h-[1px] bg-primary group-hover:w-16 transition-all duration-300"></div>
            <span class="font-body text-[10px] tracking-widest uppercase text-primary">Explorer le flux</span>
        </div>
    </div>

    <!-- TL3BDR (YouTube) -->
    <div class="md:col-span-2 bg-black/40 p-8 flex flex-col justify-between border border-outline-variant/10 group cursor-pointer hover:bg-black/80 transition-all duration-700 relative overflow-hidden" onclick="window.open('https://www.youtube.com/@TL3BDR', '_blank')">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 grayscale group-hover:scale-110 group-hover:opacity-20 transition-all duration-1000"></div>
        <div class="relative z-10 flex justify-between items-start">
            <h4 class="font-body uppercase text-xs tracking-[0.2em] text-primary">Teasing Project</h4>
            <span class="bg-red-600/20 text-red-500 text-[10px] px-2 py-1 uppercase tracking-widest font-bold border border-red-500/20">YOUTUBE TRANSMISSION</span>
        </div>
        <div class="relative z-10 py-10">
            <h3 class="font-headline italic text-4xl md:text-5xl text-on-surface group-hover:text-primary transition-colors">TL3BDR</h3>
            <p class="text-outline text-sm mt-4 max-w-md leading-relaxed font-light">
                Teasing visuel dédié aux nouvelles de Liu Cixin (Le Problème à Trois Corps).
            </p>
        </div>
        <div class="relative z-10 flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-3xl">play_circle</span>
            <span class="font-body text-xs tracking-widest uppercase text-primary">Regarder les épisodes</span>
        </div>
    </div>
</div>
</section>'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

if new_content != content:
    with open(path, "w") as f:
        f.write(new_content)
    print("Injected Kerosene block into lab.html")
else:
    print("Could not find the target block in lab.html")
