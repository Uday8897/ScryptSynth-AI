from pymongo import MongoClient, UpdateOne
from pymongo.errors import ConnectionFailure
from .settings import settings

class Database:
    """Manages connection to MongoDB and provides bulk write capabilities."""
    def __init__(self):
        try:
            self.client = MongoClient(settings.MONGO_URI)
            # The ismaster command is cheap and does not require auth.
            self.client.admin.command('ismaster')
            self.db = self.client[settings.MONGO_DB_NAME]
            self.movies_collection = self.db['movies']
            self.genres_collection = self.db['genres']
            print("✅ MongoDB connection successful.")
        except ConnectionFailure as e:
            print(f"❌ MongoDB connection failed: {e}")
            raise

    def close(self):
        """Closes the MongoDB connection."""
        self.client.close()
        print("MongoDB connection closed.")

    def bulk_upsert_movies(self, movie_documents: list):
        """
        Performs a bulk upsert operation for movie documents.
        'upsert=True' means it will update existing movies and insert new ones.
        """
        if not movie_documents:
            return
            
        operations = [
            UpdateOne({'_id': doc['_id']}, {'$set': doc}, upsert=True)
            for doc in movie_documents
        ]
        self.movies_collection.bulk_write(operations)

    def upsert_genres(self, genres: list):
        """Performs a bulk upsert for genres to create a local genre map."""
        if not genres:
            return
            
        operations = [
            UpdateOne({'_id': genre['id']}, {'$set': {'name': genre['name']}}, upsert=True)
            for genre in genres
        ]
        self.genres_collection.bulk_write(operations)
        print(f"Successfully stored/updated {len(genres)} genres.")

# Instantiate the database connection
db_client = Database()