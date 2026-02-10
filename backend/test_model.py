import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import os

def test_resnet():
    print("Loading ResNet50 model...")
    try:
        # Using weights parameter as per modern torchvision API
        model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
        model.eval()
        print("Model loaded successfully.")
        
        # Test extraction dimension
        # Remove the last fully connected layer
        model = torch.nn.Sequential(*(list(model.children())[:-1]))
        
        # Dummy input
        dummy_input = torch.randn(1, 3, 224, 224)
        with torch.no_grad():
            output = model(dummy_input)
        
        print(f"Output shape: {output.shape}")
        if output.shape == (1, 2048, 1, 1):
            print("Feature extraction dimension verified (2048).")
            return True
        else:
            print(f"Unexpected output shape: {output.shape}")
            return False
            
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

if __name__ == "__main__":
    if test_resnet():
        print("Model setup verified.")
    else:
        print("Model setup failed.")
