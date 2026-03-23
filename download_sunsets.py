import os
import requests
import time

DATASET_DIR = r"c:\Users\DEEPSIKA\OneDrive\Desktop\VisuLens\dataset"
os.makedirs(DATASET_DIR, exist_ok=True)

print("Downloading 30 beach sunset images...")

# We'll use LoremFlickr which supports keyword-based image retrieval with a lock param for distinct images
for i in range(1, 31):
    url = f"https://loremflickr.com/800/600/beach,sunset?lock={i}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            filename = os.path.join(DATASET_DIR, f"sunset_beach_{i:02d}.jpg")
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"Downloaded {i}/30: sunset_beach_{i:02d}.jpg")
        else:
            print(f"Failed to download {i}: HTTP {response.status_code}")
    except Exception as e:
        print(f"Error downloading {i}: {e}")
    
    # Small delay to avoid hammering the server
    time.sleep(0.5)

print("All downloads complete. Triggering backend sync to process new images into AI embeddings...")

# Trigger backend sync to index the new images
try:
    sync_res = requests.post("http://localhost:5000/sync", timeout=120)
    print(f"Sync complete! Backend response: {sync_res.json()}")
except Exception as e:
    print(f"Failed to trigger sync: {e}")
