import os
import pickle

DATASET_DIR = r"backend\dataset"
EMBEDDINGS_PATH = r"backend\embeddings.pkl"

# Scan actual dataset
all_files = sorted([f for f in os.listdir(DATASET_DIR)
             if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])

print(f"Current dataset size: {len(all_files)}")

# Keep only the first 60 images
to_keep = set(all_files[:60])
to_delete = [f for f in all_files if f not in to_keep]

print(f"Trimming dataset: Keeping 60, deleting {len(to_delete)}")

# Delete excess files
deleted_count = 0
for fname in to_delete:
    fpath = os.path.join(DATASET_DIR, fname)
    try:
        os.remove(fpath)
        deleted_count += 1
    except Exception as e:
        print(f"Error deleting {fname}: {e}")

# Trim embeddings.pkl
if os.path.exists(EMBEDDINGS_PATH):
    with open(EMBEDDINGS_PATH, 'rb') as f:
        embeddings = pickle.load(f)

    remaining_files = set(os.listdir(DATASET_DIR))
    # Filter embeddings dictionary to only include existing files
    trimmed = {k: v for k, v in embeddings.items() if k in remaining_files}
    
    with open(EMBEDDINGS_PATH, 'wb') as f:
        pickle.dump(trimmed, f)
    
    print(f"Embeddings trimmed: {len(embeddings)} -> {len(trimmed)}")
else:
    print("No embeddings.pkl found.")

print(f"Final dataset count: {len(os.listdir(DATASET_DIR))}")
