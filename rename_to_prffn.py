import os
import re

def rename_brand():
    # Target files
    extensions = ('.html', '.py', '.sh', '.js', '.json', '.txt')
    
    # Replacement map
    # We replace PRFFN with PRFFN
    # We also handle variations like PRFFN.STUDIO if they still exist
    replacements = {
        r'\bPARAFFIN\b': 'PRFFN',
        r'PRFFN\.STUDIO': 'PRFFN',
        r'PRFFN Studio': 'PRFFN',
    }

    for root, dirs, files in os.walk('.'):
        if '.git' in dirs:
            dirs.remove('.git')
        
        for file in files:
            if file.endswith(extensions):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    for pattern, replacement in replacements.items():
                        new_content = re.sub(pattern, replacement, new_content)
                    
                    if new_content != content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Renamed brand in {path}")
                except Exception as e:
                    print(f"Error processing {path}: {e}")

if __name__ == "__main__":
    rename_brand()
