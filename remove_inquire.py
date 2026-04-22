import os
from bs4 import BeautifulSoup

def remove_inquire_buttons():
    # Find all HTML files
    html_files = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))

    for file_path in html_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')

        is_modified = False
        # Search for the specific button link in the nav
        links = soup.find_all('a')
        for link in links:
            text = link.get_text().strip().lower()
            if text == "inquire" or text == "s'informer":
                link.decompose()
                is_modified = True
                print(f"Removed button from {file_path}")

        if is_modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(str(soup))

if __name__ == "__main__":
    remove_inquire_buttons()
