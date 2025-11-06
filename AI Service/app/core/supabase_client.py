import os
import logging
from supabase import create_client, Client
from app.config.settings import settings

logger = logging.getLogger(__name__)

class SupabaseClient:
    def __init__(self):
        self.client: Client = None
        self._connect()

    def _connect(self):
        """Initialize Supabase client"""
        try:
            self.client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
            logger.info("✅ Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {e}")
            raise

    def health_check(self):
        """Check Supabase connection"""
        try:
            # Simple query to test connection
            result = self.client.table('user_memories').select('count', count='exact').limit(1).execute()
            return {
                "status": "healthy",
                "database": "connected",
                "timestamp": "2024-01-01T00:00:00Z"  # You might want to get actual timestamp from DB
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": "2024-01-01T00:00:00Z"
            }

# Singleton instance
supabase_client = SupabaseClient()