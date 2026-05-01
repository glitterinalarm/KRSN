import sys

path = '/Users/trillatgermain/.gemini/antigravity/scratch/krsn-studio/lab.html'
with open(path, 'r') as f:
    lines = f.readlines()

new_lines = []
found_insights_marker = False
for line in lines:
    if '<!-- RIGHT: INSIGHTS -->' in line:
        found_insights_marker = True
    if found_insights_marker and '<section class="split-side">' in line:
        line = line.replace('<section class="split-side">', '<section class="split-side" id="insights">')
        found_insights_marker = False # Only replace once
    new_lines.append(line)

with open(path, 'w') as f:
    f.writelines(new_lines)
print("Updated lab.html with id='insights'")
