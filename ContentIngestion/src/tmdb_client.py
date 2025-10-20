import requests
from .settings import settings

class TMDBClient:
    """A client for interacting with The Movie Database (TMDB) API."""

    def __init__(self):
        self.access_token = settings.TMDB_READ_ACCESS_TOKEN
        self.base_url = settings.TMDB_API_URL
        self.headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {self.access_token}"
        }
        if not self.access_token:
            raise ValueError("TMDB_READ_ACCESS_TOKEN is not configured.")
        print("TMDB Client initialized with Bearer Token authentication.")

    def _make_request(self, endpoint: str, params: dict = None) -> dict:
        """Helper function to make a GET request to the TMDB API using Bearer Token auth."""
        try:
            # The API key is no longer needed in params when using a Bearer Token
            response = requests.get(f"{self.base_url}{endpoint}", headers=self.headers, params=params)
            response.raise_for_status() # Raises an HTTPError for bad responses (4xx or 5xx)
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ API request failed for endpoint {endpoint}: {e}")
            return {}

    def fetch_genres(self) -> dict:
        """Fetches the official genre list for movies."""
        data = self._make_request("/genre/movie/list")
        genres = data.get('genres', [])
        return {genre['id']: genre['name'] for genre in genres}, genres

    def discover_movies_by_year(self, year: int, page: int) -> list:
        """Fetches a page of movies for a specific year, sorted by popularity."""
        params = {
            'primary_release_year': year,
            'sort_by': 'popularity.desc',
            'page': page
        }
        data = self._make_request("/discover/movie", params=params)
        return data.get('results', [])

    def fetch_watch_providers(self, movie_id: int) -> dict:
        """Fetches watch provider information for a movie, focusing on India (IN)."""
        data = self._make_request(f"/movie/{movie_id}/watch/providers")
        return data.get('results', {}).get('IN', {})

# Instantiate the TMDB client
tmdb_client = TMDBClient()