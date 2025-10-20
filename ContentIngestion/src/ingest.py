from tqdm import tqdm
from .settings import settings
from .database import db_client
from .tmdb_client import tmdb_client

def run_ingestion():
    """
    The main orchestration function for the ingestion process.
    It fetches data year by year and page by page, then bulk-inserts into MongoDB.
    """
    print("🚀 Starting Content Ingestion Process...")

    try:
        # 1. Fetch and store genres first to create a local map
        print("Fetching genre map from TMDB...")
        genre_map, genres_to_store = tmdb_client.fetch_genres()
        if not genre_map:
            print("❌ Could not fetch genres. Aborting ingestion.")
            return
        db_client.upsert_genres(genres_to_store)

        # 2. Loop through each year and ingest movies
        for year in range(settings.START_YEAR, settings.END_YEAR + 1):
            print(f"\n--- Processing Year: {year} ---")
            
            # Fetch a limited number of pages for demonstration (e.g., 50 pages of ~20 movies each)
            # For a full run, you would loop through all available pages.
            pages_to_process = 50 
            
            for page in tqdm(range(1, pages_to_process + 1), desc=f"Ingesting {year}", unit="page"):
                movies_on_page = tmdb_client.discover_movies_by_year(year, page)
                if not movies_on_page:
                    break # Stop if a page has no movies

                movie_documents = []
                for movie_data in movies_on_page:
                    movie_id = movie_data.get('id')
                    if not movie_id:
                        continue

                    # Fetch watch providers for each movie
                    providers = tmdb_client.fetch_watch_providers(movie_id)
                    
                    # Assemble the final document for MongoDB
                    document = {
                        '_id': movie_id,
                        'title': movie_data.get('title'),
                        'overview': movie_data.get('overview'),
                        'release_date': movie_data.get('release_date'),
                        'poster_path': movie_data.get('poster_path'),
                        'vote_average': movie_data.get('vote_average'),
                        'genres': [genre_map.get(gid) for gid in movie_data.get('genre_ids', []) if gid in genre_map],
                        'watch_providers': providers
                    }
                    movie_documents.append(document)

                # Perform a single bulk write operation for the entire page
                db_client.bulk_upsert_movies(movie_documents)
        
        print("\n✅ Ingestion Complete!")

    except Exception as e:
        print(f"\n❌ An unexpected error occurred during ingestion: {e}")
    finally:
        # 3. Always ensure the database connection is closed
        db_client.close()

if __name__ == "__main__":
    run_ingestion()