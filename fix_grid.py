from bs4 import BeautifulSoup
import os

files_to_fix = ['dist/work.html', 'dist/lab.html']

for path in files_to_fix:
    if not os.path.exists(path):
        continue

    with open(path, 'r') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # UNIVERSAL CONTENT REPLACEMENTS
    # Replace the Work intro text
    intro_elem = soup.find(string=lambda text: text and 'A curated selection of cinematic explorations' in text)
    if intro_elem:
        intro_elem.replace_with('Creating is not just about filling a space or following a trend: it is about solving a problem, conveying an emotion, and building a solid identity.')

    # Replace the AI mode text
    ai_mode_elem = soup.find(string=lambda text: text and 'Redefining the creative pipeline through latent space exploration' in text)
    if ai_mode_elem:
        ai_mode_elem.replace_with('AI as a technical lever to explore previously inaccessible visual territories.')

    # Replace Lab Intro text
    lab_intro_elem = soup.find(string=lambda text: text and 'A dedicated sandbox for autonomous systems' in text)
    if lab_intro_elem:
        lab_intro_elem.replace_with("This is where I test what hasn't been done yet. Whether it's designing websites through vibe coding or prototyping new visual concepts, this space is my R&D engine.")

    # GRID SPECIFIC FIXES (only for work.html)
    if 'work.html' in path:
        items = soup.find_all('div', class_=lambda x: x and 'group' in x)
        def clean_classes(classes):
            return [c for c in classes if not any(x in c for x in ['col-span-', 'aspect-'])]

        for item in items:
            h3 = item.find('h3')
            if h3:
                title = h3.get_text(strip=True)
                if 'Police Nationale' in title:
                    item['class'] = clean_classes(item.get('class', []))
                    item['class'].extend(['md:col-span-8', 'aspect-[2/1]', 'group', 'relative', 'overflow-hidden'])
                elif 'Leboncoin' in title:
                    item['class'] = clean_classes(item.get('class', []))
                    item['class'].extend(['md:col-span-4', 'aspect-square', 'group', 'relative', 'overflow-hidden'])
                elif 'BNP Parisbas' in title:
                    item['class'] = clean_classes(item.get('class', []))
                    item['class'].extend(['md:col-span-4', 'aspect-square', 'group', 'relative', 'overflow-hidden'])
                elif 'Ministere du Tourisme' in title:
                    item['class'] = clean_classes(item.get('class', []))
                    item['class'].extend(['md:col-span-8', 'aspect-[2/1]', 'group', 'relative', 'overflow-hidden'])

    with open(path, 'w') as f:
        f.write(str(soup))

