import json
import logging
from typing import Dict, Any, List
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.exceptions import OutputParserException
from app.core.llm_client import groq_client
from app.services.memory_service import MemoryService
from app.config.settings import settings

logger = logging.getLogger(__name__)

class CreativeAgentService:
    def __init__(self):
        if groq_client is None:
            raise ValueError("Groq client not initialized.")
        
        try:
            self.memory_service = MemoryService()
            
            self.llm = ChatGroq(
                model_name=settings.GROQ_MODEL_NAME,
                temperature=0.5,
                groq_api_key=settings.GROQ_API_KEY
            )
            self.json_parser = JsonOutputParser()
            logger.info("🚀 CreativeAgentService initialized (Full RAG w/ Supabase).")
        except Exception as e:
            logger.error(f"❌ FAILED to initialize CreativeAgentService: {e}", exc_info=True)
            raise

    async def route_agent(self, user_id: str, query: str) -> Dict[str, Any]:
        """Determines which agent to call based on user query."""
        logger.info(f"🔍 Routing query for user {user_id}: '{query}'")
        
        intent_prompt = ChatPromptTemplate.from_template("""
        Classify the user's intent into ONE of the following categories:
        - "movie_recommendation"
        - "idea_generation"
        - "shorts_script"
        - "caption_optimizer"
        - "unknown"
        Query: {query}
        Respond ONLY with one label.
        """)
        
        try:
            intent_chain = intent_prompt | self.llm
            intent_response = await intent_chain.ainvoke({"query": query})
            intent = intent_response.content.strip().lower().replace('"', '')
            
            logger.info(f"🎯 Detected intent: {intent}")
            
            similar_memories = self.memory_service.get_similar_memories(user_id, query, 'conversation', 3)
            
            # Route to appropriate agent
            if intent == "movie_recommendation":
                result = await self.get_ai_recommendation(user_id, query, similar_memories)
            elif intent == "idea_generation":
                result = await self.trend_idea_agent(query, similar_memories)
            elif intent == "shorts_script":
                result = await self.shorts_script_agent(query, similar_memories)
            elif intent == "caption_optimizer":
                result = await self.caption_optimizer_agent(query, similar_memories)
            else:
                logger.warning(f"⚠️ Intent '{intent}' is unknown, defaulting to movie recommendation.")
                result = await self.get_ai_recommendation(user_id, query, similar_memories)
            
            self.memory_service.add_conversation_memory(user_id, query, json.dumps(result, default=str), intent)
            return result
                
        except Exception as e:
            logger.error(f"❌ Error in route_agent: {e}", exc_info=True)
            return {"agent_type": "error", "error": str(e)}

    async def trend_idea_agent(self, query: str, context: List[Dict] = None):
        logger.info(f"💡 Brainstorming ideas for: '{query}'")
        context_str = json.dumps(context or [])
        prompt = ChatPromptTemplate.from_template("""
        You are 'ViralTrendBot', an AI that helps content creators brainstorm trending video ideas.
        Context: {context}
        User Query: {query}
        Task: Generate 3-5 creative content ideas.
        Return JSON:
        {{
            "agent_type": "idea_generation",
            "ideas": [
                {{ "title": "...", "concept": "...", "difficulty": "easy", "hashtags": ["..."] }}
            ]
        }}
        """)
        try:
            chain = prompt | self.llm | self.json_parser
            return await chain.ainvoke({"query": query, "context": context_str})
        except Exception as e:
            logger.error(f"❌ Error in trend_idea_agent: {e}", exc_info=True)
            return {"agent_type": "idea_generation", "error": str(e), "ideas": []}

    async def shorts_script_agent(self, query: str, context: List[Dict] = None):
        logger.info(f"🎥 Creating shorts script for: '{query}'")
        context_str = json.dumps(context or [])
        prompt = ChatPromptTemplate.from_template("""
        You are 'ReelWriter', a creative AI that crafts high-retention short-form scripts.
        User Query: {query}
        Context: {context}
        Output 1 engaging short-form script (30-60 seconds).
        JSON format:
        {{
            "agent_type": "shorts_script",
            "script": {{ "hook": "...", "body": "...", "cta": "...", "estimated_duration": "45s", "hashtags": ["..."] }}
        }}
        """)
        try:
            chain = prompt | self.llm | self.json_parser
            return await chain.ainvoke({"query": query, "context": context_str})
        except Exception as e:
            logger.error(f"❌ Error in shorts_script_agent: {e}", exc_info=True)
            return {"agent_type": "shorts_script", "error": str(e), "script": {}}

    async def caption_optimizer_agent(self, query: str, context: List[Dict] = None):
        logger.info(f"✍️ Optimizing caption for: '{query}'")
        context_str = json.dumps(context or [])
        prompt = ChatPromptTemplate.from_template("""
        You are 'EngageAI', an AI that writes scroll-stopping hooks and captions.
        Query: {query}
        Context: {context}
        Output 3 catchy social media posts.
        Return JSON:
        {{
            "agent_type": "caption_optimizer",
            "options": [
                {{"title": "...", "caption": "...", "hashtags": ["..."], "tone": "funny"}},
                {{"title": "...", "caption": "...", "hashtags": ["..."], "tone": "inspirational"}}
            ]
        }}
        """)
        try:
            chain = prompt | self.llm | self.json_parser
            return await chain.ainvoke({"query": query, "context": context_str})
        except Exception as e:
            logger.error(f"❌ Error in caption_optimizer_agent: {e}", exc_info=True)
            return {"agent_type": "caption_optimizer", "error": str(e), "options": []}

    async def get_ai_recommendation(self, user_id: str, query: str, context: List[Dict] = None) -> Dict[str, Any]:
        """Recommends movies using a 100% RAG pipeline from Supabase."""
        logger.info(f"🧠 RAG RECOMMENDATION for user {user_id}: '{query}'")
        
        try:
            # 1. Get User's Taste Profile
            user_preferences = self.memory_service.analyze_user_preferences(user_id)
            user_reviews = self.memory_service.get_user_reviews(user_id, limit=5)
            
            # 2. RAG: Find movies in the KB that match the USER'S QUERY
            movie_context = self.memory_service.find_similar_movies(query, limit=10)
            
            logger.info(f"🎯 RAG found {len(movie_context)} movies matching query.")

            # 3. LLM Call: Generate the final recommendation
            recommendation_prompt = ChatPromptTemplate.from_template("""
            You are 'Curator AI', an intelligent movie recommendation expert.
            
            USER QUERY: {query}
            
            USER'S TASTE PROFILE (from past reviews): {user_preferences}
            
            USER'S RECENT REVIEWS:
            {user_reviews}
            
            AVAILABLE MOVIES (Found in our library matching the query):
            {movie_context}
            
            INSTRUCTIONS:
            1. Analyze all inputs.
            2. Select the *single best movie* from the AVAILABLE MOVIES list.
            3. Calculate a "match_confidence" (a float between 0.0 and 1.0).
            4. If no movies are found (movie_context is empty) OR no movie in the list is a good match, return "recommendations": []. DO NOT HALLUCINATE.
            
            IMPORTANT: For each recommended movie, you MUST include:
            - All the original fields from the movie data
            - A "match_confidence" field with a float value
            - Ensure "tmdbId" is always an integer (use 0 if not available)
            
            Provide your response in this exact JSON format:
            {{
                "agent_type": "movie_recommendation",
                "user_insights": {{
                    "preference_confidence": {preference_confidence},
                    "preferred_genres": {preferred_genres},
                    "personalization_level": "high|medium|low"
                }},
                "recommendations": [
                    {{
                        "title": "...",
                        "year": ...,
                        "rating": ...,
                        "genres": ["..."],
                        "overview": "...",
                        "tmdbId": 12345,  // MUST be integer
                        "poster_path": "...",
                        "poster_url": "...",
                        "source": "...",
                        "similarity": ...,
                        "match_confidence": 0.85  // REQUIRED field
                    }}
                ],
                "personalized_explanation": "Detailed explanation...",
                "next_suggestions": ["Suggest a different genre", "Ask for a specific actor"]
            }}
            """)
            
            chain = recommendation_prompt | self.llm | self.json_parser
            
            preference_confidence_score = 0.8 if user_preferences.get("has_history") else 0.2
            
            result = await chain.ainvoke({
                "query": query,
                "user_reviews": json.dumps(user_reviews, indent=2) if user_reviews else "No review history yet",
                "user_preferences": json.dumps(user_preferences, indent=2),
                "preferred_genres": user_preferences.get("genres", []),
                "preference_confidence": preference_confidence_score,
                "movie_context": json.dumps(movie_context, indent=2),
                "movie_count": len(movie_context),
            })
            
            # 4. Post-process the result to ensure data integrity
            result = self._validate_recommendation_result(result, movie_context)
            
            logger.info(f"✅ RAG recommendations generated. Found {len(result.get('recommendations', []))} matches.")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error in RAG recommendation: {e}", exc_info=True)
            return {
                "agent_type": "movie_recommendation",
                "error": "Failed to generate intelligent recommendations",
                "recommendations": [],
                "search_details": {"query": query, "error": str(e)}
            }
    
    def _validate_recommendation_result(self, result: Dict[str, Any], original_movies: List[Dict]) -> Dict[str, Any]:
        """Validate and fix recommendation result data integrity."""
        if "recommendations" not in result:
            result["recommendations"] = []
            return result
            
        validated_recommendations = []
        
        for rec in result["recommendations"]:
            # Ensure tmdbId is integer
            if "tmdbId" in rec:
                try:
                    rec["tmdbId"] = int(rec["tmdbId"]) if rec["tmdbId"] is not None else 0
                except (ValueError, TypeError):
                    rec["tmdbId"] = 0
            
            # Ensure match_confidence exists
            if "match_confidence" not in rec:
                # Calculate match confidence from similarity if available
                similarity = rec.get("similarity", 0.0)
                rec["match_confidence"] = min(1.0, max(0.0, similarity * 1.2))  # Scale similarity to confidence
            
            # Ensure all required fields exist
            required_fields = ["title", "year", "rating", "genres", "overview", "tmdbId", "source"]
            for field in required_fields:
                if field not in rec:
                    rec[field] = "" if field == "overview" else [] if field == "genres" else 0
            
            validated_recommendations.append(rec)
        
        result["recommendations"] = validated_recommendations
        return result

    async def _fallback_json_response(self, agent_type: str, error_message: str) -> Dict[str, Any]:
        """Fallback method when JSON parsing fails."""
        logger.warning(f"⚠️ JSON parsing failed for {agent_type}. Error: {error_message}")
        return {
            "agent_type": agent_type,
            "error": "Failed to parse AI response as JSON",
            "raw_error": error_message,
            "suggestion": "Please try again. The AI's response was not in the correct format."
        }

# Singleton instance
creative_agent = CreativeAgentService()