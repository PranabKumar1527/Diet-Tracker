import requests
import os

class USDAClient:
    """Client for USDA FoodData Central API"""
    
    BASE_URL = "https://api.nal.usda.gov/fdc/v1"
    
    def __init__(self):
        # USDA API is completely free, no key needed for basic search
        self.api_key = None
    
    def search_foods(self, query: str, page_size: int = 5):
        """Search USDA database for foods"""
        try:
            url = f"{self.BASE_URL}/foods/search"
            params = {
                "query": query,
                "pageSize": page_size,
                "dataType": ["Foundation", "SR Legacy"]
            }
            
            response = requests.get(url, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                foods = []
                
                for food in data.get("foods", [])[:page_size]:
                    nutrients = {}
                    for nutrient in food.get("foodNutrients", []):
                        name = nutrient.get("nutrientName", "")
                        value = nutrient.get("value", 0)
                        
                        if "Energy" in name or "Calories" in name:
                            nutrients["calories"] = value
                        elif "Protein" in name:
                            nutrients["protein"] = value
                        elif "Carbohydrate" in name:
                            nutrients["carbs"] = value
                        elif "Total lipid" in name or "Fat" in name:
                            nutrients["fat"] = value
                        elif "Fiber" in name:
                            nutrients["fiber"] = value
                    
                    foods.append({
                        "name": food.get("description", ""),
                        "nutrients": nutrients,
                        "source": "USDA"
                    })
                
                return foods
            else:
                return []
                
        except Exception as e:
            print(f"USDA API error: {e}")
            return []
    
    def get_food_by_id(self, fdc_id: int):
        """Get detailed food info by FDC ID"""
        try:
            url = f"{self.BASE_URL}/food/{fdc_id}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                return response.json()
            return None
            
        except Exception as e:
            print(f"USDA API error: {e}")
            return None