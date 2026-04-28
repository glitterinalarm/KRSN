import os
import re

dist_dir = "dist"
files = [f for f in os.listdir(dist_dir) if f.endswith(".html")]

replacements = [
    # Logo Home Link
    (r'<div([^>]*)class="([^"]*font-black[^"]*)"([^>]*)>PRFFN(\.STUDIO)?</div>', r'<a href="/" \1class="\2" \3>PRFFN\4</a>'),
    
    # Menu Links
    (r'href="#"([^>]*)>Lab</a>', r'href="/lab"\1>Lab</a>'),
    (r'href="#"([^>]*)>Insights</a>', r'href="/insights"\1>Insights</a>'),
    (r'href="#"([^>]*)>Contact</a>', r'href="/contact"\1>Contact</a>'),
    
    # Footer/Others
    (r'href="#"([^>]*)>Laboratory</a>', r'href="/lab"\1>Laboratory</a>'),
    (r'href="#"([^>]*)>Journal</a>', r'href="/insights"\1>Journal</a>'),
    (r'href="#"([^>]*)>Studio</a>', r'href="/"\1>Studio</a>'),
]

for filename in files:
    path = os.path.join(dist_dir, filename)
    with open(path, "r") as f:
        content = f.read()
    
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
    
    with open(path, "w") as f:
        f.write(content)
    print(f"Updated {filename}")
