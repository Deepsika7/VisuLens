FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Upgrade pip and install dependencies with custom CPU index
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Expose port (Render injects PORT env var dynamically)
EXPOSE $PORT

# Start with gunicorn
# --timeout 300 gives ResNet50 time to load without gunicorn killing the worker
CMD ["sh", "-c", "gunicorn app:app -w 1 -b 0.0.0.0:${PORT:-10000} --timeout 300"]
