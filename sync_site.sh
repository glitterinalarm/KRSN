#!/bin/bash
# Sync Site Script v2.0

echo "Starting site synchronization v2.0..."

# 1. Processing local modifications
python3 add_mobile_menu.py
python3 fix_site_navigation.py

# 3. Fix Grid Alignment & Aspect Ratios
python3 fix_grid.py
python3 fix_mobile_ui.py

# 3.5 Copy Uploads from Manager to Dist
mkdir -p assets/uploads
cp -r assets_manager/uploads/* assets/uploads/

# 4. Sync Projects (Titles, Categories, Media, Video)
# This uses the data from projects_state.json
python3 sync_projects.py

# 5. Inject Kérosène News
python3 inject_kerosene.py
python3 inject_kerosene_lab.py

# 5.5 Update global date context to 2026
python3 update_dates.py

# 5.6 Create duplicate FR pages with dictionary translation
python3 build_i18n.py

# 6. Push to GitHub (Vercel will deploy from /dist)
git add .
git commit -m "Update: Full project state sync"
git push

echo "Deployment complete. New content is live!"
