from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')
    
    # Groq AI Configuration
    GROQ_API_KEY: str
    GROQ_MODEL_NAME: str = "openai/gpt-oss-20b" # <-- ADD THIS LINE

    # Service Configuration
    SERVICE_NAME: str = "ai-service"
    SERVICE_HOST: str = "127.0.0.1"
    SERVICE_PORT: int = 8000
    EUREKA_SERVER: str
    
    # RabbitMQ Configuration
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_QUEUE: str = "user_activity_queue"

    # Vector Store Configuration
    VECTOR_STORE_PATH: str = "local_chroma_db"
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"

settings = Settings()