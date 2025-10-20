# --- Stage 1: Build Dependencies ---
FROM python:3.11-slim AS builder

WORKDIR /app

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# --- Stage 2: Run Application ---
FROM python:3.11-slim

WORKDIR /app

# Copy installed dependencies from the 'builder' stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy your application source code (using 'app' directory)
COPY app ./app

# Copy the consumer script
COPY start_consumer.py .

# Expose the port for the FastAPI web server
EXPOSE 8000

# The default command will be to run the web server
# We will start the consumer as a separate process using docker-compose
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]