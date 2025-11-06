import uuid
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.supabase_client import supabase_client
from sentence_transformers import SentenceTransformer
from app.config.settings import settings

logger = logging.getLogger(__name__)

# --- Initialize Model ---
try:
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("✅ SentenceTransformer model 'all-MiniLM-L6-v2' loaded successfully.")
except Exception as e:
    logger.error(f"❌ FATAL: Could not load SentenceTransformer model: {e}", exc_info=True)
    embedding_model = None

class MemoryService:
    def __init__(self):
        if embedding_model is None:
            raise ValueError("Embedding model failed to load. Service cannot start.")
        if supabase_client is None or supabase_client.client is None:
            raise ValueError("Supabase client is not initialized.")
            
        self.embedding_model = embedding_model
        self.client = supabase_client.client
        self.table_name = 'user_memories'
        logger.info("✅ MemoryService initialized with Supabase client.")

    def add_user_review(self, user_id: str, movie_title: str, review_text: str, rating: float = None):
        """Store user movie reviews in Supabase/pgvector"""
        try:
            rich_content = f"Movie: {movie_title}. Review: {review_text}. Rating: {rating if rating else 'Not rated'}"
            embedding = self.embedding_model.encode(rich_content).tolist()
            
            data_to_insert = {
                "user_id": user_id,
                "memory_type": "user_review",
                "movie_title": movie_title,
                "review_text": review_text,
                "rating": rating,
                "embedding": embedding
            }
            
            self.client.table(self.table_name).insert(data_to_insert).execute()
            logger.info(f"✅ Added review to Supabase for user {user_id} - Movie: {movie_title}")
        except Exception as e:
            logger.error(f"❌ Failed to add user review to Supabase for {user_id}: {e}", exc_info=True)

    def add_conversation_memory(self, user_id: str, query: str, response: str, agent_type: str):
        """Store conversation history in Supabase/pgvector"""
        try:
            conversation_content = f"User: {query}\nAI: {response}"
            embedding = self.embedding_model.encode(conversation_content).tolist()
            
            data_to_insert = {
                "user_id": user_id,
                "memory_type": "conversation",
                "agent_type": agent_type,
                "query_text": query,
                "response_text": response,
                "embedding": embedding
            }
            
            self.client.table(self.table_name).insert(data_to_insert).execute()
            logger.info(f"✅ Added conversation memory to Supabase for user {user_id}, agent: {agent_type}")
        except Exception as e:
            logger.error(f"❌ Failed to add conversation memory to Supabase for {user_id}: {e}", exc_info=True)

    def get_user_reviews(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve all user reviews from Supabase"""
        try:
            response = self.client.table(self.table_name) \
                .select("movie_title, review_text, rating, created_at") \
                .eq("user_id", user_id) \
                .eq("memory_type", "user_review") \
                .order("created_at", desc=True) \
                .limit(limit) \
                .execute()
            
            reviews = []
            for item in response.data:
                item['timestamp'] = item.pop('created_at', None)
                reviews.append(item)
            return reviews
            
        except Exception as e:
            logger.error(f"❌ Error retrieving user reviews from Supabase for {user_id}: {e}", exc_info=True)
            return []
            
    def get_similar_memories(self, user_id: str, query: str, mem_type: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Performs vector search for USER MEMORIES"""
        logger.info(f"RAG: Searching USER memories for user {user_id}, type {mem_type}")
        try:
            query_embedding = self.embedding_model.encode(query).tolist()
            
            response = self.client.rpc('match_user_memories', {
                'query_embedding': query_embedding,
                'match_user_id': user_id,
                'match_memory_type': mem_type,
                'match_threshold': 0.7,
                'match_count': limit
            }).execute()
            
            memories = []
            if response.data:
                for item in response.data:
                    memories.append({
                        "document": item.get('content'),
                        "metadata": item.get('metadata'),
                        "similarity": item.get('similarity')
                    })
            logger.info(f"RAG: Found {len(memories)} similar user memories.")
            return memories
        except Exception as e:
            logger.error(f"❌ Error retrieving similar memories (RAG) from Supabase for {user_id}: {e}", exc_info=True)
            return []

    def analyze_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Analyze user's movie preferences based on their reviews"""
        reviews = self.get_user_reviews(user_id)
        
        if not reviews:
            return {"genres": [], "themes": [], "preferred_ratings": [], "total_reviews": 0, "has_history": False}
        
        preferred_genres = []
        ratings = []
        
        genre_keywords = {
            'action': ['action', 'fight', 'battle', 'thriller', 'adventure'],
            'comedy': ['funny', 'comedy', 'laugh', 'humor', 'hilarious'],
            'drama': ['drama', 'emotional', 'heartfelt', 'touching', 'serious'],
            'sci-fi': ['sci-fi', 'science fiction', 'future', 'space', 'alien'],
            'horror': ['horror', 'scary', 'frightening', 'terror', 'creepy'],
            'romance': ['romance', 'love', 'relationship', 'romantic'],
            'fantasy': ['fantasy', 'magic', 'mythical', 'supernatural']
        }
        
        for review in reviews:
            review_lower = review.get('review_text', '').lower()
            for genre, keywords in genre_keywords.items():
                if any(keyword in review_lower for keyword in keywords):
                    preferred_genres.append(genre)
            if review.get('rating') is not None:
                try: ratings.append(float(review['rating']))
                except (ValueError, TypeError): pass
        
        return {
            "genres": list(set(preferred_genres)),
            "preferred_ratings": ratings,
            "total_reviews": len(reviews),
            "average_rating": round(sum(ratings) / len(ratings), 1) if ratings else 0.0,
            "has_history": True
        }

    def find_similar_movies(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Performs vector search against the MOVIE KNOWLEDGE BASE"""
        logger.info(f"RAG: Searching MOVIE KB for: '{query}'")
        try:
            query_embedding = self.embedding_model.encode(query).tolist()
            
            response = self.client.rpc('match_movies', {
                'query_embedding': query_embedding,
                'match_threshold': 0.5,
                'match_count': limit
            }).execute()
            
            movies = []
            if response.data:
                for item in response.data:
                    # print(item)
                    # Handle tmdbId conversion safely
                    tmdb_id = item.get('tmdbid')
                    print(tmdb_id)
                    try:
                        tmdb_id = int(tmdb_id) if tmdb_id is not None else 0
                    except (ValueError, TypeError):
                        tmdb_id = 0
                    
                    movie_data = {
                        "title": item.get('title'),
                        "year": item.get('release_year'),
                        "rating": item.get('vote_average'),
                        "genres": item.get('genres', []),
                        "overview": item.get('overview'),
                        "tmdbId": tmdb_id,  # Ensure this is always an integer
                        "poster_path": item.get('poster_path'),
                        "source": "supabase_rag",
                        "similarity": item.get('similarity')
                    }
                    if movie_data["poster_path"]:
                        movie_data["poster_url"] = f"https://image.tmdb.org/t/p/w500{movie_data['poster_path']}"
                    movies.append(movie_data)
            
            logger.info(f"✅ RAG: Movie KB found {len(movies)} matches.")
            return movies
            
        except Exception as e:
            logger.error(f"❌ Error searching movie knowledge base: {e}", exc_info=True)
            return []