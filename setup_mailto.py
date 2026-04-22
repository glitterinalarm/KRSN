import os
from bs4 import BeautifulSoup

def setup_mailto():
    email_target = "9ermain@gmail.com"
    html_files = ["contact.html", "fr/contact.html"]

    js_logic = f"""
    <script id="mailto-logic">
        function handleFormSubmit(event) {{
            event.preventDefault();
            const form = event.target;
            const name = form.querySelector('input[placeholder*="Doe"], input[placeholder*="Dupont"]').value;
            const email = form.querySelector('input[type="email"]').value;
            const company = form.querySelector('input[placeholder*="Company"], input[placeholder*="entreprise"]').value;
            const brief = form.querySelector('textarea').value;
            const timeline = form.querySelector('input[placeholder*="Weeks"], input[placeholder*="Semaines"]').value;

            const subject = encodeURIComponent(`[BLSTC Brief] New Production Request from ${{company || name}}`);
            const body = encodeURIComponent(
                `Full Name: ${{name}}\\n` +
                `Email: ${{email}}\\n` +
                `Company: ${{company}}\\n` +
                `Timeline: ${{timeline}}\\n\\n` +
                `Project Vision:\\n${{brief}}`
            ).replace(/%5Cn/g, '%0D%0A');

            window.location.href = `mailto:{email_target}?subject=${{subject}}&body=${{body}}`;
        }}

        document.addEventListener('DOMContentLoaded', () => {{
            const form = document.querySelector('form');
            if (form) {{
                form.addEventListener('submit', handleFormSubmit);
                const btn = form.querySelector('button[type="submit"]');
                if (btn) btn.removeAttribute('onclick'); // Clean up manual hacks
            }}
        }});
    </script>
    """

    for file_path in html_files:
        if not os.path.exists(file_path): continue
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')

        # Find form
        form = soup.find('form')
        if form:
            # Clear old attributes
            form['onsubmit'] = "return false;" # Safety
            
        # Inject script before </body>
        old_script = soup.find('script', id="mailto-logic")
        if old_script: old_script.decompose()
        
        soup.body.append(BeautifulSoup(js_logic, 'html.parser'))

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        print(f"Mailto configured for {file_path}")

if __name__ == "__main__":
    setup_mailto()
