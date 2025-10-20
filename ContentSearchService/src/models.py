from pydantic import BaseModel, Field, AliasChoices
from typing import List, Optional, Union, Dict, Any

class Movie(BaseModel):
    # Use AliasChoices to accept either '_id' from Mongo or 'id' from TMDB
    # Use validation_alias to prioritize '_id' if both are somehow present
    id: int = Field(..., validation_alias=AliasChoices('_id', 'id'))
    title: Optional[str] = None
    overview: Optional[str] = None
    release_date: Optional[str] = None # Keep as string for simplicity
    poster_path: Optional[str] = None
    vote_average: Optional[float] = None
    # Accept either a list of strings (from Mongo) or a list of dicts/ints (from TMDB)
    genres: Optional[List[Union[str, int, Dict[str, Any]]]] = []
    # Include watch_providers if you store it in Mongo
    watch_providers: Optional[Dict[str, Any]] = None

    class Config:
        # Allow population by alias (e.g., using '_id' to set 'id')
        populate_by_name = True
        # Allow extra fields from TMDB/Mongo if not explicitly defined
        extra = 'ignore'