from groq import Groq
from app.config.settings import settings

# Initialize the Groq client with the API key from settings
try:
    groq_client = Groq(api_key=settings.GROQ_API_KEY)
    print("Groq client initialized successfully.")
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    groq_client = None