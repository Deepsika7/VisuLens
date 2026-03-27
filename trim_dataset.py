"""
Trim VisuLens dataset to ~370 images and sync embeddings.pkl.
Keeps: all categorized sets (animals, arch, city, nature, tech, beach)
       + first 50 of each bulk_ category
Removes: large pexels/unsplash files, misc image_* files, excess bulk_ files
"""
import os
import pickle
import shutil

DATASET_DIR = r"backend\dataset"
EMBEDDINGS_PATH = r"backend\embeddings.pkl"

# --- Define files to KEEP ---
keep = set()

# Keep all named category images (20 each)
for cat in ["animals", "architecture", "city", "nature", "technology"]:
    for i in range(1, 21):
        keep.add(f"{cat}_{i:03d}.jpg")

# Keep all sunset_beach (30)
for i in range(1, 31):
    keep.add(f"sunset_beach_{i:02d}.jpg")

# Keep first 50 of each bulk_ category
for cat in ["animals", "city", "nature", "technology"]:
    for i in range(1, 51):
        keep.add(f"bulk_{cat}_{i:03d}.jpg")

# Keep all bulk_animals (they're all small, 84 total)
for i in range(1, 85):
    keep.add(f"bulk_animals_{i:03d}.jpg")

print(f"Target keep set size: {len(keep)} files")

# --- Scan actual dataset ---
all_files = [f for f in os.listdir(DATASET_DIR)
             if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
print(f"Current dataset: {len(all_files)} files")

# Decide what to delete
to_delete = [f for f in all_files if f not in keep]
to_keep_actual = [f for f in all_files if f in keep]

print(f"Keeping: {len(to_keep_actual)} | Deleting: {len(to_delete)}")
print("\nFiles being deleted:")
for f in sorted(to_delete):
    size = os.path.getsize(os.path.join(DATASET_DIR, f))
    print(f"  {f} ({size//1024}KB)")

# --- Delete excess files ---
deleted_count = 0
for fname in to_delete:
    fpath = os.path.join(DATASET_DIR, fname)
    try:
        os.remove(fpath)
        deleted_count += 1
    except Exception as e:
        print(f"  ERROR deleting {fname}: {e}")

print(f"\nDeleted {deleted_count} files.")

# --- Trim embeddings.pkl ---
if os.path.exists(EMBEDDINGS_PATH):
    with open(EMBEDDINGS_PATH, 'rb') as f:
        embeddings = pickle.load(f)

    original_count = len(embeddings)
    remaining_files = set(os.listdir(DATASET_DIR))
    
    # Only keep embeddings whose image file still exists
    trimmed = {k: v for k, v in embeddings.items() if k in remaining_files}
    
    with open(EMBEDDINGS_PATH, 'wb') as f:
        pickle.dump(trimmed, f)
    
    print(f"Embeddings: {original_count} → {len(trimmed)} (trimmed {original_count - len(trimmed)})")
else:
    print("No embeddings.pkl found, skipping trim.")

# --- Final count ---
final_files = [f for f in os.listdir(DATASET_DIR)
               if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
print(f"\nFinal dataset: {len(final_files)} images")
print("Done!")
