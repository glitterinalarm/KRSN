import os
import re

dist_dir = "dist"
index_path = os.path.join(dist_dir, "index.html")

# 1. Extract nav from index.html
with open(index_path, "r") as f:
    index_content = f.read()

# Look for the nav block
nav_match = re.search(r'(<!-- Ultra-Minimalist Navigation -->\s*)?<nav.*?</nav>', index_content, re.DOTALL)
if not nav_match:
    print("Could not find nav in index.html")
    exit(1)

home_nav = nav_match.group(0)
print("Extracted home nav")

# 2. Apply to other files
files = [f for f in os.listdir(dist_dir) if f.endswith(".html") and f != "index.html"]

for filename in files:
    path = os.path.join(dist_dir, filename)
    with open(path, "r") as f:
        content = f.read()
    
    # Replace existing nav block (with or without comments)
    # This regex is broad enough to catch any <nav> block
    new_content = re.sub(r'(<!--.*?Navigation.*?-->\s*)?<nav.*?</nav>', home_nav, content, flags=re.DOTALL | re.IGNORECASE)
    
    with open(path, "w") as f:
        f.write(new_content)
    print(f"Unified nav in {filename}")
