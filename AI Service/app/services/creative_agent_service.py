import json
from typing import Dict, Any, List
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.exceptions import OutputParserException
from app.core.llm_client import groq_client
from app.services.memory_service import MemoryService
from app.services.tool_service import ToolService
from app.config.settings import settings

class CreativeAgentService:
    def __init__(self):
        if groq_client is None:
            raise ValueError("Groq client not initialized.")
        self.client = groq_client
        self.memory_service = MemoryService()
        self.tool_service = ToolService()
        
        # Initialize LangChain Groq client
        self.llm = ChatGroq(
            model_name=settings.GROQ_MODEL_NAME,
            temperature=0.7,
            groq_api_key=settings.GROQ_API_KEY
        )
        
        self.json_parser = JsonOutputParser()

    async def route_agent(self, user_id: str, query: str) -> Dict[str, Any]:
        """
        Main router that determines which agent to call based on the query
        """
        # Analyze the query to determine the intent
        intent_prompt = ChatPromptTemplate.from_template("""
        Analyze the user's query and classify it into one of these categories:
        
        Categories:
        - "brainstorm_genre": User wants creative ideas for a specific genre (mentions genres, creative elements, plot ideas)
        - "plan_shots": User wants camera shot suggestions for a scene (mentions shots, camera, scene, filming)
        - "elaborate_idea": User wants to expand a simple concept into a story (mentions ideas, concepts, story development)
        - "movie_recommendation": User wants movie suggestions (mentions movies, films, watch, recommend)
        
        User Query: {query}
        
        Respond ONLY with the category name from the list above.
        """)
        
        intent_chain = intent_prompt | self.llm
        intent_response = await intent_chain.ainvoke({"query": query})
        intent = intent_response.content.strip().lower()
        
        print(f"🔍 Detected intent: {intent}")
        
        # Route to appropriate agent
        if intent == "brainstorm_genre":
            return await self.brainstorm_genre_agent(query)
        elif intent == "plan_shots":
            return await self.plan_shots_agent(query)
        elif intent == "elaborate_idea":
            return await self.elaborate_idea_agent(query)
        elif intent == "movie_recommendation":
            return await self.get_ai_recommendation(user_id, query)
        else:
            # Default to movie recommendation
            return await self.get_ai_recommendation(user_id, query)

    async def brainstorm_genre_agent(self, query: str) -> Dict[str, Any]:
        """
        Agent for generating genre-specific creative elements
        """
        brainstorm_prompt = ChatPromptTemplate.from_template("""
        You are a creative writing assistant specializing in genre storytelling.
        
        The user wants brainstorming help for: {query}
        
        Generate creative elements based on the genre and element type mentioned.
        If the query is unclear, make reasonable assumptions about the genre and element type.
        
        Provide your response in the following JSON format:
        {{
            "agent_type": "brainstorm_genre",
            "genre": "detected or assumed genre",
            "element_type": "detected or assumed element type",
            "ideas": [
                {{
                    "title": "Idea title",
                    "description": "Detailed description",
                    "uniqueness": "What makes this unique",
                    "implementation_tip": "How to use this idea"
                }}
            ],
            "creative_prompts": [
                "Prompt 1 to spark more creativity",
                "Prompt 2 to explore further"
            ]
        }}
        """)
        
        try:
            chain = brainstorm_prompt | self.llm | self.json_parser
            result = await chain.ainvoke({"query": query})
            return result
        except OutputParserException as e:
            print(f"❌ JSON parsing error in brainstorm agent: {e}")
            # Fallback: Try to extract JSON from the response
            return await self._fallback_json_response("brainstorm_genre", str(e))
        except Exception as e:
            print(f"❌ Error in brainstorm agent: {e}")
            return {
                "agent_type": "brainstorm_genre",
                "error": "Failed to generate creative ideas",
                "ideas": []
            }

    async def plan_shots_agent(self, query: str) -> Dict[str, Any]:
        """
        Agent for planning camera shots and angles for scenes
        """
        shots_prompt = ChatPromptTemplate.from_template("""
        You are a cinematography expert and film director.
        
        Scene description: {query}
        
        Analyze the scene and provide detailed shot recommendations considering:
        - Camera angles and movements
        - Lighting and composition
        - Emotional impact
        - Technical considerations
        
        Provide your response in the following JSON format:
        {{
            "agent_type": "plan_shots",
            "scene_mood": "detected mood from description",
            "shot_sequence": [
                {{
                    "shot_type": "e.g., Close-up, Wide shot, Tracking shot",
                    "camera_angle": "e.g., Eye-level, Low angle, Dutch angle",
                    "lens_suggestion": "e.g., 35mm, 50mm, 85mm",
                    "purpose": "What this shot achieves emotionally/narratively",
                    "lighting_notes": "Lighting suggestions",
                    "movement": "Camera movement if any"
                }}
            ],
            "overall_directorial_advice": "General filming recommendations",
            "equipment_suggestions": ["Suggested equipment if relevant"]
        }}
        """)
        
        try:
            chain = shots_prompt | self.llm | self.json_parser
            result = await chain.ainvoke({"query": query})
            return result
        except OutputParserException as e:
            print(f"❌ JSON parsing error in shots planning agent: {e}")
            return await self._fallback_json_response("plan_shots", str(e))
        except Exception as e:
            print(f"❌ Error in shots planning agent: {e}")
            return {
                "agent_type": "plan_shots",
                "error": "Failed to generate shot plan",
                "shot_sequence": []
            }

    async def elaborate_idea_agent(self, query: str) -> Dict[str, Any]:
        """
        Agent for expanding simple concepts into full story foundations
        """
        elaborate_prompt = ChatPromptTemplate.from_template("""
        You are a professional story developer and screenwriter.
        
        Core idea to elaborate: {query}
        
        Expand this simple concept into a rich story foundation including:
        - Character development
        - Plot structure
        - Themes and motifs
        - World-building elements
        - Conflict and resolution
        
        Provide your response in the following JSON format:
        {{
            "agent_type": "elaborate_idea",
            "core_concept": "The original idea summarized",
            "expanded_premise": "Detailed story premise",
            "main_characters": [
                {{
                    "name": "Character name",
                    "role": "Protagonist/Antagonist/Supporting",
                    "arc": "Character development journey",
                    "motivation": "What drives this character",
                    "flaws": "Character flaws and weaknesses"
                }}
            ],
            "plot_structure": {{
                "act1_setup": "Introduction and inciting incident",
                "act2_confrontation": "Rising action and conflicts",
                "act3_resolution": "Climax and conclusion"
            }},
            "themes": ["Theme 1", "Theme 2", "Theme 3"],
            "key_scenes": [
                {{
                    "scene_name": "Scene title",
                    "purpose": "What this scene accomplishes",
                    "emotional_beat": "Emotional impact"
                }}
            ],
            "development_questions": ["Questions to explore further"]
        }}
        """)
        
        try:
            chain = elaborate_prompt | self.llm | self.json_parser
            result = await chain.ainvoke({"query": query})
            return result
        except OutputParserException as e:
            print(f"❌ JSON parsing error in idea elaboration agent: {e}")
            return await self._fallback_json_response("elaborate_idea", str(e))
        except Exception as e:
            print(f"❌ Error in idea elaboration agent: {e}")
            return {
                "agent_type": "elaborate_idea",
                "error": "Failed to elaborate the idea",
                "main_characters": []
            }

    async def get_ai_recommendation(self, user_id: str, query: str) -> Dict[str, Any]:
        """
        Enhanced movie recommendation agent with JSON output
        """
        memories = self.memory_service.retrieve_memories(user_id=user_id, query_text=query)
        movie_context = self.tool_service.search_movies(genre="sci-fi")

        recommendation_prompt = ChatPromptTemplate.from_template("""
        You are 'Curator AI', a movie recommendation expert.
        
        User Query: {query}
        User Memories: {memories}
        Movie Context: {movie_context}
        
        Provide ONE personalized recommendation in the following JSON format:
        {{
            "agent_type": "movie_recommendation",
            "recommendedMovie": {{
                "title": "Movie Title",
                "year": YYYY,
                "tmdbId": 12345,
                "rating": X.X
            }},
            "reasoningTitle": "Catchy title for explanation",
            "reasoningIntro": "Short introductory sentence",
            "comparisonTable": [
                {{ "feature": "Feature 1", "match": "How it matches user taste" }},
                {{ "feature": "Feature 2", "match": "Explanation" }},
                {{ "feature": "Feature 3", "match": "Explanation" }}
            ],
            "bottomLine": "Concluding sentence"
        }}
        """)
        
        try:
            chain = recommendation_prompt | self.llm | self.json_parser
            result = await chain.ainvoke({
                "query": query,
                "memories": memories if memories else "No specific memories found",
                "movie_context": movie_context
            })
            return result
        except OutputParserException as e:
            print(f"❌ JSON parsing error in recommendation agent: {e}")
            return await self._fallback_json_response("movie_recommendation", str(e))
        except Exception as e:
            print(f"❌ Error in recommendation agent: {e}")
            return {
                "agent_type": "movie_recommendation",
                "error": "Failed to generate recommendation",
                "recommendedMovie": None
            }

    async def _fallback_json_response(self, agent_type: str, error_message: str) -> Dict[str, Any]:
        """
        Fallback method when JSON parsing fails
        """
        return {
            "agent_type": agent_type,
            "error": "Failed to parse AI response",
            "raw_error": error_message,
            "suggestion": "Please try again with a different query"
        }

# Singleton instance
creative_agent = CreativeAgentService()