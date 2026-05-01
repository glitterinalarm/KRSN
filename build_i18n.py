import os
import shutil
import re

dist_dir = '.'
fr_dir = 'fr'

if not os.path.exists(fr_dir):
    os.makedirs(fr_dir)

files = [f for f in os.listdir(dist_dir) if f.endswith('.html') and f not in ['admin.html', 'error.html', '404.html']]

dictionary = {
    # Manifesto & Navigation items avoided intentionally
    r'\bWe build autonomous systems\b': 'Nous construisons des systèmes autonomes',
    r'Creative Direction\.': 'Direction Créative.',
    r'\s+High-Velocity Production\.': ' Production Haute Vélocité.',
    r'From high-level scripting to pixel-perfect asset generation\. Augmented by AI\. Coded for speed\.': 'Du scripting de haut niveau à la génération d\'assets au pixel près. Augmenté par l\'IA. Codé pour la vitesse.',
    
    # Lab
    r"This is where I test what hasn't been done yet\. Whether it's designing websites through vibe coding or prototyping new visual concepts, this space is my R&amp;D engine\.": "C'est ici que je teste ce qui n'a pas encore été fait. Qu'il s'agisse de concevoir des sites web en vibe coding ou de prototyper de nouveaux concepts visuels, cet espace est mon moteur de recherche et développement.",
    r'\bIn Progress\b': 'En Développement',
    r'\bView Source\b': 'Voir la Source',
    r'\bTechnical Logs\b': 'Journaux Techniques',
    
    # Work page translations
    r'Creating is not just about filling a space or following a trend: it is about solving a problem, conveying an emotion, and building a solid identity\.': "Créer ne se résume pas à remplir un espace ou à suivre une tendance : il s'agit de résoudre un problème, de transmettre une émotion et de construire une identité solide.",
    r'Two Ways of Working': 'Deux Approches',
    r'Strategic Orchestration &amp; Creative Direction': 'Orchestration Stratégique &amp; Direction Créative',
    r'Generative Systems &amp; High-Fidelity AI Outputs': 'Systèmes Génératifs &amp; Rendus IA Haute Fidélité',
    r'AI as a technical lever to explore previously inaccessible visual territories\.': "l’IA comme un levier technique pour explorer des territoires visuels inaccessibles jusqu'ici.",
    r'IMAGE &amp; VIDEO GENERATION': 'GÉNÉRATION IMAGE &amp; VIDÉO',
    r'IMAGE & VIDEO GENERATION': 'GÉNÉRATION IMAGE & VIDÉO',
    r'Crafting a poetic, digital-first atmosphere for the': 'Création d\'une atmosphère poétique et digitale pour les',
    r'\.\s*We engineered an immersive visual identity to tease the event, blending dreamlike aesthetics with high-end motion to invite visitors in': '. Nous avons conçu une identité visuelle immersive pour teaser l\'événement, mêlant esthétique onirique et direction artistique de pointe pour inviter les visiteurs.',
    r'GENERATIVE IMAGE \+ MUSIC': 'IMAGE GÉNÉRATIVE + MUSIQUE',
    r'An aesthetic fusion of product photography and generative sound\. We designed a high-fidelity product shoot steeped in': 'Une fusion esthétique entre photographie de produit et son génératif. Nous avons imaginé un set design haute fidélité empreint de nostalgie',
    r',\s*paired with a custom AI-generated soundtrack to create a cohesive,': ', associé à une bande-son générée sur-mesure par l\'IA pour créer une narration cohérente,',
    r'\bCOMPLETE WORKFLOW\b': 'WORKFLOW COMPLET',
    r'A full-spectrum production pipeline\.': 'Un pipeline de production complet.',
    r'We orchestrated a complete AI workflow\s*transitioning from initial ideation and generative sketches to photorealistic masters—finalized with': 'Nous avons orchestré un workflow IA intégral allant de l\'idéation initiale et d\'esquisses génératives aux masters photoréalistes—finalisé avec',
    r'Ready to build the future\?': 'Prêt à construire le futur ?',
    r'Brief us on your next production': 'Confiez-nous votre prochain brief',
    
    # Navigation
    r'By Human': "Par l'Humain",
    r'AI Native': 'IA Native',
    r'Laboratory': 'Laboratoire',
    r'\bWork\b': 'Travaux',
    r'\bWorks\b': 'Travaux',
    r'\bLab\b': 'Lab',
    r'\bInsights\b': 'Insights',
    r'\bStudio\b': 'Studio',
    r'\bContact\b': 'Contact',
    r'\bHome\b': 'Accueil',
}

for filename in files:
    src_path = os.path.join(dist_dir, filename)
    dst_path = os.path.join(fr_dir, filename)
    
    with open(src_path, 'r') as f:
        content = f.read()
        
    # Translate content
    fr_content = content
    for eng, fr in dictionary.items():
        fr_content = re.sub(eng, fr, fr_content)
        
    # Switch language toggle active state and links
    # For FR page: EN points to ../filename, FR is active
    nav_pattern = r'<!-- Language Toggle -->(.*?)</div>'
    
    # We will let a client-side simple script handle the switch so we don't hardcode paths which break if they jump directories.
    
    # Actually, let's fix the links inside the FR folder to point to root for EN
    # Add a base tag or update hrefs?
    # Simple href fix for standard links: href="work.html" -> href="work.html" is fine since they are in the same folder.
    # But for going back to EN:
    
    # Safety: rewrite relative links so that Vercel trailing slash behavior doesn't break navigation in the /fr/ folder
    fr_content = re.sub(r'href="([^"]+\.html)(#[^"]*)?"', r'href="/fr/\1\2"', fr_content)
    
    # Fix asset paths for CSS and Favicon
    fr_content = fr_content.replace('href="monolith.css"', 'href="../monolith.css"')
    fr_content = fr_content.replace('href="/favicon.png"', 'href="../favicon.png"')
    fr_content = fr_content.replace('src="/favicon.png"', 'src="../favicon.png"')
    
    with open(dst_path, 'w') as f:
        f.write(fr_content)
    
print("Created /fr pages.")
