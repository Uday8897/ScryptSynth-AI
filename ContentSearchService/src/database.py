from pymongo import MongoClient, TEXT
from .settings import settings

class Database:
    """Manages the MongoDB connection and ensures the search index exists."""
    def __init__(self):
        try:
            self.client = MongoClient(settings.MONGO_URI)
            self.db = self.client[settings.MONGO_DB_NAME]
            self.movies = self.db['movies']
            print("✅ MongoDB connection successful.")
            self._ensure_search_index()
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            raise

    def _ensure_search_index(self):
        """
        Creates a text index on the 'title' and 'overview' fields if it doesn't exist.
        This is the key to fast, production-grade text search.
        """
        index_name = "title_overview_text_index"
        if index_name not in self.movies.index_information():
            print("Creating text search index on 'movies' collection...")
            self.movies.create_index([("title", TEXT), ("overview", TEXT)], name=index_name)
            print("✅ Text search index created.")
        else:
            print("Text search index already exists.")

db = Database()