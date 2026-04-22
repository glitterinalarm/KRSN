import json
import os
import subprocess
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.path.join(PROJECT_DIR, 'projects_state.json')
UPLOAD_FOLDER = os.path.join(PROJECT_DIR, 'assets_manager', 'uploads')
DIST_UPLOAD_FOLDER = os.path.join(PROJECT_DIR, 'dist', 'assets', 'uploads')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Serve uploaded files for preview
from flask import send_from_directory
@app.route('/assets/uploads/<path:filename>')
def uploaded_file(filename):
    # Preview from the safe manager folder
    return send_from_directory(UPLOAD_FOLDER, filename)

def load_data():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_data(data):
    with open(STATE_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    return render_template('admin_v2.html')

@app.route('/api/projects', methods=['GET'])
def get_projects():
    return jsonify(load_data())

@app.route('/api/projects', methods=['POST'])
def update_projects():
    data = request.json
    save_data(data)
    return jsonify({"status": "success"})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400
    
    filename = file.filename.replace(" ", "_")
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    relative_path = f"/assets/uploads/{filename}"
    return jsonify({"status": "success", "url": relative_path})

@app.route('/api/sync', methods=['POST'])
def sync_site():
    try:
        # Step 1: Run Bash Sync Script
        result = subprocess.run(['bash', 'sync_site.sh'], 
                              cwd=PROJECT_DIR, capture_output=True, text=True)
        
        if result.returncode != 0:
            return jsonify({"status": "error", "message": result.stderr}), 500
            
        return jsonify({"status": "success", "message": "Site updated and pushed to Vercel."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
