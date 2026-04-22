import os
from bs4 import BeautifulSoup

def link_cta_buttons():
    # Find all HTML files including in subdirectories like /fr/
    html_files = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))

    for file_path in html_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')

        # Target the button with text "Brief us..." or its French equivalent
        # We look for buttons that have the specific CTA text
        buttons = soup.find_all('button')
        
        is_modified = False
        repo_prefix = ""
        # If we are in the fr/ directory, links should point to /fr/ contact
        is_fr = "fr/" in file_path or "/fr" in file_path
        contact_link = "fr/contact.html" if is_fr else "contact.html"
        
        # Adjust link if we are deep in subfolders
        depth = file_path.count(os.sep)
        if is_fr:
            # If in fr/index.html, path is fr/index.html (depth 1)
            # Contact is in fr/contact.html
            contact_link = "contact.html" 
        else:
            # Root files
            contact_link = "contact.html"

        for btn in buttons:
            text = btn.get_text().strip().lower()
            if "brief us" in text or "contact" in text or "demandez un devis" in text.lower():
                # Replace button with link or add onclick
                btn['onclick'] = f"window.location.href='{contact_link}'"
                btn.style = btn.get('style', '') + "; cursor: pointer;"
                is_modified = True
                print(f"Linked CTA in {file_path}")

        if is_modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(str(soup))

if __name__ == "__main__":
    link_cta_buttons()
