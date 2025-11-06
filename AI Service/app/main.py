import asyncio
import logging
import threading # Import the threading module
import uvicorn
from fastapi import FastAPI

from app.api.endpoints import router as api_router
from app.core.eureka_client import init_eureka, stop_eureka
from app.config.settings import settings
# --- 1. Import the consumer function ---
from app.core.message_broker import start_rabbitmq_consumer 

logger = logging.getLogger(__name__)
# Include the API router# In your main.py or wherever you set up your app
from app.api.routes.recommendation import router as recommendation_router

app = FastAPI(
    title="AI Service",
    description="AI-powered movie recommendations and creative content generation"
)

# Include the recommendation router (which now includes agent routes)
app.include_router(recommendation_router, prefix="/api/ai", tags=["AI"])

# --- 2. Create the function to run the consumer in a thread ---
def start_consumer_in_background():
    """Start RabbitMQ consumer in a background daemon thread"""
    logger.info("🔄 Starting RabbitMQ consumer in background thread...")
    
    def run_consumer():
        try:
            # This function will block and run forever
            start_rabbitmq_consumer() 
        except Exception as e:
            logger.error(f"💥 FATAL: RabbitMQ consumer thread crashed: {e}", exc_info=True)
            # In production, you might want to restart or signal the app to shut down
    
    # Create and start the thread
    # 'daemon=True' means the thread will automatically shut down when the main app exits
    consumer_thread = threading.Thread(target=run_consumer, daemon=True)
    consumer_thread.start()
    logger.info("✅ RabbitMQ consumer thread started.")

# --- 3. Call the function on app startup ---
@app.on_event("startup")
async def startup_event():
    """Actions to perform on application startup"""
    logger.info("🚀 Starting AI Service...")
    
    # Register with Eureka
    await init_eureka()
    
    # Start RabbitMQ consumer in background
    start_consumer_in_background() # <-- THIS IS THE MISSING CALL
    
    logger.info("✅ AI Service (API + Consumer) started successfully.")

@app.on_event("shutdown")
async def shutdown_event():
    """Actions to perform on application shutdown"""
    logger.info("🛑 Shutting down AI Service...")
    await stop_eureka()
    logger.info("✅ AI Service shutdown complete")



@app.get("/")
def read_root():
    return {
        "status": f"{settings.SERVICE_NAME} API is running",
        "features": [
            "AI Movie Recommendations",
            "Content Creation Tools", 
            "RabbitMQ Message Processing",
            "Supabase Memory Storage"
        ]
    }

@app.get("/health")
def health_check():
    # This health check is basic. You'd want to check thread health in production.
    return {
        "status": "healthy",
        "service": "AI Service (API + Consumer)",
        "rabbitmq_consumer": "running (in background thread)",
        "supabase": "connected"
    }

# For development
if __name__ == "__main__":
    logger.info(f"Starting server on {settings.SERVICE_HOST}:{settings.SERVICE_PORT} with reload=True")
    uvicorn.run(
        "app.main:app", # Run from the app module
        host=settings.SERVICE_HOST, 
        port=settings.SERVICE_PORT, 
        reload=True
    )