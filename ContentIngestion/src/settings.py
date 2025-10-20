import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """A class to hold all application settings, loaded from environment variables."""
    MONGO_URI: str = os.getenv("MONGO_URI")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME")
    
    # --- TMDB Settings ---
    TMDB_API_KEY: str = os.getenv("TMDB_API_KEY")
    TMDB_READ_ACCESS_TOKEN: str = os.getenv("TMDB_READ_ACCESS_TOKEN")
    
    # Static configuration
    TMDB_API_URL: str = "https://api.themoviedb.org/3"
    START_YEAR: int = 2023
    END_YEAR: int = 2025

    @staticmethod
    def validate():
        """A simple validation to ensure critical settings are present."""
        if not all([Settings.MONGO_URI, Settings.MONGO_DB_NAME, Settings.TMDB_API_KEY, Settings.TMDB_READ_ACCESS_TOKEN]):
            raise ValueError("One or more critical environment variables are missing. "
                             "Please check your .env file.")

settings = Settings()
settings.validate()