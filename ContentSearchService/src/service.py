import pymongo
import requests
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from .database import db
from .models import Movie
from .settings import settings

router = APIRouter()

# --------------------------------------------------------------------------
# SERVICE CLASS
# --------------------------------------------------------------------------
class ContentService:
    def __init__(self):
        """Initializes MongoDB connection and TMDB client setup."""
        self.collection = None

        if db is not None and hasattr(db, "movies") and db.movies is not None:
            self.collection = db.movies
            print("✅ ContentService connected to MongoDB 'movies' collection.")
        else:
            print("⚠️ Warning: ContentService could not connect to MongoDB 'movies' collection.")
            self.collection = None

        self.tmdb_base_url = settings.TMDB_API_URL
        self.tmdb_headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {settings.TMDB_READ_ACCESS_TOKEN}"
        }
        if not settings.TMDB_READ_ACCESS_TOKEN:
            print("⚠️ Warning: TMDB Read Access Token is missing. TMDB API features will fail.")

    # ----------------------------------------------------------------------
    # CORE METHODS - RETURN ALL FIELDS
    # ----------------------------------------------------------------------
    def get_now_playing_movies(self, region: str = "IN", limit: int = 12) -> List[Dict[str, Any]]:
        if not settings.TMDB_READ_ACCESS_TOKEN:
            print("❌ Cannot fetch 'Now Playing': TMDB Read Access Token missing.")
            return []
        endpoint = "/movie/now_playing"
        params = {"region": region, "page": 1, "language": "en-US"}
        try:
            response = requests.get(
                f"{self.tmdb_base_url}{endpoint}",
                headers=self.tmdb_headers,
                params=params,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])[:limit]
            # Return raw data with all fields
            return results
        except Exception as e:
            print(f"❌ TMDB error (now playing): {e}")
            return []

    def get_latest_movies(self, limit: int = 12) -> List[Dict[str, Any]]:
        if self.collection is None:
            print("❌ No DB connection.")
            return []
        try:
            cursor = self.collection.find(
                {"release_date": {"$ne": None, "$exists": True}},
                sort=[("release_date", pymongo.DESCENDING)],
                limit=limit
            )
            # Return complete documents with all fields
            return list(cursor)
        except Exception as e:
            print(f"❌ DB error: {e}")
            return []

    def get_movie_by_id(self, movie_id: int) -> Optional[Dict[str, Any]]:
        if self.collection is None:
            return None
        try:
            # Convert movie_id to integer for MongoDB query
            try:
                movie_id_int = int(movie_id)
            except (ValueError, TypeError):
                return None
                
            doc = self.collection.find_one({"_id": movie_id_int})
            if doc:
                # Convert ObjectId to string for JSON serialization
                doc['_id'] = str(doc['_id'])
                return doc
            return None
        except Exception as e:
            print(f"❌ DB fetch error: {e}")
            return None

    def search_movies(self, query: Optional[str], limit: int, sort_by: Optional[str], sort_order: str) -> List[Dict[str, Any]]:
        if self.collection is None:
            return []
        try:
            filter_query = {}
            sort_params = []

            if query:
                filter_query = {"$text": {"$search": query}}
                sort_params.append(("score", {"$meta": "textScore"}))
            elif sort_by:
                direction = pymongo.DESCENDING if sort_order == "desc" else pymongo.ASCENDING
                sort_params.append((sort_by, direction))
            else:
                sort_params.append(("vote_average", pymongo.DESCENDING))

            cursor = self.collection.find(filter_query)
            if sort_params:
                cursor = cursor.sort(sort_params)
            if limit:
                cursor = cursor.limit(limit)
            
            # Return all fields from documents
            results = list(cursor)
            # Convert ObjectId to string for JSON serialization
            for doc in results:
                doc['_id'] = str(doc['_id'])
            return results
        except Exception as e:
            print(f"❌ Error searching DB: {e}")
            return []

    # ----------------------------------------------------------------------
    # ENHANCED SEARCH - RETURN ALL FIELDS
    # ----------------------------------------------------------------------
    def search_movies_with_fallback(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        exact_results = self._search_exact_title(query)
        if exact_results:
            return exact_results
        local_results = self._search_movies_fuzzy(query, limit)
        if local_results:
            return local_results
        return self._search_tmdb_and_save(query, limit)

    def _search_exact_title(self, query: str) -> List[Dict[str, Any]]:
        if self.collection is None:
            return []
        try:
            filter_query = {"title": {"$regex": f"^{query}$", "$options": "i"}}
            results = list(self.collection.find(filter_query))
            # Convert ObjectId to string for JSON serialization
            for doc in results:
                doc['_id'] = str(doc['_id'])
            return results
        except Exception as e:
            print(f"❌ Exact search error: {e}")
            return []

    def _search_movies_fuzzy(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        if self.collection is None:
            return []
        try:
            cursor = self.collection.find({"$text": {"$search": query}})
            cursor = cursor.sort([("score", {"$meta": "textScore"})]).limit(limit)
            results = list(cursor)
            # Convert ObjectId to string for JSON serialization
            for doc in results:
                doc['_id'] = str(doc['_id'])
            return results
        except Exception as e:
            print(f"❌ Fuzzy search error: {e}")
            return []

    def _search_tmdb_and_save(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        if not settings.TMDB_READ_ACCESS_TOKEN:
            return []
        try:
            response = requests.get(
                f"{self.tmdb_base_url}/search/movie",
                headers=self.tmdb_headers,
                params={"query": query, "page": 1, "language": "en-US"},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])[:limit]
            movies = []
            for movie_data in results:
                # Save to database
                self._save_movie_to_db(movie_data)
                # Return the complete movie data
                movies.append(movie_data)
            return movies
        except Exception as e:
            print(f"❌ TMDB fetch error: {e}")
            return []

    def _save_movie_to_db(self, movie_data: Dict[str, Any]):
        if self.collection is None:
            return
        try:
            movie_id = movie_data.get("id")
            if movie_id and self.collection.find_one({"_id": movie_id}) is None:
                # Create document with all fields from TMDB
                doc = movie_data.copy()
                doc["_id"] = doc.pop("id")  # Move 'id' to '_id' for MongoDB
                self.collection.insert_one(doc)
                print(f"✅ Saved movie to DB: {doc.get('title')} (ID: {movie_id})")
        except Exception as e:
            print(f"❌ Save error: {e}")

    def _get_genre_names(self, genre_ids: List[int]) -> List[str]:
        genre_map = {
            28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
            80: "Crime", 18: "Drama", 10751: "Family", 14: "Fantasy",
            36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery",
            10749: "Romance", 878: "Science Fiction", 10770: "TV Movie",
            53: "Thriller", 10752: "War", 37: "Western"
        }
        return [genre_map.get(i, f"Genre_{i}") for i in genre_ids]

    # ----------------------------------------------------------------------
    # ADDITIONAL METHODS FOR COMPLETE DATA
    # ----------------------------------------------------------------------
    def get_movie_with_watch_providers(self, movie_id: int) -> Optional[Dict[str, Any]]:
        """Get movie with watch providers information"""
        movie = self.get_movie_by_id(movie_id)
        if not movie:
            return None
        
        # Add watch providers from TMDB if not already in the document
        if 'watch_providers' not in movie and settings.TMDB_READ_ACCESS_TOKEN:
            try:
                response = requests.get(
                    f"{self.tmdb_base_url}/movie/{movie_id}/watch/providers",
                    headers=self.tmdb_headers,
                    timeout=10
                )
                if response.status_code == 200:
                    providers_data = response.json()
                    movie['watch_providers'] = providers_data.get('results', {})
                    # Update the document in database
                    self._update_movie_watch_providers(movie_id, movie['watch_providers'])
            except Exception as e:
                print(f"❌ Error fetching watch providers: {e}")
        
        return movie

    def _update_movie_watch_providers(self, movie_id: int, watch_providers: Dict[str, Any]):
        """Update watch providers in the database"""
        if self.collection is None:
            return
        try:
            self.collection.update_one(
                {"_id": movie_id},
                {"$set": {"watch_providers": watch_providers}}
            )
        except Exception as e:
            print(f"❌ Error updating watch providers: {e}")


# Global instance
content_service = ContentService()

# --------------------------------------------------------------------------
# ROUTES - RETURN ALL FIELDS
# --------------------------------------------------------------------------
@router.get("/api/content/search")
async def search_content(
    query: str = "",
    limit: int = Query(10, ge=1, le=50),
    genres: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None)
):
    try:
        if not query.strip():
            return {"movies": [], "total_count": 0, "message": "Empty query"}
        
        movies = content_service.search_movies_with_fallback(query, limit)
        
        # Apply additional filters if provided
        filtered_movies = []
        for movie in movies:
            # Filter by genres if provided
            if genres:
                movie_genres = movie.get('genres', [])
                if isinstance(movie_genres, list) and not any(genre.lower() in [g.lower() for g in movie_genres] for genre in genres.split(',')):
                    continue
            
            # Filter by minimum rating if provided
            if min_rating is not None:
                movie_rating = movie.get('vote_average', 0)
                if movie_rating < min_rating:
                    continue
            
            # Ensure poster_url is included
            if movie.get('poster_path'):
                movie['poster_url'] = f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"
            
            filtered_movies.append(movie)
        
        return {
            "movies": filtered_movies, 
            "total_count": len(filtered_movies), 
            "query": query,
            "filters_applied": {
                "genres": genres,
                "min_rating": min_rating
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {e}")


@router.get("/api/content/latest")
async def get_latest(limit: int = 12):
    """Get latest movies with all fields"""
    movies = content_service.get_latest_movies(limit)
    return movies


@router.get("/api/content/now-playing")
async def get_now_playing(region: str = "IN", limit: int = 12):
    """Get now playing movies with all fields"""
    movies = content_service.get_now_playing_movies(region, limit)
    return movies


@router.get("/api/content/movies/{movie_id}")
async def get_movie(movie_id: int):
    """Get movie by ID with all fields including watch providers"""
    movie = content_service.get_movie_with_watch_providers(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie


@router.get("/api/content/movies/{movie_id}/complete")
async def get_complete_movie(movie_id: int):
    """Get complete movie data with all possible information"""
    movie = content_service.get_movie_with_watch_providers(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    # Add additional TMDB information if available
    if settings.TMDB_READ_ACCESS_TOKEN:
        try:
            # Get credits
            credits_response = requests.get(
                f"{content_service.tmdb_base_url}/movie/{movie_id}/credits",
                headers=content_service.tmdb_headers,
                timeout=10
            )
            if credits_response.status_code == 200:
                movie['credits'] = credits_response.json()
            
            # Get similar movies
            similar_response = requests.get(
                f"{content_service.tmdb_base_url}/movie/{movie_id}/similar",
                headers=content_service.tmdb_headers,
                timeout=10
            )
            if similar_response.status_code == 200:
                movie['similar_movies'] = similar_response.json().get('results', [])[:6]
            
            # Get videos (trailers)
            videos_response = requests.get(
                f"{content_service.tmdb_base_url}/movie/{movie_id}/videos",
                headers=content_service.tmdb_headers,
                timeout=10
            )
            if videos_response.status_code == 200:
                movie['videos'] = videos_response.json().get('results', [])
                
        except Exception as e:
            print(f"❌ Error fetching additional movie data: {e}")
    
    return movie


@router.get("/api/content/movies")
async def get_movies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("vote_average"),
    sort_order: str = Query("desc")
):
    """Get paginated movies with all fields"""
    try:
        if content_service.collection is None:
            raise HTTPException(status_code=500, detail="Database not available")
        
        skip = (page - 1) * limit
        cursor = content_service.collection.find().skip(skip).limit(limit)
        
        # Apply sorting
        direction = pymongo.DESCENDING if sort_order == "desc" else pymongo.ASCENDING
        cursor = cursor.sort(sort_by, direction)
        
        movies = list(cursor)
        total = content_service.collection.count_documents({})
        
        # Convert ObjectId to string
        for movie in movies:
            movie['_id'] = str(movie['_id'])
        
        return {
            "movies": movies,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch movies: {e}")