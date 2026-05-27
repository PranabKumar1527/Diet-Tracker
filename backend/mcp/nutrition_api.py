from mcp.usda_client import USDAClient

class NutritionMCP:
    """MCP Server for nutrition data from multiple sources"""
    
    def __init__(self):
        self.usda = USDAClient()
    
    def search_nutrition_data(self, food_query: str, max_results: int = 5):
        """
        Search nutrition databases and return structured data
        This is the MCP interface that combines multiple data sources
        """
        results = []
        
        # Query USDA
        usda_results = self.usda.search_foods(food_query, page_size=max_results)
        results.extend(usda_results)
        
        # Future: Add Open Food Facts, custom DB, etc.
        
        return results
    
    def get_nutrition_context(self, food_items: list):
        """
        Get nutrition context for multiple food items
        Returns formatted context for AI prompt
        """
        context_parts = []
        
        for item in food_items:
            results = self.search_nutrition_data(item, max_results=3)
            
            if results:
                context_parts.append(f"\nNutrition data for '{item}':")
                for i, food in enumerate(results[:3], 1):
                    nutrients = food.get("nutrients", {})
                    context_parts.append(
                        f"{i}. {food['name']}: "
                        f"Calories: {nutrients.get('calories', 0):.0f} kcal, "
                        f"Protein: {nutrients.get('protein', 0):.1f}g, "
                        f"Carbs: {nutrients.get('carbs', 0):.1f}g, "
                        f"Fat: {nutrients.get('fat', 0):.1f}g, "
                        f"Fiber: {nutrients.get('fiber', 0):.1f}g"
                    )
        
        return "\n".join(context_parts)