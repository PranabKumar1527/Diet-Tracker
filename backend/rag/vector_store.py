import chromadb
from chromadb.config import Settings
import os

class NutritionVectorStore:
    """Vector store for nutrition data using ChromaDB"""
    
    def __init__(self, persist_directory="./data/chroma"):
        os.makedirs(persist_directory, exist_ok=True)
        
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="nutrition_db",
            metadata={"description": "Nutrition data for foods"}
        )
    
    def add_foods(self, foods_data: list):
        """
        Add foods to vector store
        foods_data = [
            {
                "name": "Roti",
                "calories": 71,
                "protein": 2.5,
                "carbs": 15,
                "fat": 0.4,
                "fiber": 2.0,
                "description": "Whole wheat Indian flatbread"
            }
        ]
        """
        documents = []
        metadatas = []
        ids = []
        
        for i, food in enumerate(foods_data):
            # Create searchable text
            doc_text = f"{food['name']} {food.get('description', '')}"
            documents.append(doc_text)
            
            # Store nutrition data as metadata
            metadatas.append({
                "name": food["name"],
                "calories": float(food.get("calories", 0)),
                "protein": float(food.get("protein", 0)),
                "carbs": float(food.get("carbs", 0)),
                "fat": float(food.get("fat", 0)),
                "fiber": float(food.get("fiber", 0)),
                "description": food.get("description", "")
            })
            
            ids.append(f"food_{i}_{food['name'].replace(' ', '_')}")
        
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
    
    def search(self, query: str, n_results: int = 5):
        """Search for similar foods"""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        foods = []
        if results and results['metadatas']:
            for metadata in results['metadatas'][0]:
                foods.append(metadata)
        
        return foods
    
    def count(self):
        """Get total number of foods in DB"""
        return self.collection.count()