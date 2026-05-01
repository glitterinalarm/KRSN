import os
import re

dist_dirs = [".", "fr"]
files = []
for d in dist_dirs:
    if os.path.exists(d):
        for f in os.listdir(d):
            if f.endswith(".html") and f not in ["admin.html", "error.html"]:
                files.append(os.path.join(d, f))

for path in files:
    with open(path, 'r') as f:
        content = f.read()

    # Replace occurrences of 2024 and 2025 with 2026
    new_content = re.sub(r'\b(2024|2025)\b', '2026', content)

    # Some specific replacements if needed
    # (e.g. Q4 2024 -> Q4 2026, Est. 2024 -> Est. 2026)

    # Some things might be part of an ID or URL like "202408", so the \b ensures we only replace standalone years.
    # What about v.2024.08?
    new_content = new_content.replace('v.2024.08', 'v.2026.08')
    new_content = new_content.replace('v.2025.', 'v.2026.')

    # Replace site names
    new_content = re.sub(r'\bPARAFFIN\.STUDIO\b', 'PRFFN', new_content, flags=re.IGNORECASE)
    new_content = re.sub(r'\bPRFFN\b', 'PRFFN', new_content, flags=re.IGNORECASE)
    new_content = re.sub(r'\bPARAFFIN\b', 'PRFFN', new_content)

    if new_content != content:
        with open(path, 'w') as f:
            f.write(new_content)
        print(f"Updated dates and names in {filename}")
