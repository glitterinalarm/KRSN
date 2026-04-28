
import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html')]
if os.path.exists('fr'):
    files += [os.path.join('fr', f) for f in os.listdir('fr') if f.endswith('.html')]

inter_font_link = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet"/>'
inter_config = '"inter": ["Inter", "sans-serif"]'

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    modified = False
    
    # 1. Add Google Font link if missing
    if 'family=Inter' not in content:
        print(f"Adding Inter font link to {file_path}")
        content = re.sub(r'(<link[^>]*family=Newsreader[^>]*>)', r'\1\n<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet"/>', content)
        modified = True
    
    # 2. Add tailwind config if missing
    if '"inter":' not in content:
        print(f"Adding Inter to tailwind config in {file_path}")
        content = re.sub(r'("label":\s*\[[^\]]*\])', r'\1,\n                    "inter": ["Inter", "sans-serif"]', content)
        modified = True
        
    if modified:
        with open(file_path, 'w') as f:
            f.write(content)

print("Done.")
