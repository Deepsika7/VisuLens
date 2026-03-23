import os
import requests
import time

DATASET_DIR = r"c:\Users\DEEPSIKA\OneDrive\Desktop\VisuLens\dataset"
os.makedirs(DATASET_DIR, exist_ok=True)

categories = ['nature', 'city', 'technology', 'animals', 'architecture']
total_images = 100
images_per_cat = total_images // len(categories)

print(f"Downloading {total_images} images across various categories...")

for cat in categories:
    print(f"\nDownloading {cat} images...")
    for i in range(1, images_per_cat + 1):
        # We use loremflickr with lock to get distinct images
        url = f"https://loremflickr.com/800/600/{cat}?lock={i}"
        filename = os.path.join(DATASET_DIR, f"{cat}_{i:03d}.jpg")
        
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                with open(filename, 'wb') as f:
                    f.write(response.content)
                print(f"Downloaded {cat}_{i:03d}.jpg")
            else:
                print(f"Failed to download {cat}_{i:03d}.jpg: HTTP {response.status_code}")
        except Exception as e:
            print(f"Error downloading {cat}_{i:03d}.jpg: {e}")
        
        # Small delay
        time.sleep(0.5)

print("\nAll downloads complete. Triggering backend sync to process new images into AI embeddings...")

try:
    sync_res = requests.post("http://localhost:5000/sync", timeout=300)
    print(f"Sync complete! Backend response: {sync_res.json()}")
except Exception as e:
    print(f"Failed to trigger sync: {e}")
