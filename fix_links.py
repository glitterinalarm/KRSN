import os
import re

dist_dirs = [".", "fr"]
files = []
for d in dist_dirs:
    if os.path.exists(d):
        for f in os.listdir(d):
            if f.endswith(".html") and f not in ["admin.html", "error.html"]:
                files.append(os.path.join(d, f))

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

for path in files:
    with open(path, "r") as f:
        content = f.read()
    
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
    
    with open(path, "w") as f:
        f.write(content)
    print(f"Updated {filename}")
