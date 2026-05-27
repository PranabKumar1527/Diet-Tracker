from fastapi import APIRouter, HTTPException
from models.user_model import UserRegister, GoalUpdate, UserLogin
from supabase import create_client
from dotenv import load_dotenv
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import os
from datetime import date
from utils.ai_parser import FoodParser

load_dotenv()

router = APIRouter()

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_KEY")
)

ph = PasswordHasher()
# Initialize food parser (add this after ph = PasswordHasher())

food_parser = FoodParser()



@router.post("/register")
async def register(user: UserRegister):
    existing = supabase.table("users").select("*").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    today = date.today()
    age = today.year - user.dob.year - (
        (today.month, today.day) < (user.dob.month, user.dob.day)
    )

    password_hash = ph.hash(user.password)

    new_user = {
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "dob": str(user.dob),
        "age": age,
        "sex": user.sex,
        "profession": user.profession,
        "activity_level": user.activity_level,
        "weight_kg": user.weight_kg,
        "height_cm": user.height_cm,
        "is_verified": True,
        "password_hash": password_hash
    }

    result = supabase.table("users").insert(new_user).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Registration failed")

    return {
        "message": "Registration successful",
        "user_id": result.data[0]["id"],
        "full_name": result.data[0]["full_name"]
    }


@router.post("/login")
async def login(user: UserLogin):
    result = supabase.table("users").select("*").eq("email", user.email).execute()

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    db_user = result.data[0]

    try:
        ph.verify(db_user["password_hash"], user.password)
    except VerifyMismatchError:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user_id": db_user["id"],
        "full_name": db_user["full_name"],
        "goal": db_user.get("goal", [])
    }


@router.post("/log-food")
async def log_food(data: dict):
    """
    Log food with AI parsing using RAG + MCP
    Request body: {
        "user_id": "uuid",
        "food_description": "2 rotis with dal and curd",
        "meal_type": "Lunch"
    }
    """
    user_id = data.get("user_id")
    food_description = data.get("food_description")
    meal_type = data.get("meal_type", "Miscellaneous")
    
    if not user_id or not food_description:
        raise HTTPException(status_code=400, detail="user_id and food_description required")
    
    # Parse food using RAG + MCP + AI
    try:
        parsed = food_parser.parse_food_input(food_description)
        
        # Save to database
        log_entry = {
            "user_id": user_id,
            "meal_type": meal_type,
            "food_description": food_description,
            "calories": parsed["total"]["calories"],
            "protein_gm": parsed["total"]["protein_gm"],
            "carbs_gm": parsed["total"]["carbs_gm"],
            "fat_gm": parsed["total"]["fat_gm"],
            "fiber_gm": parsed["total"]["fiber_gm"],
            "water_ml": parsed["total"]["water_ml"],
            "ai_review": parsed["ai_review"]
        }
        
        result = supabase.table("food_logs").insert(log_entry).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save food log")
        
        return {
            "message": "Food logged successfully",
            "parsed_data": parsed,
            "log_id": result.data[0]["id"]
        }
        
    except Exception as e:
        print(f"Food parsing error: {e}")
        raise HTTPException(status_code=500, detail=f"Food parsing failed: {str(e)}")


@router.get("/daily-summary/{user_id}")
async def get_daily_summary(user_id: str):
    """Get today's food intake summary for a user"""
    from datetime import date
    
    today = str(date.today())
    
    # Get all logs for today
    result = supabase.table("food_logs").select("*").eq(
        "user_id", user_id
    ).eq("log_date", today).execute()
    
    logs = result.data
    
    # Calculate totals
    total_calories = sum(log.get("calories", 0) for log in logs)
    total_protein = sum(log.get("protein_gm", 0) for log in logs)
    total_carbs = sum(log.get("carbs_gm", 0) for log in logs)
    total_fat = sum(log.get("fat_gm", 0) for log in logs)
    total_fiber = sum(log.get("fiber_gm", 0) for log in logs)
    total_water = sum(log.get("water_ml", 0) for log in logs)
    
    return {
        "date": today,
        "logs": logs,
        "total": {
            "calories": round(total_calories, 1),
            "protein_gm": round(total_protein, 1),
            "carbs_gm": round(total_carbs, 1),
            "fat_gm": round(total_fat, 1),
            "fiber_gm": round(total_fiber, 1),
            "water_ml": round(total_water, 1)
        }
    }

@router.post("/update-goals")
async def update_goals(data: GoalUpdate):
    result = supabase.table("users").update(
        {"goal": data.goals}
    ).eq("id", data.user_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Goals updated successfully"}