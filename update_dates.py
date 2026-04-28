import os
import re

dist_dir = 'dist'
files = [f for f in os.listdir(dist_dir) if f.endswith('.html')]

for filename in files:
    path = os.path.join(dist_dir, filename)
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
    new_content = re.sub(r'\bJTFL\.STUDIO\b', 'JTFL', new_content, flags=re.IGNORECASE)
    new_content = re.sub(r'\bJTFL Studio\b', 'JTFL', new_content, flags=re.IGNORECASE)
    new_content = re.sub(r'\bJTFL\b', 'JTFL', new_content)

    if new_content != content:
        with open(path, 'w') as f:
            f.write(new_content)
        print(f"Updated dates and names in {filename}")
