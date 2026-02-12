import pickle
import os
import numpy as np

class StorageManager:
    def __init__(self, embeddings_path='embeddings.pkl', dataset_path='../dataset'):
        self.embeddings_path = embeddings_path
        self.dataset_path = dataset_path
        self.data = {} # {image_name: embedding}

    def load_embeddings(self):
        """Load precomputed embeddings from disk."""
        if os.path.exists(self.embeddings_path):
            try:
                with open(self.embeddings_path, 'rb') as f:
                    self.data = pickle.load(f)
                print(f"Loaded {len(self.data)} embeddings.")
            except Exception as e:
                print(f"Error loading embeddings: {e}")
                self.data = {}
        else:
            print("No embeddings file found. Starting fresh.")
            self.data = {}

    def save_embeddings(self):
        """Save current embeddings to disk."""
        try:
            with open(self.embeddings_path, 'wb') as f:
                pickle.dump(self.data, f)
            print("Embeddings saved successfully.")
        except Exception as e:
            print(f"Error saving embeddings: {e}")

    def update_embedding(self, image_name, embedding):
        self.data[image_name] = embedding

    def get_all_embeddings(self):
        """Returns images names and their corresponding embeddings as a matrix."""
        if not self.data:
            return [], np.array([])
        
        image_names = list(self.data.keys())
        embeddings = np.array([self.data[name] for name in image_names])
        return image_names, embeddings

    def get_image_url(self, image_name):
        """Helper to get local path for an image."""
        return os.path.join(self.dataset_path, image_name)

if __name__ == "__main__":
    # Test storage
    sm = StorageManager(embeddings_path='test_embeddings.pkl')
    sm.update_embedding('test.jpg', np.random.rand(2048))
    sm.save_embeddings()
    sm.load_embeddings()
    names, embs = sm.get_all_embeddings()
    print(f"Names: {names}, Embeddings Shape: {embs.shape}")
    os.remove('test_embeddings.pkl')
