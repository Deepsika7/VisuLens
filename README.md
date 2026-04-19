# 🎨 VisuLens – AI-Powered Visual Search Engine

VisuLens is a **premium, Pinterest-inspired visual search engine** that leverages deep learning to retrieve visually similar images. Built with performance, scalability, and modern UI aesthetics in mind, VisuLens delivers fast and accurate image search using feature embeddings extracted from ResNet50.

---

## 🌐 Live Demo

* **Frontend**: https://visulens-frontend-vj4o.onrender.com
* **Backend API**: https://visulens-backend-vj4o.onrender.com

---

## ✨ Key Features

* 🔍 **AI-Powered Visual Search**
  Utilizes a pre-trained ResNet50 model to extract high-dimensional feature vectors for similarity matching.

* 🎯 **Accurate Similarity Matching**
  Implements cosine similarity to find visually relevant results efficiently.

* 🎨 **Pinterest-Style UI**
  Elegant pastel-themed interface with responsive masonry grid layout.

* ⚡ **Real-Time Performance**
  Optimized embedding indexing ensures near-zero latency retrieval.

* 🎞️ **Smooth Micro-Interactions**
  Enhanced user experience using Framer Motion animations.

* 💡 **Free-Tier Optimized Deployment**
  Designed to run efficiently on CPU-only environments (no GPU required).

---

## 🏗️ System Architecture

```
User Upload Image
        ↓
Frontend (React + Vite)
        ↓
Backend API (Flask)
        ↓
ResNet50 Feature Extraction
        ↓
Embedding Comparison (Cosine Similarity)
        ↓
Top Matching Images Returned
```

---

## 🛠️ Tech Stack

### 🔹 Frontend

* React v18
* Vite
* Tailwind CSS
* Framer Motion
* Axios
* Lucide Icons

### 🔹 Backend

* Flask
* PyTorch (CPU-only)
* Scikit-learn
* Pillow

### 🔹 AI Model

* ResNet50 (Pre-trained)
* 2048-dimensional feature vectors

### 🔹 Storage

* Pickle (.pkl) → Image embeddings
* JSON → Metadata / profiles

---

## 🚀 Installation & Setup

### 🔧 Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate environment
.\venv\Scripts\activate   # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
```

---

### 🎨 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 📂 Project Structure

```
VisuLens/
│
├── backend/
│   ├── app.py
│   ├── model/
│   ├── embeddings.pkl
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── package.json
│
└── README.md
```

---

## ⚙️ How It Works

1. User uploads an image through the UI
2. Backend processes the image using ResNet50
3. Extracted feature vector is compared with stored embeddings
4. Cosine similarity calculates closest matches
5. Top similar images are returned and displayed

---

## 📈 Performance Highlights

* 🚀 Fast inference on CPU (optimized for free-tier hosting)
* ⚡ Indexed embeddings for rapid retrieval
* 📉 Minimal latency during search operations

---

## 🔮 Future Enhancements

* 🔍 Text-to-image search (CLIP integration)
* ☁️ Cloud storage (AWS S3 / Firebase)
* 👤 User authentication & saved collections
* 📊 Advanced filtering & recommendation system
* 🧠 Fine-tuned custom models

---

## 👩‍💻 Author

**DEEPSIKA R D**

* ID: 7376232AD125
* Branch: Computer Science & Design (B.E)
* Submission Date: March 27, 2026

---

## 📜 License

This project is for academic and educational purposes.
You may modify and extend it for personal or research use.

---

## ⭐ Acknowledgements

* PyTorch Team for deep learning framework
* Open-source community for tools and inspiration

---

> 💡 *VisuLens combines AI intelligence with modern UI design to create a seamless visual discovery experience.*
