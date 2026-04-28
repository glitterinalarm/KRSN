import os
import re

def update_favicon():
    extensions = ('.html')
    # Old favicon pattern (unsplash or generic)
    pattern = r'<link[^>]+rel=["\']icon["\'][^>]+>'
    new_link = '<link href="/favicon.png" rel="icon" type="image/png"/>'

    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith(extensions):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Replace existing favicon link
                    new_content = re.sub(pattern, new_link, content)
                    
                    if new_content != content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated favicon in {path}")
                except Exception as e:
                    print(f"Error processing {path}: {e}")

if __name__ == "__main__":
    update_favicon()
