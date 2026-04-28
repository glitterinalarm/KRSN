import os
from bs4 import BeautifulSoup

def setup_mailto_v3():
    email_target = "9ermain@gmail.com"
    html_files = ["contact.html", "fr/contact.html"]

    js_logic = f"""
    <script id="mailto-logic-v3">
        function launchDialogue() {{
            try {{
                // Find all possible inputs regardless of their order
                const inputs = document.querySelectorAll('input');
                const textarea = document.querySelector('textarea');
                
                let name = "";
                let company = "";
                let email = "";
                let timeline = "";
                let brief = textarea ? textarea.value : "";

                inputs.forEach(input => {{
                    const label = input.closest('div')?.querySelector('label')?.innerText.toLowerCase() || "";
                    if (label.includes('name') || label.includes('nom')) name = input.value;
                    if (label.includes('company') || label.includes('entité') || label.includes('entreprise')) company = input.value;
                    if (label.includes('email') || label.includes('adresse')) email = input.value;
                    if (label.includes('timeline') || label.includes('délai')) timeline = input.value;
                }});

                const subject = encodeURIComponent(`[PRFFN Brief] New Production Request from ${{company || name || 'New Client'}}`);
                const body = encodeURIComponent(
                    `Full Name: ${{name}}\\n` +
                    `Email: ${{email}}\\n` +
                    `Company: ${{company}}\\n` +
                    `Timeline: ${{timeline}}\\n\\n` +
                    `Project Vision:\\n${{brief}}`
                ).replace(/%5Cn/g, '%0D%0A');

                window.location.href = `mailto:{email_target}?subject=${{subject}}&body=${{body}}`;
            }} catch (e) {{
                console.error("Mailto error:", e);
                // Fallback to simple mailto if something fails
                window.location.href = "mailto:{email_target}?subject=Project Enquiry";
            }}
        }}
    </script>
    """

    for file_path in html_files:
        if not os.path.exists(file_path): continue
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')

        # Remove old scripts if any
        for s in soup.find_all('script', id=lambda x: x and 'mailto-logic' in x):
            s.decompose()
        
        # Inject new logic
        soup.body.append(BeautifulSoup(js_logic, 'html.parser'))

        # Direct attach to button or link that says "Start the Dialogue"
        form = soup.find('form')
        if form:
            # Find the element that looks like the submit button
            btn = form.find(lambda tag: tag.name in ['a', 'button'] and 'Start the Dialogue' in tag.text)
            if btn:
                # Convert to button if it was an 'a' tag to ensure better form handling
                if btn.name == 'a':
                    btn.name = 'button'
                    del btn['href']
                
                btn['onclick'] = "launchDialogue(); return false;"
                btn['type'] = "button" # Prevent dual submit
                print(f"  Successfully linked button in {file_path}")

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(soup.prettify())
        print(f"Robust Mailto v3 configured for {file_path}")

if __name__ == "__main__":
    setup_mailto_v3()
