from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import json
import logging

# Import the singleton instance of your main agent
from app.services.creative_agent_service import creative_agent, CreativeAgentService

logger = logging.getLogger(__name__)

# ---
# --- 1. ALL PYDANTIC MODELS ARE DEFINED HERE ---
# ---

class AIResponse(BaseModel):
    """Generic response for simple text/markdown generation"""
    response: str

# --- Main Creative Router ---
class CreativeAssistRequest(BaseModel):
    user_id: str
    query: str

class CreativeAssistResponse(BaseModel):
    success: bool
    agent_type: str
    data: Dict[str, Any]

# --- Agent-Specific Payloads ---

# 1. Movie Recommendation
class MovieRecommendation(BaseModel):
    title: str
    year: int
    tmdbId: int
    rating: float
    genres: List[str]
    overview: str
    poster_url: Optional[str] = None
    match_confidence: float

class MovieRecResponse(BaseModel):
    agent_type: str = "movie_recommendation"
    user_insights: Dict[str, Any]
    recommendations: List[MovieRecommendation]
    personalized_explanation: str
    next_suggestions: List[str]

# 2. Trend Idea Generator
class Idea(BaseModel):
    title: str
    concept: str
    difficulty: str
    hashtags: List[str]

class TrendIdeaResponse(BaseModel):
    agent_type: str = "idea_generation"
    ideas: List[Idea]

# 3. Shorts Script Creator
class Script(BaseModel):
    hook: str
    body: str
    cta: str
    estimated_duration: str
    hashtags: List[str]

class ShortsScriptResponse(BaseModel):
    agent_type: str = "shorts_script"
    script: Script

# 4. Caption Optimizer
class CaptionOption(BaseModel):
    title: str
    caption: str
    hashtags: List[str]
    tone: str

class CaptionResponse(BaseModel):
    agent_type: str = "caption_optimizer"
    options: List[CaptionOption]

# --- Error Response ---
class ErrorResponse(BaseModel):
    agent_type: str = "error"
    error: str
    message: Optional[str] = None


# ---
# --- 2. ROUTER & ENDPOINTS ---
# ---

router = APIRouter()

def get_agent_service():
    """Dependency injector for the singleton agent service"""
    return creative_agent

@router.post(
    "/recommend/personal", 
    response_model=MovieRecResponse, 
    response_model_exclude_unset=True,
    summary="Get a personalized movie recommendation"
)
async def personal_recommendation(
    request: CreativeAssistRequest, # Use the request with user_id
    agent_service: CreativeAgentService = Depends(get_agent_service)
) -> Dict[str, Any]:
    """
    Main endpoint for all personal recommendations.
    Calls the independent RAG-based recommender.
    """
    try:
        result_dict = await agent_service.get_ai_recommendation(request.user_id, request.query)
        if result_dict.get("error"):
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result_dict.get("error"))
        return result_dict # FastAPI will validate this dict against MovieRecResponse
    except Exception as e:
        logger.error(f"❌ Error in /recommend/personal endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Recommendation failed: {str(e)}")

@router.post(
    "/creative/assist", 
    response_model=CreativeAssistResponse,
    summary="Auto-routing creative assistant"
)
async def creative_assistance(
    request: CreativeAssistRequest, # This request has user_id
    agent_service: CreativeAgentService = Depends(get_agent_service)
):
    """
    Main routing endpoint that automatically detects intent
    (e.g., 'recommendation' vs 'brainstorm') and calls the right agent.
    """
    try:
        result_data = await agent_service.route_agent(request.user_id, request.query)
        return CreativeAssistResponse(
            success=not result_data.get("error"),
            data=result_data,
            agent_type=result_data.get("agent_type", "unknown")
        )
    except Exception as e:
        logger.error(f"❌ Error in /creative/assist endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Creative assistance failed: {str(e)}")

# --- Direct Creative Agent Endpoints (Now also use CreativeAssistRequest) ---

@router.post(
    "/creative/brainstorm", 
    response_model=TrendIdeaResponse, 
    response_model_exclude_unset=True,
    summary="Brainstorm content ideas"
)
async def brainstorm(
    request: CreativeAssistRequest, # Use request with user_id for memory
    agent_service: CreativeAgentService = Depends(get_agent_service)
):
    """
    Directly calls the Trend/Idea Generation agent.
    """
    try:
        similar_memories = agent_service.memory_service.get_similar_memories(request.user_id, request.query, 'conversation', 3)
        result = await agent_service.trend_idea_agent(request.query, similar_memories)
        if result.get("error"):
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("error"))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Brainstorming failed: {str(e)}")

@router.post(
    "/creative/shorts-content", 
    response_model=ShortsScriptResponse, 
    response_model_exclude_unset=True,
    summary="Generate a short-form video script"
)
async def shorts_content(
    request: CreativeAssistRequest, # Use request with user_id for memory
    agent_service: CreativeAgentService = Depends(get_agent_service)
):
    """
    Directly calls the Shorts Script Creator agent.
    """
    try:
        similar_memories = agent_service.memory_service.get_similar_memories(request.user_id, request.query, 'conversation', 3)
        result = await agent_service.shorts_script_agent(request.query, similar_memories)
        if result.get("error"):
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("error"))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shorts content failed: {str(e)}")

@router.post(
    "/creative/caption-optimizer", 
    response_model=CaptionResponse, 
    response_model_exclude_unset=True,
    summary="Optimize a caption/hook"
)
async def caption_optimizer(
    request: CreativeAssistRequest, # Use request with user_id for memory
    agent_service: CreativeAgentService = Depends(get_agent_service)
):
    """
    Directly calls the Caption Optimizer agent.
    """
    try:
        similar_memories = agent_service.memory_service.get_similar_memories(request.user_id, request.query, 'conversation', 3)
        result = await agent_service.caption_optimizer_agent(request.query, similar_memories)
        if result.get("error"):
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("error"))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Caption optimization failed: {str(e)}")

# --- Health & Agent Info ---
@router.get("/health")
async def health_check():
    """Provides a simple health check."""
    # TODO: Add a real health check to Supabase
    # health = supabase_client.health_check()
    return {
        "status": "healthy", # or health.get("status")
        "service": "Curator AI Service",
    }

@router.get("/creative/agents")
async def list_creative_agents():
    """Lists all available creative agents and their endpoints."""
    return {
        "available_agents": [
            {"name": "movie_recommendation", "description": "Personalized movie suggestions", "endpoint": "/api/ai/recommend/personal"},
            {"name": "idea_generation", "description": "Generates creative content ideas", "endpoint": "/api/ai/creative/brainstorm"},
            {"name": "shorts_script", "description": "Generates scripts for short-form video", "endpoint": "/api/ai/creative/shorts-content"},
            {"name": "caption_optimizer", "description": "Generates hooks and captions", "endpoint": "/api/ai/creative/caption-optimizer"}
        ],
        "auto_routing": {
            "endpoint": "/api/ai/creative/assist",
            "description": "Automatically routes queries to the appropriate agent"
        }
    }