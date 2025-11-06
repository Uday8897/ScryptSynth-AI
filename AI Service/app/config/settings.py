from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env', 
        env_file_encoding='utf-8',
        extra='ignore'  # This will ignore extra fields in environment
    )
    TMDB_API_URL: str = "https://api.themoviedb.org/3"
    TMDB_API_KEY: str = os.getenv("TMDB_API_KEY")
    TMDB_READ_ACCESS_TOKEN: str = os.getenv("TMDB_READ_ACCESS_TOKEN")
    # Service Configuration (ADD THESE)
    SERVICE_NAME: str = "ai-service"
    SERVICE_HOST: str = "127.0.0.1"
    SERVICE_PORT: int = 8000
    
    # Groq AI Configuration
    GROQ_API_KEY: str
    GROQ_MODEL_NAME: str = "openai/gpt-oss-20b"
    
    # MongoDB Configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    MONGODB_DB: str = os.getenv("MONGODB_DB", "curator_db")
    MONGODB_MOVIES_COLLECTION: str = os.getenv("MONGODB_MOVIES_COLLECTION", "movies")
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    # Eureka Configuration
    EUREKA_SERVER: str = "http://localhost:8761/eureka"
    SUPABASE_URL: str = "https://rcmfpqknfelzkjmnggea.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjbWZwcWtuZmVsemtqbW5nZ2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTExNjgsImV4cCI6MjA3NzQ4NzE2OH0.QJoUSrJIZvEIrlBWmadIqiwRiEQIG9w9BPg6dLF1yQ0"  # You'll need to get this from Supabase dashboard
    
    # Database Configuration
    DATABASE_URL: str = "postgresql://postgres:Uday@889746@db.rcmfpqknfelzkjmnggea.supabase.co:5432/postgres"
    
    # Content Search Service
    CONTENT_SEARCH_SERVICE_URL: str = os.getenv("CONTENT_SEARCH_SERVICE_URL", "")
    CONTENT_SEARCH_SERVICE_PORT: int = int(os.getenv("CONTENT_SEARCH_SERVICE_PORT", "8001"))
    
    # Service timeouts
    HTTP_REQUEST_TIMEOUT: int = 30
    SERVICE_RETRY_ATTEMPTS: int = 3
    
    # RabbitMQ Configuration
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_QUEUE: str = "user_activity_queue"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USERNAME: str = "guest"
    RABBITMQ_PASSWORD: str = "guest"

    # Vector Store Configuration
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"

settings = Settings()