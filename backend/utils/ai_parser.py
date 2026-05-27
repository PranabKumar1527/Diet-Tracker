import requests
import os
from dotenv import load_dotenv
from rag.vector_store import NutritionVectorStore
from mcp.nutrition_api import NutritionMCP
import json

load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def call_groq(prompt: str):
    """Make direct HTTP call to Groq API"""
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.3,
        "max_tokens": 1000
    }

    response = requests.post(
        GROQ_URL,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROQ_API_KEY}"
        },
        json=payload,
        timeout=30
    )

    if response.status_code == 200:
        data = response.json()
        return data["choices"][0]["message"]["content"]
    else:
        raise Exception(f"Groq API error: {response.status_code} - {response.text}")


class FoodParser:
    """AI-powered food parser with RAG + MCP"""

    def __init__(self):
        self.vector_store = NutritionVectorStore()
        self.mcp = NutritionMCP()

    def parse_food_input(self, user_input: str):
        """Parse user's food input using RAG + MCP + AI"""

        # Step 1: RAG - Search vector store
        rag_results = self.vector_store.search(user_input, n_results=5)

        # Step 2: MCP - Query external APIs
        food_items = self._extract_food_items(user_input)
        mcp_context = self.mcp.get_nutrition_context(food_items)

        # Step 3: Build context
        context = self._build_context(rag_results, mcp_context)

        # Step 4: AI Parse with context
        result = self._parse_with_ai(user_input, context)

        return result

    def generate_meal_suggestion(self, meal_type: str, user_profile: dict, special_notes: str = ""):
        """Generate meal suggestion using AI"""

        prompt = f"""You are a professional nutritionist and diet expert.

USER PROFILE:
- Age: {user_profile.get('age', 'Unknown')}
- Sex: {user_profile.get('sex', 'Unknown')}
- Weight: {user_profile.get('weight_kg', 'Unknown')} kg
- Height: {user_profile.get('height_cm', 'Unknown')} cm
- Activity Level: {user_profile.get('activity_level', 'Unknown')}
- Goals: {', '.join(user_profile.get('goal', []))}
- Daily Calorie Target: {user_profile.get('target_calories', 'Unknown')} kcal
- Daily Protein Target: {user_profile.get('target_protein', 'Unknown')} g

MEAL TYPE: {meal_type}
SPECIAL NOTES: {special_notes if special_notes else 'None'}

Generate a detailed {meal_type} meal plan for this user.
Include specific food items with quantities, calories and protein for each item,
why this meal suits their goals, and a total nutrition summary.
Format your response in a clear friendly way."""

        try:
            return call_groq(prompt)
        except Exception as e:
            return f"Could not generate meal suggestion: {str(e)}"

    def generate_daily_review(self, daily_logs: list, targets: dict):
        """Generate AI review of daily food intake"""

        log_summary = "\n".join([
            f"- {log.get('meal_type', '')}: {log.get('food_description', '')} "
            f"({log.get('calories', 0)} kcal, {log.get('protein_gm', 0)}g protein)"
            for log in daily_logs
        ])

        prompt = f"""You are a nutrition coach. Review today's food intake.

TODAY'S FOOD INTAKE:
{log_summary if log_summary else 'No food logged yet today'}

DAILY TARGETS:
- Calories: {targets.get('calories', 0)} kcal
- Protein: {targets.get('protein_gm', 0)} g
- Water: {targets.get('water_ltr', 0)} L
- Fiber: {targets.get('fiber_gm', 0)} g

CONSUMED SO FAR:
- Calories: {targets.get('consumed_calories', 0)} kcal
- Protein: {targets.get('consumed_protein', 0)} g

Give an honest motivating 2-3 sentence review.
How is the day going nutritionally?
What is good about today's intake?
What should they focus on for remaining meals?
Keep it friendly and encouraging."""

        try:
            return call_groq(prompt)
        except Exception as e:
            return "Keep tracking your meals to get AI insights!"

    def _extract_food_items(self, text: str):
        """Extract food item names from user input"""
        common_foods = [
            "roti", "rice", "dal", "egg", "chicken", "paneer",
            "curd", "milk", "bread", "banana", "apple", "idli",
            "dosa", "paratha", "samosa", "poha", "upma", "naan"
        ]
        items = []
        text_lower = text.lower()
        for food in common_foods:
            if food in text_lower:
                items.append(food)
        return items if items else [text]

    def _build_context(self, rag_results, mcp_context):
        """Build nutrition context from RAG and MCP"""
        context_parts = []

        if rag_results:
            context_parts.append("=== Similar foods in database ===")
            for food in rag_results:
                context_parts.append(
                    f"{food['name']}: {food['calories']} kcal, "
                    f"Protein {food['protein']}g, Carbs {food['carbs']}g, "
                    f"Fat {food['fat']}g, Fiber {food['fiber']}g"
                )

        if mcp_context:
            context_parts.append("\n=== USDA database results ===")
            context_parts.append(mcp_context)

        return "\n".join(context_parts)

    def _parse_with_ai(self, user_input: str, nutrition_context: str):
        """Call Groq AI with RAG + MCP context"""

        prompt = f"""You are a nutrition expert. Parse the user food input and return accurate nutrition data.

NUTRITION DATABASE CONTEXT:
{nutrition_context}

USER INPUT: {user_input}

Return ONLY a valid JSON object with this exact structure:
{{
  "items": [
    {{
      "name": "Food name",
      "quantity": "2 pieces",
      "calories": 150.0,
      "protein_gm": 6.0,
      "carbs_gm": 25.0,
      "fat_gm": 3.0,
      "fiber_gm": 2.0,
      "water_ml": 0.0
    }}
  ],
  "total": {{
    "calories": 150.0,
    "protein_gm": 6.0,
    "carbs_gm": 25.0,
    "fat_gm": 3.0,
    "fiber_gm": 2.0,
    "water_ml": 0.0
  }},
  "ai_review": "Brief honest review of the meal nutrition"
}}

Return ONLY the JSON. No markdown, no extra text."""

        try:
            result_text = call_groq(prompt)

            # Clean markdown if present
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]

            result_text = result_text.strip()
            return json.loads(result_text)

        except Exception as e:
            print(f"AI parsing error: {e}")
            return {
                "items": [],
                "total": {
                    "calories": 0,
                    "protein_gm": 0,
                    "carbs_gm": 0,
                    "fat_gm": 0,
                    "fiber_gm": 0,
                    "water_ml": 0
                },
                "ai_review": "Could not parse food input. Please try again."
            }