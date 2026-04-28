
import os
import re

files_config = {
    'index.html': {
        'title': 'PRFFN — Creative Direction & Digital Production',
        'desc': 'Leading-edge creative direction and digital production for the architectural future of the web. Augmented by AI, directed by humans.'
    },
    'work.html': {
        'title': 'Selected Projects — PRFFN',
        'desc': 'A curation of high-end digital productions, from generative systems to human-directed creative leadership.'
    },
    'lab.html': {
        'title': 'Laboratory & Experiments — PRFFN',
        'desc': 'Experimental research in spatial logic, generative typography, and AI-native ecosystems.'
    },
    'insights.html': {
        'title': 'Insights & Transmissions — PRFFN',
        'desc': 'Critical reflections on the intersection of human intentionality, autonomous systems, and the architectural future of the web.'
    },
    'contact.html': {
        'title': 'Contact — PRFFN',
        'desc': 'Connect with PRFFN for global transmissions and high-end creative partnerships.'
    },
    'privacy.html': {
        'title': 'Privacy Policy — PRFFN',
        'desc': 'Privacy and data protection policies for the PRFFN platform.'
    },
    'terms.html': {
        'title': 'Terms of Service — PRFFN',
        'desc': 'Terms and conditions for using the PRFFN platform.'
    }
}

fr_files_config = {
    'fr/index.html': {
        'title': 'PRFFN — Direction Créative & Production Digitale',
        'desc': 'Direction créative d\'avant-garde et production digitale pour le futur architectural du web. Augmenté par l\'IA, dirigé par l\'humain.'
    },
    'fr/work.html': {
        'title': 'Projets Sélectionnés — PRFFN',
        'desc': 'Une sélection de productions digitales haut de gamme, des systèmes génératifs au leadership créatif.'
    },
    'fr/lab.html': {
        'title': 'Laboratoire & Expérimentations — PRFFN',
        'desc': 'Recherche expérimentale en logique spatiale, typographie générative et écosystèmes IA-natifs.'
    },
    'fr/insights.html': {
        'title': 'Insights & Transmissions — PRFFN',
        'desc': 'Réflexions critiques sur l\'intersection de l\'intentionnalité humaine, des systèmes autonomes et du futur architectural du web.'
    },
    'fr/contact.html': {
        'title': 'Contact — PRFFN',
        'desc': 'Contactez PRFFN pour des transmissions mondiales et des partenariats créatifs haut de gamme.'
    }
}

# Merge configs
all_configs = {**files_config, **fr_files_config}

og_image = "https://lh3.googleusercontent.com/aida-public/AB6AXuDKZoscx-d3NfMH2HMTJY_UTKS-SohAG2LaVlC5LR9uaewqgo32t-HkeYbm5mgZHTecMPjIpPKTUjOfc15wv4Tf8ZeTpqN0_U8zAPndCZ3s9Fq9Kr-zs3Ml8znkx0NIeczdkgQCu22pvZfIlyD5PkBcwmv9Llk6c6rDtyx8H_Pp2fT22u0d3pSO_QWpD_8SjwXvc3q3aLgnbdxPYcZaYotB3LmKw480VkfLSbc8VLJD-J-IMDGvVegUEMhuiOX8sw4cgV9QrdStvGQX"

for path, config in all_configs.items():
    if not os.path.exists(path):
        continue
        
    with open(path, 'r') as f:
        content = f.read()
        
    # Remove existing title/meta if any
    content = re.sub(r'<title>.*?</title>', '', content)
    content = re.sub(r'<meta name="description".*?>', '', content)
    content = re.sub(r'<meta property="og:.*?>', '', content)
    
    # Inject SEO block
    seo_block = f"""
    <title>{config['title']}</title>
    <meta name="description" content="{config['desc']}"/>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website"/>
    <meta property="og:url" content="https://krsn.vercel.app/{path}"/>
    <meta property="og:title" content="{config['title']}"/>
    <meta property="og:description" content="{config['desc']}"/>
    <meta property="og:image" content="{og_image}"/>

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image"/>
    <meta property="twitter:url" content="https://krsn.vercel.app/{path}"/>
    <meta property="twitter:title" content="{config['title']}"/>
    <meta property="twitter:description" content="{config['desc']}"/>
    <meta property="twitter:image" content="{og_image}"/>
    
    <link rel="icon" type="image/png" href="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=32&auto=format&fit=crop"/>
    """
    
    # Insert after <head>
    content = content.replace('<head>', '<head>' + seo_block)
    
    # Fix missing alt tags for images
    content = re.sub(r'<img(?!.*?alt=)([^>]+)>', rf'<img alt="{config["title"]}" \1>', content)
    
    with open(path, 'w') as f:
        f.write(content)
        
    print(f"SEO Updated for {path}")

print("SEO Finalization Complete.")
