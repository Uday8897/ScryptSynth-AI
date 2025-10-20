import uuid
from app.core.vector_store import embedding_model, memory_collection

class MemoryService:
    def add_memory(self, user_id: str, text_content: str):
        """
        Creates an embedding for a piece of text and stores it for a specific user.
        """
        embedding = embedding_model.encode(text_content).tolist()
        
        # Store the embedding, the original text, and the user_id as metadata
        memory_collection.add(
            ids=[str(uuid.uuid4())],
            embeddings=[embedding],
            documents=[text_content],
            metadatas=[{"user_id": user_id}]
        )
        print(f"Added new memory for user: {user_id}")

    def retrieve_memories(self, user_id: str, query_text: str, num_memories: int = 5) -> list[str]:
        """
        Retrieves the most relevant memories for a user based on a query.
        """
        query_embedding = embedding_model.encode(query_text).tolist()
        
        results = memory_collection.query(
            query_embeddings=[query_embedding],
            n_results=num_memories,
            where={"user_id": user_id} # Filter memories only for this specific user
        )
        
        return results['documents'][0] if results['documents'] else []