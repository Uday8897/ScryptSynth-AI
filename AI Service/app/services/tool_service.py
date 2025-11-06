import httpx
import json
import logging
from typing import Dict, Any, List, Optional
from app.config.settings import settings
from app.services.memory_service import MemoryService # Import for preference analysis
from datetime import datetime

logger = logging.getLogger(__name__)

class ToolService:
    """
    Makes REAL API calls to the Content-Search-Service.
    This service is the 'tool' that the CreativeAgentService uses.
    """

    def __init__(self):
        # The base URL for the ContentSearchService
        # We get this from settings, which reads the .env file
        self.search_service_url = f"http://{settings.CONTENT_SEARCH_HOST}:{settings.CONTENT_SEARCH_PORT}"
        self.memory_service: Optional[MemoryService] = None
        logger.info(f"🚀 ToolService initialized. Target Content-Search-Service: {self.search_service_url}")

    def set_memory_service(self, memory_service: MemoryService):
        """Inject memory service for intelligent search."""
        self.memory_service = memory_service
        logger.info("✅ MemoryService injected into ToolService.")

    async def intelligent_search(self, user_id: str, query: str, limit: int = 10) -> str:
        """
        Performs an intelligent search by:
        1. Analyzing user preferences from MemoryService.
        2. Refining the search parameters.
        3. Calling the Content-Search-Service with these refined parameters.
        """
        logger.info(f"🧠 INTELLIGENT SEARCH for user {user_id}, query: '{query}'")
        
        if not self.memory_service:
            logger.warning("MemoryService not injected, falling back to simple search.")
            # Fallback calls the *simple* search method below
            return await self.search_movies(query=query, limit=limit)

        # 1. Analyze user preferences from Supabase (via MemoryService)
        preferences = self.memory_service.analyze_user_preferences(user_id)
        
        # 2. Refine search parameters
        search_genres = preferences.get("genres", [])
        avg_rating = preferences.get("average_rating", 6.0)
        # Set a reasonable minimum rating based on user history, or default
        min_rating = (avg_rating - 1.0) if avg_rating > 6.0 else 5.0

        # Extract genres from the query itself to add to the search
        genre_keywords = {
            "horror": "horror", "thriller": "thriller", "comedy": "comedy", "action": "action",
            "sci-fi": "science fiction", "drama": "drama", "romance": "romance"
        }
        for key, val in genre_keywords.items():
            if key in query.lower():
                search_genres.append(val)
        search_genres = list(set(search_genres)) # Deduplicate
            
        logger.info(f"🧠 Prefs: Genres={search_genres}, MinRating={min_rating:.1f}, Query='{query}'")

        # 3. Perform the search by calling our *own* search_movies method
        search_json_string = await self.search_movies(
            query=query,
            limit=limit,
            genres=search_genres,
            min_rating=min_rating
        )
        
        search_data = json.loads(search_json_string)
            
        # 4. Format the result for the AI
        result = {
            "query_analysis": {
                "original_query": query,
                "transformed_query": query, # We just pass the original query
                "preference_confidence": 0.8 if preferences.get("has_history") else 0.2,
                "preferences_used": {"genres": search_genres, "min_rating": min_rating},
                "user_history_available": preferences.get("has_history", False)
            },
            "recommendation_context": {
                "search_strategy": f"Intelligent search on Content-Search-Service",
                "filters_applied": f"Genres: {search_genres}, Min Rating: {min_rating:.1f}"
            },
            "movies": search_data.get("movies", []),
            "total_count": search_data.get("total_count", 0),
            "source": search_data.get("source", "unknown")
        }
        return json.dumps(result, ensure_ascii=False, default=str)

    async def search_movies(
        self, 
        query: str = "", 
        limit: int = 10,
        genres: Optional[List[str]] = None,
        min_rating: Optional[float] = None
    ) -> str:
        """
        Calls the Content-Search-Service /api/content/search endpoint
        with all the filters.
        """
        logger.info(f"🎬 TOOL: Calling Content-Search-Service - '{query}', genres: {genres}, limit: {limit}")
        
        # Build query parameters
        params = {"query": query, "limit": limit}
        if genres:
            # Send genres as a list of query parameters
            # e.g., ?genres=action&genres=thriller
            params["genres"] = genres 
        if min_rating:
            params["min_rating"] = min_rating

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.search_service_url}/api/content/search",
                    params=params,
                    timeout=10.0
                )
                response.raise_for_status() # Raise error for 4xx/5xx
                
                # The search service returns a list of movies (List[Movie])
                # We package this into the JSON string format our agent expects.
                movies = response.json()
                result = {
                    "movies": movies,
                    "total_count": len(movies),
                    "source": "content-search-service", # Source is our other service
                    "query": query,
                    "timestamp": datetime.now().isoformat()
                }
                return json.dumps(result, ensure_ascii=False, default=str)

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warn(f"⚠️ No movies found by Content-Search-Service for query: '{query}'")
                return json.dumps({"movies": [], "total_count": 0, "source": "content-search-service"})
            logger.error(f"❌ HTTP error calling Content-Search-Service: {e}")
            return json.dumps({"movies": [], "total_count": 0, "source": "error", "error": str(e)})
        except httpx.RequestError as e:
             logger.error(f"❌ Network error calling Content-Search-Service: {e}")
             return json.dumps({"movies": [], "total_count": 0, "source": "error", "error": f"Network error: {e}"})
        except Exception as e:
            logger.error(f"❌ ToolService search_movies failed: {e}", exc_info=True)
            return json.dumps({"movies": [], "total_count": 0, "source": "error", "error": str(e)})
tool_service=ToolService()