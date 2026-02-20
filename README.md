# VisuLens: AI-Powered Visual Search Engine

VisuLens is a premium, Pinterest-inspired visual search engine that uses deep learning (ResNet50) to find similar images based on their visual features.

## ✨ Features
- **AI-Powered Search**: Uses ResNet50 for high-dimensional feature extraction.
- **Pinterest Aesthetic**: Premium pastel UI with a smooth masonry grid.
- **Real-time Processing**: Fast similarity matching using Cosine Similarity.
- **Micro-animations**: Enhanced UX with Framer Motion.

## 🚀 Getting Started

### Backend Setup
1. Navigate to the `backend` folder.
2. Create a virtual environment: `python -m venv venv`.
3. Activate the venv: `.\venv\Scripts\activate`.
4. Install dependencies: `pip install -r requirements.txt`.
5. Run the server: `python app.py`.

### Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run dev`.

## 🛠️ Technology Stack
- **Frontend**: React v18, Vite, Framer Motion (Animations), Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Flask, PyTorch, Torchvision, Scikit-learn (Cosine Similarity), Pillow (Image Processing).
- **AI Model**: Pre-trained ResNet50 (2048-dimensional feature extractor).
- **Storage**: Binary Pickle (.pkl) for vector embeddings, JSON for user credentials.

## 📝 Author
DEEPSIKA R D
7376232AD125
