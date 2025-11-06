import asyncio
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, status
import py_eureka_client.eureka_client as eureka_client
import uvicorn

from .settings import settings
from .service import content_service, router  # Import the router from service
from .models import Movie

app = FastAPI(
    title="Content Service",
    description="Provides APIs for searching, retrieving, and discovering movie data from MongoDB and TMDB."
)

# Include the router from service.py
app.include_router(router)

@app.on_event("startup")
async def startup_event():
    try:
        await eureka_client.init_async(
            eureka_server=settings.EUREKA_SERVER,
            app_name=settings.SERVICE_NAME,
            instance_port=settings.SERVICE_PORT,
            instance_host=settings.SERVICE_HOST,
        )
        print(f"✅ Service '{settings.SERVICE_NAME}' registered with Eureka on port {settings.SERVICE_PORT}.")
    except Exception as e:
        print(f"❌ Could not register with Eureka: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    await eureka_client.stop_async()

# Keep only the endpoints that are NOT in service.py
@app.get("/api/content/movies/{movie_id}", response_model=Movie)
async def get_movie_by_id_local(movie_id: int):
    """
    Retrieve a single movie by its unique ID from the local MongoDB.
    """
    movie = content_service.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Movie with ID {movie_id} not found in local database.")
    return movie

@app.get("/api/content/tmdb/{movie_id}", response_model=Movie)
async def get_movie_directly_from_tmdb(movie_id: int):
    """
    Fetches movie details directly from the TMDB API.
    Used as a fallback if the movie isn't in the local DB.
    """
    movie = content_service.get_movie_details_from_tmdb(movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Movie with ID {movie_id} not found on TMDB.")
    return movie

@app.get("/")
def read_root():
    return {"status": f"{settings.SERVICE_NAME} is running"}

if __name__ == "__main__":
    """ Allows running the app directly using 'python -m src.main' """
    uvicorn.run(
        "src.main:app", 
        host=settings.SERVICE_HOST,
        port=settings.SERVICE_PORT,
        reload=True 
    )