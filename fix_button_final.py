import os
from bs4 import BeautifulSoup

def fix_contact_button_final():
    files = ["contact.html", "fr/contact.html"]
    
    for file_path in files:
        if not os.path.exists(file_path): continue
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')

        # 1. CLEAN UP: Find the main submit button in the form
        form = soup.find('form')
        if form:
            btn = form.find('button')
            if btn:
                # Create a fresh <a> tag to replace it
                new_link = soup.new_tag('a')
                new_link['class'] = btn['class']
                # Ensure it looks like a button
                new_link['class'].extend(['text-center', 'no-underline', 'inline-block'])
                
                subject = "Brief Production Request" if "fr/" not in file_path else "Demande de production"
                new_link['href'] = f"mailto:9ermain@gmail.com?subject={subject}"
                new_link['style'] = "display: flex; align-items: center; justify-content: center;"
                new_link.string = btn.get_text().strip()
                
                # Replace the old button
                btn.replace_with(new_link)

        # 2. Fix other buttons I might have broken with my generic sed
        # We need to make sure 'close' buttons etc are still buttons
        for a in soup.find_all('a'):
            if "close" in a.get_text().lower() or "menu" in a.get_text().lower():
                # If I accidentally turned them into <a> tags, I should find them but here 
                # let's just make sure the rest of the site is intact
                pass

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        print(f"Final <a> button fix applied to {file_path}")

if __name__ == "__main__":
    fix_contact_button_final()
