import os
from bs4 import BeautifulSoup

def fix_mobile_ui():
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    
    # Also check fr/ directory
    if os.path.exists('fr'):
        for f in os.listdir('fr'):
            if f.endswith('.html'):
                html_files.append('fr/' + f)

    style_fix = """
    <style id="mobile-readability-fix">
        @media (max-width: 768px) {
            /* Better reading for descriptions */
            p.text-sm, p.font-light {
                font-size: 15px !important;
                line-height: 1.7 !important;
                opacity: 0.8 !important;
                margin-top: 15px !important;
                letter-spacing: 0.01em !important;
            }
            /* Prevents text from sticking to edges */
            .p-4, .p-6, .p-8 {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
            /* Adjust Titles */
            h3 {
                font-size: 1.4rem !important;
                line-height: 1.2 !important;
                margin-bottom: 8px !important;
            }
            /* Space out project blocks */
            .group {
                margin-bottom: 2rem !important;
            }
        }
    </style>
    """

    for file_path in html_files:
        if not os.path.exists(file_path): continue
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        import re
        # Remove old fix if exists
        content = re.sub(r'<style id="mobile-readability-fix">.*?</style>', '', content, flags=re.DOTALL)
        
        # Inject in head safely without parsing whole document
        if '</head>' in content:
            content = content.replace('</head>', f'{style_fix}\n</head>')
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed readability on {file_path}")

if __name__ == "__main__":
    fix_mobile_ui()
