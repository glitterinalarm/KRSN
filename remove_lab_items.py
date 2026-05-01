
import sys
import re

file_path = 'lab.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Look for the lab-feed section
start_marker = '<!-- START_LAB_FEED -->'
end_marker = '<!-- END_LAB_FEED -->'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find lab feed markers")
    sys.exit(1)

feed_content = content[start_idx:end_idx]

# Pattern to match lab-item divs
item_pattern = re.compile(r'<div class="lab-item cursor-pointer".*?</div>\s*</div>', re.DOTALL)

items = list(item_pattern.finditer(feed_content))
print(f"Found {len(items)} lab items")

to_remove = []
for i, match in enumerate(items):
    item_text = match.group(0)
    if 'veille-creative.vercel.app' in item_text or 'youtube.com/@TL3BDR' in item_text:
        print(f"Item {i} matches removal criteria")
        to_remove.append(match)
    else:
        print(f"Item {i} does not match")

# Remove from back to front to preserve indices
new_feed_content = feed_content
for match in reversed(to_remove):
    new_feed_content = new_feed_content[:match.start()] + new_feed_content[match.end():]

new_content = content[:start_idx] + new_feed_content + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done")
