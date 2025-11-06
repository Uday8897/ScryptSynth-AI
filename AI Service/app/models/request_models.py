from pydantic import BaseModel
from typing import Optional

class AgentRouteRequest(BaseModel):
    user_id: str
    query: str

# Keep your existing RecommendationRequest
class RecommendationRequest(BaseModel):
    user_id: str
    query: str