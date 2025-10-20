from fastapi import FastAPI
from app.api.endpoints import router as api_router
from app.core.eureka_client import init_eureka, stop_eureka
from app.config.settings import settings
import uvicorn

app = FastAPI(
    title="Curator AI Service",
    description="The core AI and LLM processing microservice for the Curator App.",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    """
    Actions to perform on application startup.
    - Register with Eureka server.
    """
    await init_eureka()

@app.on_event("shutdown")
async def shutdown_event():
    """
    Actions to perform on application shutdown.
    - De-register from Eureka server.
    """
    await stop_eureka()

# Include the API router
app.include_router(api_router, prefix="/api/ai")

@app.get("/")
def read_root():
    return {"status": f"{settings.SERVICE_NAME} is running"}

# To run this file directly for development
if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host=settings.SERVICE_HOST, 
        port=settings.SERVICE_PORT, 
        reload=True
    )