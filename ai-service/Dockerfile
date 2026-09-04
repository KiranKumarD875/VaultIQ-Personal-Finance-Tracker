FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install torch==2.2.1+cpu -f https://download.pytorch.org/whl/cpu/torch_stable.html && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download ML models so the container starts instantly
COPY download_models.py .
RUN python download_models.py

COPY . .
RUN mkdir -p saved_models

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]