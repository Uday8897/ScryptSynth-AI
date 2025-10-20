# --- Stage 1: Build Dependencies ---
# Use a full Python image to build dependencies
FROM python:3.11-slim AS builder

# Set working directory
WORKDIR /app

# Copy requirements file and install dependencies
# This creates a layer that is cached by Docker
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# --- Stage 2: Run Application ---
# Use a "slim" image for the final, smaller container
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy installed dependencies from the 'builder' stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy the .env file (though ConfigMaps/Secrets are better for production)
# COPY .env .

# Copy your application source code
COPY src ./src

# --- !! IMPORTANT !! ---
# EXPOSE the port this service runs on. You MUST change this for each service!
# 8000 for AI-Service
# 8001 for ContentSearchService
# 8002 for Creative-AI-Service
EXPOSE 8000

# The command to run your FastAPI application with Uvicorn
# It runs the 'app' instance from the 'src.main' module
# Make sure the port here matches the EXPOSE port!
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]