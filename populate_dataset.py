import requests
import os
import uuid
import time

DATASET_FOLDER = 'dataset'
os.makedirs(DATASET_FOLDER, exist_ok=True)

# Unsplash Source URL for random images
# Categories: sunset, beach, ocean, nature, tropical
CATEGORIES = ['sunset', 'beach', 'ocean', 'nature', 'tropical', 'coast']
NUM_IMAGES = 40

print(f"Starting to download {NUM_IMAGES} random images to {DATASET_FOLDER}...")

for i in range(NUM_IMAGES):
    category = CATEGORIES[i % len(CATEGORIES)]
    url = f"https://source.unsplash.com/featured/800x1000?{category}"
    # Note: source.unsplash.com is redirected to images.unsplash.com
    # Using a more direct approach if redirect fails or to get higher quality
    
    try:
        # We'll use the picsum.photos or a stable unsplash link
        url = f"https://picsum.photos/seed/{uuid.uuid4()}/800/1000"
        
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            filename = f"image_{uuid.uuid4().hex[:8]}.jpg"
            filepath = os.path.join(DATASET_FOLDER, filename)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"[{i+1}/{NUM_IMAGES}] Downloaded: {filename} ({category})")
        else:
            print(f"[{i+1}/{NUM_IMAGES}] Failed to download from {url}")
            
    except Exception as e:
        print(f"Error downloading image {i+1}: {e}")
    
    # Small delay to avoid rate limiting
    time.sleep(0.5)

print("\nFinished populating dataset.")
