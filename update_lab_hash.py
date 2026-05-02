import re

path = 'lab.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add id="lab"
content = content.replace('<!-- LEFT: THE LAB -->\n<section class="split-side">', '<!-- LEFT: THE LAB -->\n<section class="split-side" id="lab">')

# 2. Add Hash Scroll script
script = '''
  <!-- HASH_SCROLL_ENGINE_START -->
  <script id="hash-scroll-logic">
    function handleHash() {
        const hash = window.location.hash;
        if (!hash) return;
        
        const targetId = hash.substring(1); 
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
    }
    
    window.addEventListener('hashchange', handleHash);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleHash);
    } else {
        handleHash();
    }
  </script>
  <!-- HASH_SCROLL_ENGINE_END -->
'''

if '<!-- HASH_SCROLL_ENGINE_START -->' not in content:
    content = content.replace('</body>', script + '\n</body>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("lab.html updated successfully.")
