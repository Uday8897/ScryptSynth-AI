import json

class ToolService:
    def __init__(self):
        # In a real system, this would connect to the Content DB (PostgreSQL)
        self._mock_movie_db = {
            "sci-fi": [
                {"title": "Inception", "rating": 8.8},
                {"title": "The Matrix", "rating": 8.7},
                {"title": "Blade Runner 2049", "rating": 8.0},
            ],
            "comedy": [
                {"title": "Superbad", "rating": 7.6},
                {"title": "The Hangover", "rating": 7.7},
            ],
        }

    def search_movies(self, genre: str) -> str:
        """
        A tool that searches for movies by genre.
        Returns a JSON string of the results.
        """
        print(f"TOOL USED: Searching for movies in genre: {genre}")
        genre = genre.lower()
        if genre in self._mock_movie_db:
            return json.dumps(self._mock_movie_db[genre])
        return json.dumps([])