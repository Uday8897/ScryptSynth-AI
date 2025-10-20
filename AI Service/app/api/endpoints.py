from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from app.services.creative_agent_service import creative_agent

# ----------------------------
# Request & Response Schemas
# ----------------------------

class UserQuery(BaseModel):
    user_id: str
    query: str

class BrainstormQuery(BaseModel):
    query: str

class PlanShotsQuery(BaseModel):
    query: str

class ElaborateQuery(BaseModel):
    query: str

class AIResponse(BaseModel):
    response: str

class CreativeResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    agent_type: str

# ----------------------------
# Router & Endpoints
# ----------------------------

router = APIRouter()

# ----------------------------
# Movie Recommendation
# ----------------------------
@router.post("/recommend/personal", response_model=AIResponse)
async def personal_recommendation(request: UserQuery):
    try:
        result = await creative_agent.get_ai_recommendation(request.user_id, request.query)
        return AIResponse(response=json.dumps(result))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")

# ----------------------------
# Creative Agent - Auto Routing
# ----------------------------
@router.post("/creative/assist", response_model=CreativeResponse)
async def creative_assistance(request: UserQuery):
    try:
        result = await creative_agent.route_agent(request.user_id, request.query)
        return CreativeResponse(
            success=True,
            data=result,
            agent_type=result.get("agent_type", "unknown")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Creative assistance failed: {str(e)}")

# ----------------------------
# Direct Creative Agent Endpoints
# ----------------------------
@router.post("/creative/brainstorm", response_model=CreativeResponse)
async def brainstorm(request: BrainstormQuery):
    try:
        result = await creative_agent.brainstorm_genre_agent(request.query)
        return CreativeResponse(success=True, data=result, agent_type="brainstorm_genre")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Brainstorming failed: {str(e)}")

@router.post("/creative/plan-shots", response_model=CreativeResponse)
async def plan_shots(request: PlanShotsQuery):
    try:
        result = await creative_agent.plan_shots_agent(request.query)
        return CreativeResponse(success=True, data=result, agent_type="plan_shots")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shot planning failed: {str(e)}")

@router.post("/creative/elaborate-idea", response_model=CreativeResponse)
async def elaborate_idea(request: ElaborateQuery):
    try:
        result = await creative_agent.elaborate_idea_agent(request.query)
        return CreativeResponse(success=True, data=result, agent_type="elaborate_idea")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Idea elaboration failed: {str(e)}")

# ----------------------------
# Health & Agent Info
# ----------------------------
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Curator AI Service",
        "endpoints": {
            "recommendation": ["personal"],
            "creative": ["assist", "brainstorm", "plan-shots", "elaborate-idea"]
        }
    }

@router.get("/creative/agents")
async def list_creative_agents():
    return {
        "available_agents": [
            {"name": "brainstorm_genre", "description": "Generates genre-specific creative elements", "endpoint": "/api/ai/creative/brainstorm"},
            {"name": "plan_shots", "description": "Provides camera shot suggestions and angles", "endpoint": "/api/ai/creative/plan-shots"},
            {"name": "elaborate_idea", "description": "Expands simple concepts into full story foundations", "endpoint": "/api/ai/creative/elaborate-idea"},
            {"name": "movie_recommendation", "description": "Personalized movie suggestions", "endpoint": "/api/ai/recommend/personal"}
        ],
        "auto_routing": {
            "endpoint": "/api/ai/creative/assist",
            "description": "Automatically routes queries to the appropriate agent"
        }
    }
