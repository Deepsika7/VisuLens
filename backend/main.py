from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from model import AIModel
from PIL import Image
import io
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variable to hold the model
ai_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ai_model
    logger.info("Loading AI Model...")
    try:
        ai_model = AIModel()
        logger.info("AI Model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load AI Model: {e}")
    yield
    logger.info("Shutting down...")

app = FastAPI(lifespan=lifespan)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "VisuLens Backend is Running"}

@app.post("/search")
async def search_image(file: UploadFile = File(...)):
    if not ai_model:
        raise HTTPException(status_code=503, detail="AI Model not loaded")
    
    try:
        # Read image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Get embedding
        embedding = ai_model.get_image_embedding(image)
        
        # TODO: Implement actual database search using the embedding
        # For now, return the embedding and a mock result
        
        return {
            "status": "success",
            "embedding_sample": embedding[:5], # First 5 values
            "results": [
                {"id": 1, "url": "https://via.placeholder.com/150", "score": 0.95},
                {"id": 2, "url": "https://via.placeholder.com/150", "score": 0.88}
            ]
        }
    except Exception as e:
        logger.error(f"Error processing search request: {e}")
        raise HTTPException(status_code=500, detail=str(e))
