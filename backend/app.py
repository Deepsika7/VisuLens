import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
import uuid
from ml_logic import MLModule
from storage_manager import StorageManager
import numpy as np

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Base project directory (backend folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configurations (Absolute paths relative to this script)
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
DATASET_FOLDER = os.getenv('DATASET_PATH', os.path.join(BASE_DIR, 'dataset'))
EMBEDDINGS_PATH = os.getenv('EMBEDDINGS_PATH', os.path.join(BASE_DIR, 'embeddings.pkl'))

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DATASET_FOLDER, exist_ok=True)

# Initialize Modules
ml = MLModule()
storage = StorageManager(embeddings_path=EMBEDDINGS_PATH, dataset_path=DATASET_FOLDER)
storage.load_embeddings()

# Simple User Storage (JSON)
import json
USERS_FILE = 'users.json'
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as f:
        json.dump({}, f)

def get_users():
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
        
    users = get_users()
    if email in users:
        return jsonify({"error": "Already have an account with this email id"}), 409
        
    users[email] = password
    save_users(users)
    return jsonify({"message": "Signup successful", "user": email})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    users = get_users()
    if email not in users:
        return jsonify({"error": "There is no account with this email id. Please create a new account."}), 404
        
    if users[email] == password:
        return jsonify({"message": "Login successful", "user": email})
    
    return jsonify({"error": "Incorrect password"}), 401

@app.route('/search', methods=['POST'])
def search():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400

    # Save uploaded file temporarily
    filename = str(uuid.uuid4()) + "_" + file.filename
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    return process_search(filepath)

@app.route('/search-url', methods=['POST'])
def search_url():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({"error": "No URL provided"}), 400
    
    url = data['url']
    try:
        response = requests.get(url, stream=True, timeout=10)
        if response.status_code != 200:
            return jsonify({"error": f"Failed to download image from URL (Status: {response.status_code})"}), 400
        
        filename = str(uuid.uuid4()) + ".jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=128):
                f.write(chunk)
        
        return process_search(filepath)
    except Exception as e:
        return jsonify({"error": f"Error processing URL: {str(e)}"}), 500

def process_search(filepath):
    # Extract features
    query_features = ml.extract_features(filepath)
    if query_features is None:
        return jsonify({"error": "Failed to extract features from image"}), 500

    # Get dataset features
    image_names, dataset_features = storage.get_all_embeddings()
    
    if len(image_names) == 0:
        return jsonify({"results": [], "message": "Dataset is empty. Please upload some images first."}), 200

    # Compute similarity
    similarities = ml.compute_similarity(query_features, dataset_features)
    
    # Get top 10 indices (increased from 5 for better experience)
    top_indices = np.argsort(similarities)[::-1][:10]
    
    results = []
    for idx in top_indices:
        sim_score = float(similarities[idx])
        if sim_score < 0.75:
            continue
        results.append({
            "image_name": image_names[idx],
            "similarity": sim_score,
            "url": f"/dataset/{image_names[idx]}"
        })

    return jsonify({"results": results})

@app.route('/upload', methods=['POST'])
def upload_to_dataset():
    """Upload an image to the dataset and precompute its embedding."""
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400

    filepath = os.path.join(DATASET_FOLDER, file.filename)
    file.save(filepath)

    # Compute and save embedding
    features = ml.extract_features(filepath)
    if features is not None:
        storage.update_embedding(file.filename, features)
        storage.save_embeddings()
        return jsonify({"message": f"Image {file.filename} uploaded and processed.", "url": f"/dataset/{file.filename}"})
    else:
        return jsonify({"error": "Failed to process image"}), 500

@app.route('/dataset/<filename>')
def get_image(filename):
    return send_from_directory(DATASET_FOLDER, filename)

@app.route('/sync', methods=['POST'])
def sync_dataset():
    """Scan dataset folder and index any new images."""
    image_names, _ = storage.get_all_embeddings()
    indexed_set = set(image_names)
    
    # Supported image extensions
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
    
    files_in_folder = [f for f in os.listdir(DATASET_FOLDER) if f.lower().endswith(valid_extensions)]
    new_files = [f for f in files_in_folder if f not in indexed_set]
    
    if not new_files:
        return jsonify({"message": "Dataset is already up to date.", "count": 0})
    
    count = 0
    errors = []
    for filename in new_files:
        filepath = os.path.join(DATASET_FOLDER, filename)
        features = ml.extract_features(filepath)
        if features is not None:
            storage.update_embedding(filename, features)
            count += 1
        else:
            errors.append(filename)
            
    if count > 0:
        storage.save_embeddings()
        
    return jsonify({
        "message": f"Sync complete. Indexed {count} new images.",
        "count": count,
        "errors": errors
    })




@app.route('/images')
def get_all_images():
    """Retrieve all indexed images from the dataset."""
    image_names, _ = storage.get_all_embeddings()
    results = []
    for name in image_names:
        results.append({
            "image_name": name,
            "url": f"/dataset/{name}"
        })
    return jsonify({"images": results})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
