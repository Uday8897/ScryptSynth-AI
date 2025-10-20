import asyncio
from typing import List, Optional # Import Optional
from fastapi import FastAPI, HTTPException, Query, status
import py_eureka_client.eureka_client as eureka_client
import uvicorn

from .settings import settings
from .service import content_service # Imports the instance created in service.py
from .models import Movie

# Initialize FastAPI app
app = FastAPI(
    title="Content Service",
    description="Provides APIs for searching, retrieving, and discovering movie data from MongoDB and TMDB."
)

# --- Eureka Registration ---
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
        # Consider exiting if Eureka registration is critical
        # import sys
        # sys.exit(1)

@app.on_event("shutdown")
async def shutdown_event():
    await eureka_client.stop_async()

# --- API Endpoints ---

@app.get("/api/content/search", response_model=List[Movie])
async def search_movies(
    query: Optional[str] = Query(None, min_length=1, description="Text query for movie title or overview"), # Make query optional
    limit: int = Query(12, ge=1, le=50),
    sort_by: Optional[str] = Query(None, description="Field to sort by (e.g., 'release_date', 'vote_average')"),
    sort_order: str = Query("desc", regex="^(asc|desc)$")
):
    """
    Search for movies in the local database based on a text query with optional sorting and limiting.
    If no query is provided, returns movies sorted by the specified field or default.
    """
    results = content_service.search_movies(
        query=query,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order
    )
    # Don't raise 404 if no results, just return empty list for searches
    return results

@app.get("/api/content/latest", response_model=List[Movie])
async def get_latest_movies(
    limit: int = Query(12, ge=1, le=50, description="Number of latest movies to return")
):
    """
    Get the latest released movies from the local MongoDB, sorted by release date (newest first).
    """
    results = content_service.get_latest_movies(limit)
    # Return empty list if no results
    return results

@app.get("/api/content/movies/{movie_id}", response_model=Movie)
async def get_movie_by_id_local(movie_id: int):
    """
    Retrieve a single movie by its unique ID from the local MongoDB.
    """
    movie = content_service.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Movie with ID {movie_id} not found in local database.")
    return movie

@app.get("/api/content/now-playing", response_model=List[Movie])
async def get_now_playing(
    region: str = Query("IN", description="Region code (e.g., IN, US)"),
    limit: int = Query(18, ge=1, le=40, description="Max number of movies to return") # Increased limit
):
    """
    Get a list of movies currently playing in theaters in the specified region, fetched directly from TMDB.
    """
    results = content_service.get_now_playing_movies(region=region, limit=limit)
    return results # Return empty list if TMDB call fails or finds nothing

@app.get("/api/content/tmdb/{movie_id}", response_model=Movie)
async def get_movie_directly_from_tmdb(movie_id: int):
    """
    Fetches movie details directly from the TMDB API.
    Used as a fallback if the movie isn't in the local DB.
    """
    movie = content_service.get_movie_details_from_tmdb(movie_id)
    if not movie:
        # If TMDB call fails or doesn't find the movie
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Movie with ID {movie_id} not found on TMDB.")
    return movie

@app.get("/")
def read_root():
    return {"status": f"{settings.SERVICE_NAME} is running"}

# --- Run Block ---
if __name__ == "__main__":
    """ Allows running the app directly using 'python -m src.main' """
    uvicorn.run(
        "src.main:app", # Point to the FastAPI app instance
        host=settings.SERVICE_HOST,
        port=settings.SERVICE_PORT,
        reload=True # Enable auto-reload for development
    )