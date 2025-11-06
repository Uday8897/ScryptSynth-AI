from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class MovieRecommendation(BaseModel):
    title: str
    year: int
    rating: float
    genres: List[str]
    overview: str
    tmdbId: int = Field(..., description="TMDB ID must be an integer")
    poster_path: Optional[str] = None
    poster_url: Optional[str] = None
    source: str = "supabase_rag"
    similarity: Optional[float] = None
    match_confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")

class UserInsights(BaseModel):
    preference_confidence: float
    preferred_genres: List[str]
    personalization_level: str

class RecommendationResponse(BaseModel):
    agent_type: str
    user_insights: UserInsights
    recommendations: List[MovieRecommendation]
    personalized_explanation: str
    next_suggestions: List[str]
    error: Optional[str] = None

class IdeaGenerationResponse(BaseModel):
    agent_type: str
    ideas: List[Dict[str, Any]]
    error: Optional[str] = None

class ShortsScriptResponse(BaseModel):
    agent_type: str
    script: Dict[str, Any]
    error: Optional[str] = None

class CaptionOptimizerResponse(BaseModel):
    agent_type: str
    options: List[Dict[str, Any]]
    error: Optional[str] = None

class ErrorResponse(BaseModel):
    agent_type: str
    error: str
    raw_error: Optional[str] = None
    suggestion: Optional[str] = None
class IdeaGenerationResponse(BaseModel):
    agent_type: str = "idea_generation"
    ideas: List[Dict[str, Any]]
    error: Optional[str] = None

class ShortsScriptResponse(BaseModel):
    agent_type: str = "shorts_script"
    script: Dict[str, Any]
    error: Optional[str] = None

class CaptionOptimizerResponse(BaseModel):
    agent_type: str = "caption_optimizer"
    options: List[Dict[str, Any]]
    error: Optional[str] = None

class AgentRouteResponse(BaseModel):
    agent_type: str
    data: Optional[Dict[str, Any]] = None
    ideas: Optional[List[Dict[str, Any]]] = None
    script: Optional[Dict[str, Any]] = None
    options: Optional[List[Dict[str, Any]]] = None
    recommendations: Optional[List[MovieRecommendation]] = None
    user_insights: Optional[Dict[str, Any]] = None
    personalized_explanation: Optional[str] = None
    next_suggestions: Optional[List[str]] = None
    error: Optional[str] = None