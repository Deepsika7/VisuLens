from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIModel:
    def __init__(self, model_id="openai/clip-vit-base-patch32"):
        logger.info(f"Loading model: {model_id}...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")
        
        try:
            self.model = CLIPModel.from_pretrained(model_id).to(self.device)
            self.processor = CLIPProcessor.from_pretrained(model_id)
            logger.info("Model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def get_image_embedding(self, image: Image.Image):
        """
        Generates a normalized embedding for the given image.
        """
        try:
            inputs = self.processor(images=image, return_tensors="pt").to(self.device)
            with torch.no_grad():
                outputs = self.model.get_image_features(**inputs)
            
            # Normalize the embeddings
            embeddings = outputs / outputs.norm(p=2, dim=-1, keepdim=True)
            return embeddings.cpu().numpy().tolist()[0]
        except Exception as e:
            logger.error(f"Error generating image embedding: {e}")
            raise

    def get_text_embedding(self, text: str):
        """
        Generates a normalized embedding for the given text.
        """
        try:
            inputs = self.processor(text=[text], return_tensors="pt", padding=True).to(self.device)
            with torch.no_grad():
                outputs = self.model.get_text_features(**inputs)
            
            # Normalize the embeddings
            embeddings = outputs / outputs.norm(p=2, dim=-1, keepdim=True)
            return embeddings.cpu().numpy().tolist()[0]
        except Exception as e:
            logger.error(f"Error generating text embedding: {e}")
            raise
