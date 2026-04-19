import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class MLModule:
    def __init__(self):
        print("Initializing ML Module (Lazy Load ResNet50)...")
        # Standard ImageNet transforms
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        self.model = None

    def extract_features(self, image_path):
        """Extract a 2048-dimensional embedding from an image (Memory Optimized)."""
        import gc
        # Minimize PyTorch memory usage for CPU
        torch.set_num_threads(1)
        
        try:
            if self.model is None:
                print("Loading ResNet50 model for the first time...")
                full_model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
                self.model = torch.nn.Sequential(*(list(full_model.children())[:-1]))
                self.model.eval()
            
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0)
            
            with torch.no_grad():
                features = self.model(image_tensor)
            
            # Flatten to 1D array
            result = features.flatten().numpy()
            
            # Lightweight cleanup
            del image_tensor
            gc.collect()
            
            return result
            
        except Exception as e:
            print(f"Error extracting features from {image_path}: {e}")
            return None

    def compute_similarity(self, query_features, dataset_features):
        """Compute cosine similarity between query and a list of dataset features."""
        # query_features: (2048,)
        # dataset_features: (N, 2048)
        similarities = cosine_similarity(query_features.reshape(1, -1), dataset_features)
        return similarities.flatten()

if __name__ == "__main__":
    # Quick test
    ml = MLModule()
    dummy_feat1 = np.random.rand(2048)
    dummy_feat2 = np.random.rand(5, 2048)
    sims = ml.compute_similarity(dummy_feat1, dummy_feat2)
    print(f"Similarities: {sims}")
