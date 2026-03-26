import pickle
import os

EMBEDDINGS_PATH = r"c:\Users\DEEPSIKA\OneDrive\Desktop\VisuLens\backend\embeddings.pkl"

if os.path.exists(EMBEDDINGS_PATH):
    with open(EMBEDDINGS_PATH, 'rb') as f:
        embeddings = pickle.load(f)
        keys = list(embeddings.keys())
        print(f"Total keys: {len(keys)}")
        print(f"First 10 keys: {keys[:10]}")
        bulk_keys = [k for k in keys if k.startswith('bulk_')]
        print(f"Total bulk_ keys: {len(bulk_keys)}")
else:
    print(f"No embeddings file found at {EMBEDDINGS_PATH}")
