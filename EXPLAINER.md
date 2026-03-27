# 📖 VisuLens: Final Technical Walkthrough
**Use this guide to explain the project to your invigilator during the final demo.**

---

### 1. The AI Engine (`backend/ml_logic.py`)
*   **What to say:** "We use a pre-trained **ResNet50** model. Instead of using it to classify images (like 'dog' or 'cat'), we strip off the last layer to use it as a **Feature Extractor**."
*   **Key Logic:**
    *   **Transformations:** Images are resized to 224x224 and normalized so the math matches the original ResNet training.
    *   **Embeddings:** Every image is converted into a **2048-dimensional vector** (a list of 2048 numbers).
    *   **Similarity:** We use **Cosine Similarity** to compare the user's uploaded image vector against our dataset. The closer the vectors, the more similar the images.

### 2. The Backend (`backend/app.py`)
*   **What to say:** "The backend is a **Flask** server that acts as the bridge between our AI model and the React frontend."
*   **Key Logic:**
    *   **`/search`**: Receives an image, passes it to `ml_logic.py`, and returns the top matches.
    *   **`/images`**: Serves the initial 'Explore' feed.
    *   **Persistent Storage**: We use `embeddings.pkl` to store pre-calculated AI vectors so the site stays fast even on a free server.

### 3. The Frontend (`frontend/src/App.jsx`)
*   **What to say:** "The UI is built with **React** and **Vite**. We focused on a 'Premium Pinterest' aesthetic using a **Masonry Grid** and **Framer Motion** for smooth transitions."
*   **Key Logic:**
    *   **State Management**: `currentView` handles the switching between Landing, Explore, and Search Results without refreshing the page.
    *   **Responsiveness**: The grid automatically adjusts from 5 columns (Desktop) to 1 column (Mobile).

### 4. Cloud Optimization (The "Render" Secret)
*   **What to say:** "To make this work on Render's **Free Tier**, we implemented several 'Production-Grade' optimizations:"
    *   **CPU-Only Torch**: We use the CPU version of PyTorch to save 500MB of RAM.
    *   **Dataset Trimming**: We indexed the top **60 high-quality images** to ensure the build finishes in under 5 minutes.
    *   **Static UI Hosting**: The frontend is a **Static Site** on Render, meaning it never sleeps and is always online.

---

### 🛠️ Common Invigilator Questions (FAQ)

**Q: Why use ResNet50?**
*A: It is a balance of high accuracy and low memory usage. It's deep enough to understand textures and shapes but light enough to run on a free server.*

**Q: How do you handle search performance?**
*A: We don't calculate vectors every time a user visits. We pre-calculate them during the build process and store them in `embeddings.pkl`. Searching 60 images takes less than 5 milliseconds.*

**Q: What is the benefit of the 'Static Site' deployment?**
*A: Static sites on Render are served via a CDN (Content Delivery Network), meaning the UI loads instantly for users worldwide, even while the AI backend is 'waking up' from sleep mode.*
