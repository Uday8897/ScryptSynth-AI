import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    TMDB_API_URL: str = "https://api.themoviedb.org/3"
    TMDB_API_KEY: str = os.getenv("TMDB_API_KEY")
    TMDB_READ_ACCESS_TOKEN: str = os.getenv("TMDB_READ_ACCESS_TOKEN")
    MONGO_URI: str = os.getenv("MONGO_URI")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME")
    
    SERVICE_NAME: str = os.getenv("SERVICE_NAME", "content-search-service")
    SERVICE_PORT: int = int(os.getenv("SERVICE_PORT", 8001))
    SERVICE_HOST: str = os.getenv("SERVICE_HOST", "127.0.0.1")
    
    EUREKA_SERVER: str = os.getenv("EUREKA_SERVER")

settings = Settings()