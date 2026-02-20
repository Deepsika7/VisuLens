# VisuLens: AI-Powered Visual Search Engine
## Project Submission Report

---

### 1. Literature & Repo Analysis

#### Repo A: [Deeplearning_Image_Similarity](https://github.com/vinayakarannil/Deeplearning_Image_Similarity)
*   **Approach**: ResNet50 (Keras) + Cosine Similarity.
*   **Pros**:
    1.  **High Accuracy Baseline**: resnet50 is extremely reliable.
    2.  **Ease of Deployment**: Minimal dependencies.
    3.  **Well Documented**: Clear structure for beginners.
*   **Cons**:
    1.  **O(N) Search Complexity**: Slows down with large datasets.
    2.  **Memory Heavy**: Stores raw embeddings without compression.
    3.  **No Dynamic Re-indexing**: Adding new data requires a restart.

#### Repo B: [Image-Similarity-Detection](https://github.com/mdhasnainali/Image-Similarity-Detection)
*   **Approach**: ResNet50 + PCA + FAISS.
*   **Pros**:
    1.  **Massive Scalability**: FAISS handles millions of images easily.
    2.  **Compressed Storage**: PCA reduces 2048 dims to manageable sizes.
    3.  **Standard for Production**: Used in industrial visual search.
*   **Cons**:
    1.  **Dependency Complexity**: FAISS installation can be fragile.
    2.  **Information Loss**: PCA can reduce precision slightly.
    3.  **Infrastructure Overhead**: Requires more complex server management.

---

### 2. Model Setup & Connectivity

The engine uses **PyTorch** with a pre-trained **ResNet50** model.

**Verification Script Output:**
```text
Loading ResNet50 model...
Model loaded successfully.
Output shape: torch.Size([1, 2048, 1, 1])
Feature extraction dimension verified (2048).
Model setup verified.
```

---

### 3. Architecture & DB Schema

#### Interaction Sequence
1. **User** uploads image via **React Frontend**.
2. **Flask Backend** receives file and passes it to **ML Module**.
3. **ResNet50** computes a **2048-dim embedding**.
4. **Similarity Engine** compares the vector against the **Pickle/Vector Store**.
5. **Top 20 matches** are returned as JSON metadata to the frontend.

#### Database Schema (ERD Logic)
*   **Users Table**: Identity & Auth (Email, Pwd).
*   **Image Table**: Metadata (Paths, IDs, Timestamps).
*   **Vector Table**: High-dim embeddings (Foreign Key to Image ID).
*   **Saved Pins**: Relational mapping between Users and Images.

---

### 4. UI/UX Wireframes

#### Layout Concept:
*   **Masonry Grid**: Fluid layout for image display.
*   **Shimmer Loading**: Pulse animation during AI processing.
*   **Visual Similarity Panel**: Overlay showing "More like this" results.

---

### 5. Git Boilerplate & Env Setup

**Structure:**
*   `/backend`: Flask, PyTorch model, storage logic, and `.env`.
*   `/frontend`: Vite/React with Tailwind/Vanilla CSS.
*   `/dataset`: Local search database.
*   `.gitignore`: Properly configured for Python/Node/VirtualEnvs.

---
*End of Report*
