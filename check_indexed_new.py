import pickle
import os

EMBEDDINGS_PATH = r"c:\Users\DEEPSIKA\OneDrive\Desktop\VisuLens\backend\embeddings.pkl"

if os.path.exists(EMBEDDINGS_PATH):
    with open(EMBEDDINGS_PATH, 'rb') as f:
        embeddings = pickle.load(f)
        print(f"Number of indexed images: {len(embeddings.keys())}")
        if len(embeddings.keys()) > 0:
            print(f"Sample key: {list(embeddings.keys())[0]}")
else:
    print(f"No embeddings file found at {EMBEDDINGS_PATH}")
