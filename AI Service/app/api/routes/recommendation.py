import logging
from fastapi import APIRouter, HTTPException
from app.models.request_models import RecommendationRequest, AgentRouteRequest
from app.models.response_models import RecommendationResponse, ErrorResponse, IdeaGenerationResponse, ShortsScriptResponse, CaptionOptimizerResponse
from app.services.creative_agent_service import creative_agent

logger = logging.getLogger(__name__)
router = APIRouter()

# Movie Recommendation Routes
@router.post("/recommend/personal", response_model=RecommendationResponse)
async def get_personal_recommendation(request: RecommendationRequest):
    """
    Get personalized movie recommendations using RAG pipeline.
    """
    try:
        logger.info(f"🎬 Personal recommendation request for user {request.user_id}")
        
        result = await creative_agent.get_ai_recommendation(
            user_id=request.user_id,
            query=request.query
        )
        
        # Validate the response matches our expected model
        if "error" in result and result["error"]:
            return RecommendationResponse(
                agent_type=result.get("agent_type", "movie_recommendation"),
                user_insights={
                    "preference_confidence": 0.0,
                    "preferred_genres": [],
                    "personalization_level": "none"
                },
                recommendations=[],
                personalized_explanation="Error occurred during recommendation",
                next_suggestions=[],
                error=result["error"]
            )
        
        # Ensure all recommendations have required fields
        validated_recommendations = []
        for rec in result.get("recommendations", []):
            # Convert tmdbId to integer if needed
            tmdb_id = rec.get("tmdbId", 0)
            if isinstance(tmdb_id, str) and tmdb_id.isdigit():
                tmdb_id = int(tmdb_id)
            elif not isinstance(tmdb_id, int):
                tmdb_id = 0
                
            validated_rec = {
                "title": rec.get("title", ""),
                "year": rec.get("year", 0),
                "rating": rec.get("rating", 0.0),
                "genres": rec.get("genres", []),
                "overview": rec.get("overview", ""),
                "tmdbId": tmdb_id,
                "poster_path": rec.get("poster_path"),
                "poster_url": rec.get("poster_url"),
                "source": rec.get("source", "supabase_rag"),
                "similarity": rec.get("similarity", 0.0),
                "match_confidence": rec.get("match_confidence", 0.5)  # Default confidence
            }
            validated_recommendations.append(validated_rec)
        
        response = RecommendationResponse(
            agent_type=result.get("agent_type", "movie_recommendation"),
            user_insights=result.get("user_insights", {
                "preference_confidence": 0.0,
                "preferred_genres": [],
                "personalization_level": "low"
            }),
            recommendations=validated_recommendations,
            personalized_explanation=result.get("personalized_explanation", ""),
            next_suggestions=result.get("next_suggestions", []),
            error=result.get("error")
        )
        
        logger.info(f"✅ Successfully returned {len(validated_recommendations)} recommendations")
        return response
        
    except Exception as e:
        logger.error(f"❌ Error in personal recommendation endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recommendations: {str(e)}"
        )

# Creative Agent Routes
@router.post("/agent/route")
async def route_agent(request: dict):
    """
    Route user query to appropriate AI agent (idea generation, shorts script, caption optimizer, movie recommendation)
    """
    try:
        user_id = request.get("user_id")
        query = request.get("query")
        
        if not user_id or not query:
            raise HTTPException(status_code=400, detail="user_id and query are required")
        
        logger.info(f"🔄 Agent routing request for user {user_id}: '{query}'")
        
        result = await creative_agent.route_agent(user_id, query)
        
        # Return the result directly (it should already be in the correct format)
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in agent routing: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Agent routing failed: {str(e)}")

@router.post("/agent/idea-generation")
async def generate_ideas(request: dict):
    """
    Direct endpoint for idea generation
    """
    try:
        user_id = request.get("user_id")
        query = request.get("query")
        
        if not user_id or not query:
            raise HTTPException(status_code=400, detail="user_id and query are required")
        
        logger.info(f"💡 Direct idea generation request for user {user_id}")
        
        result = await creative_agent.trend_idea_agent(query)
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in idea generation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Idea generation failed: {str(e)}")

@router.post("/agent/shorts-script")
async def generate_shorts_script(request: dict):
    """
    Direct endpoint for shorts script generation
    """
    try:
        user_id = request.get("user_id")
        query = request.get("query")
        
        if not user_id or not query:
            raise HTTPException(status_code=400, detail="user_id and query are required")
        
        logger.info(f"🎥 Direct shorts script request for user {user_id}")
        
        result = await creative_agent.shorts_script_agent(query)
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in shorts script generation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Shorts script generation failed: {str(e)}")

@router.post("/agent/caption-optimizer")
async def optimize_captions(request: dict):
    """
    Direct endpoint for caption optimization
    """
    try:
        user_id = request.get("user_id")
        query = request.get("query")
        
        if not user_id or not query:
            raise HTTPException(status_code=400, detail="user_id and query are required")
        
        logger.info(f"✍️ Direct caption optimization request for user {user_id}")
        
        result = await creative_agent.caption_optimizer_agent(query)
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in caption optimization: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Caption optimization failed: {str(e)}")

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check for AI service"""
    return {
        "status": "healthy",
        "service": "AI Creative Agent Service",
        "endpoints": {
            "movie_recommendation": "/api/ai/recommend/personal",
            "agent_routing": "/api/ai/agent/route",
            "idea_generation": "/api/ai/agent/idea-generation",
            "shorts_script": "/api/ai/agent/shorts-script",
            "caption_optimizer": "/api/ai/agent/caption-optimizer"
        }
    }