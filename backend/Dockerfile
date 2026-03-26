FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install dependencies (CPU version of PyTorch to save memory/space)
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code (including dataset/ and embeddings.pkl)
COPY . .

# Expose port
EXPOSE 5000

# Run with 1 worker to stay within Render Free tier's 512MB RAM limit
CMD ["sh", "-c", "gunicorn app:app -w 1 -b 0.0.0.0:${PORT:-10000} --timeout 120"]
