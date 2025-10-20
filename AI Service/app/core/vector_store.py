import chromadb
from sentence_transformers import SentenceTransformer
from app.config.settings import settings

# Initialize ChromaDB client. 'path' makes it persist to disk.
chroma_client = chromadb.PersistentClient(path=settings.VECTOR_STORE_PATH)

# Initialize the model that will create the vector embeddings
embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)

# Get or create a "collection" which is like a table in a database
# This is where we will store user memories
memory_collection = chroma_client.get_or_create_collection(name="user_memories")

print("Vector store and embedding model initialized.")