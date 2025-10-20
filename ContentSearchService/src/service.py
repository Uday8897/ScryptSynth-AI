import pymongo
import requests
from typing import List, Optional
from .database import db
from .models import Movie
from .settings import settings

class ContentService:
    def __init__(self):
        """Initializes MongoDB connection and TMDB client setup."""
        self.collection = None
        
        # --- FIX 1 ---
        if db and db.movies is not None:
        # --- END FIX ---
            self.collection = db.movies
            print("✅ ContentService connected to MongoDB 'movies' collection.")
        else:
            print("⚠️ Warning: ContentService could not connect to MongoDB 'movies' collection. DB operations will fail.")
            self.collection = None

        # --- Setup for TMDB API Calls ---
        self.tmdb_base_url = settings.TMDB_API_URL
        self.tmdb_headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {settings.TMDB_READ_ACCESS_TOKEN}"
        }
        if not settings.TMDB_READ_ACCESS_TOKEN:
             print("⚠️ Warning: TMDB Read Access Token is missing. 'Now Playing' feature will fail.")


    # ---------------- Get Now Playing Movies (From TMDB API) ----------------
    def get_now_playing_movies(self, region: str = "IN", limit: int = 12) -> List[Movie]:
        # ... (This method is fine as it doesn't use self.collection) ...
        print(f"Fetching 'Now Playing' movies for region: {region} from TMDB API...")
        if not settings.TMDB_READ_ACCESS_TOKEN:
            print("❌ Cannot fetch 'Now Playing': TMDB Read Access Token is missing.")
            return []
        
        endpoint = "/movie/now_playing"
        params = {'region': region, 'page': 1, 
                  'language': 'en-US'
                  }

        try:
            response = requests.get( f"{self.tmdb_base_url}{endpoint}", headers=self.tmdb_headers, params=params)
            response.raise_for_status()
            data = response.json()
            results_raw = data.get('results', [])
            movies = []
            for movie_data in results_raw[:limit]:
                 try:
                     movie_obj = Movie.model_validate(movie_data)
                     movies.append(movie_obj)
                 except Exception as validation_error:
                     print(f"⚠️ Warning: Could not validate 'Now Playing' movie data from TMDB: {movie_data.get('title')}. Error: {validation_error}")
            print(f"✅ Successfully fetched {len(movies)} 'Now Playing' movies from TMDB.")
            return movies
        except requests.exceptions.RequestException as e:
            print(f"❌ TMDB API request failed for 'Now Playing': {e}")
            return []
        except Exception as e:
            print(f"❌ An unexpected error occurred fetching 'Now Playing': {e}")
            return []

    # ---------------- Latest Movies (From Local MongoDB) ----------------
    def get_latest_movies(self, limit: int = 12) -> List[Movie]:
        """ Fetches the latest released movies from the local MongoDB database. """
        print(f"Fetching latest {limit} movies from local MongoDB...")
        
        # --- FIX 2 ---
        if self.collection is None:
        # --- END FIX ---
             print("❌ Cannot fetch latest movies: MongoDB collection not available.")
             return []
        try:
            cursor = self.collection.find(
                {"release_date": {"$ne": None, "$exists": True}}, 
                sort=[("release_date", pymongo.DESCENDING)],
                limit=limit
            )
            movies = [Movie.model_validate(doc) for doc in cursor]
            print(f"✅ Successfully fetched {len(movies)} latest movies from DB.")
            return movies
        except Exception as e:
            print(f"❌ Error fetching latest movies from DB: {e}")
            return []

    # ---------------- Search Movies (From Local MongoDB) ----------------
    def search_movies(self, query: Optional[str], limit: int, sort_by: Optional[str], sort_order: str) -> List[Movie]:
        """ Searches movies in local MongoDB using text index or regex. """
        print(f"Searching movies in DB. Query: '{query}', Limit: {limit}, SortBy: {sort_by}, Order: {sort_order}")
        
        # --- FIX 3 (This was the line that crashed) ---
        if self.collection is None:
        # --- END FIX ---
             print("❌ Cannot search movies: MongoDB collection not available.")
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

            movies = [Movie.model_validate(doc) for doc in cursor]
            print(f"✅ Found {len(movies)} movies matching criteria in DB.")
            return movies
        except Exception as e:
            print(f"❌ Error searching movies in DB: {e}")
            return []

    # ---------------- Get Movie By ID (From Local MongoDB) ----------------
    def get_movie_by_id(self, movie_id: int) -> Optional[Movie]:
        """ Fetches a single movie by its ID from the local MongoDB. """
        print(f"Fetching movie by ID {movie_id} from local DB...")
        
        # --- FIX 4 ---
        if self.collection is None:
        # --- END FIX ---
             print(f"❌ Cannot get movie by ID {movie_id}: MongoDB collection not available.")
             return None
        try:
            doc = self.collection.find_one({'_id': movie_id})
            if doc:
                print(f"✅ Found movie '{doc.get('title')}' in DB.")
                return Movie.model_validate(doc) 
            else:
                 print(f"Movie ID {movie_id} not found in local DB.")
                 return None
        except Exception as e:
            print(f"❌ Error fetching movie by ID {movie_id} from DB: {e}")
            return None

    # ---------------- Get Movie Details (Fallback from TMDB API) ----------------
    def get_movie_details_from_tmdb(self, movie_id: int) -> Optional[Movie]:
        """ Fetches full details for a single movie ID directly from TMDB API. """
        # ... (This method is fine as it doesn't use self.collection) ...
        print(f"Fetching details for movie ID: {movie_id} directly from TMDB API...")
        if not settings.TMDB_READ_ACCESS_TOKEN:
            print("❌ Cannot fetch details: TMDB Read Access Token is missing.")
            return None

        endpoint = f"/movie/{movie_id}"
        params = {'language': 'en-US'} 

        try:
            response = requests.get( f"{self.tmdb_base_url}{endpoint}", headers=self.tmdb_headers, params=params)
            response.raise_for_status()
            movie_data = response.json()
            genre_names = [g['name'] for g in movie_data.get('genres', []) if 'name' in g]
            movie_obj = Movie(
                id=movie_data.get('id'), 
                title=movie_data.get('title'),
                overview=movie_data.get('overview'),
                release_date=movie_data.get('release_date'),
                poster_path=movie_data.get('poster_path'),
                vote_average=movie_data.get('vote_average'),
                genres=genre_names
            )
            print(f"✅ Successfully fetched details for '{movie_obj.title}' from TMDB.")
            return movie_obj
        except requests.exceptions.HTTPError as e:
             if e.response.status_code == 404:
                 print(f"❌ Movie ID {movie_id} not found on TMDB.")
             else:
                 print(f"❌ TMDB API request failed for movie {movie_id}: {e}")
             return None
        except Exception as e:
            print(f"❌ An unexpected error occurred fetching details for movie {movie_id} from TMDB: {e}")
            return None

# --- Instantiate the service ---
content_service = ContentService()