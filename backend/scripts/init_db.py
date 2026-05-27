import sys
sys.path.append('..')

from rag.vector_store import NutritionVectorStore
from data.indian_foods import INDIAN_FOODS

def initialize_vector_store():
    """Initialize vector store with Indian foods data"""
    print("Initializing vector store...")
    
    store = NutritionVectorStore()
    
    # Check if already initialized
    count = store.count()
    if count > 0:
        print(f"Vector store already has {count} items")
        response = input("Re-initialize? (y/n): ")
        if response.lower() != 'y':
            print("Skipped initialization")
            return
    
    # Add Indian foods
    print(f"Adding {len(INDIAN_FOODS)} Indian foods...")
    store.add_foods(INDIAN_FOODS)
    
    print(f"✅ Vector store initialized with {store.count()} foods")
    
    # Test search
    print("\nTest search for 'roti':")
    results = store.search("roti", n_results=3)
    for r in results:
        print(f"  - {r['name']}: {r['calories']} kcal")

if __name__ == "__main__":
    initialize_vector_store()