import json
import os
import re

DATA_FILE = "site_data.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        return {"works": [], "lab": []}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def sync_pages(data):
    # Rebuild Work.html
    work_path = "work.html"
    if os.path.exists(work_path):
        with open(work_path, "r") as f:
            content = f.read()
        
        work_html = ""
        for item in data["works"]:
            work_html += f'''
            <div class="work-gallery-item">
                <img src="{item['image']}">
                <div class="mt-8 flex justify-between items-baseline">
                    <h3 class="text-2xl font-black uppercase">{item['title']}</h3>
                    <span class="label-mono opacity-40">{item['year']} / {item['category']}</span>
                </div>
            </div>'''
        
        content = re.sub(r'<div class="work-gallery-container" id="gallery">.*?</div>', 
                         f'<div class="work-gallery-container" id="gallery">{work_html}</div>', 
                         content, flags=re.DOTALL)
        
        # Update project count label
        content = re.sub(r'DRAG_TO_NAVIGATE — \(\d+\) PROJECTS', 
                         f'DRAG_TO_NAVIGATE — ({len(data["works"]):02d}) PROJECTS', 
                         content)

        with open(work_path, "w") as f:
            f.write(content)

    # Rebuild Lab.html (Lab side)
    lab_path = "lab.html"
    if os.path.exists(lab_path):
        with open(lab_path, "r") as f:
            content = f.read()
        
        lab_html = ""
        for i, item in enumerate(data["lab"]):
            lab_html += f'''
                <div class="lab-item cursor-pointer" onclick="window.open('{item['link']}', '_blank')">
                    <img src="{item['image']}">
                    <div class="flex justify-between items-baseline">
                        <div>
                            <div class="text-[9px] opacity-40 uppercase tracking-widest mb-1">{item['meta']} // {i+1:02d}</div>
                            <h3 class="text-2xl font-bold uppercase">{item['title']}</h3>
                        </div>
                    </div>
                </div>'''
        
        content = re.sub(r'<!-- START_LAB_FEED -->.*?<!-- END_LAB_FEED -->', 
                         f'<!-- START_LAB_FEED -->{lab_html}<!-- END_LAB_FEED -->', 
                         content, flags=re.DOTALL)
        
        with open(lab_path, "w") as f:
            f.write(content)

    print("Pages synchronized with data.")

def main():
    print("--- PARAFFINE CONTENT MANAGER ---")
    data = load_data()
    
    while True:
        print("\n1. Add Work\n2. Delete Work\n3. Add Lab Link\n4. Delete Lab Link\n5. Sync & Exit\nq. Quit")
        choice = input("> ")
        
        if choice == "1":
            title = input("Title: ")
            cat = input("Category (ex: BRANDING): ")
            year = input("Year: ")
            img = input("Image URL: ")
            data["works"].append({"title": title, "category": cat, "year": year, "image": img, "link": "#"})
        elif choice == "2":
            for i, w in enumerate(data["works"]): print(f"{i}: {w['title']}")
            idx = int(input("Index to delete: "))
            data["works"].pop(idx)
        elif choice == "3":
            title = input("Title: ")
            meta = input("Meta (ex: INSTAGRAM): ")
            img = input("Image URL: ")
            link = input("Link URL: ")
            data["lab"].append({"title": title, "meta": meta, "image": img, "link": link})
        elif choice == "4":
            for i, l in enumerate(data["lab"]): print(f"{i}: {l['title']}")
            idx = int(input("Index to delete: "))
            data["lab"].pop(idx)
        elif choice == "5":
            save_data(data)
            sync_pages(data)
            os.system("./sync_site.sh")
            break
        elif choice == "q":
            break

if __name__ == "__main__":
    main()
