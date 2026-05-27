from fastapi import APIRouter, HTTPException
from models.user_model import UserRegister, GoalUpdate, UserLogin
from supabase import create_client
from dotenv import load_dotenv
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import os
from datetime import date
from utils.ai_parser import FoodParser
from utils.tdee_calculator import calculate_tdee

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

@router.get("/user-profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile with calculated targets"""
    result = supabase.table("users").select("*").eq("id", user_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    user = result.data[0]

    # Calculate targets
    targets = calculate_tdee(
        weight_kg=user.get("weight_kg", 70),
        height_cm=user.get("height_cm", 170),
        age=user.get("age", 25),
        sex=user.get("sex", "Male"),
        activity_level=user.get("activity_level", "Sedentary"),
        goals=user.get("goal", [])
    )

    # Save targets to database
    existing = supabase.table("daily_targets").select("*").eq("user_id", user_id).execute()
    if existing.data:
        supabase.table("daily_targets").update(targets).eq("user_id", user_id).execute()
    else:
        supabase.table("daily_targets").insert({**targets, "user_id": user_id}).execute()

    return {
        "user": user,
        "targets": targets
    }


@router.post("/generate-meal")
async def generate_meal(data: dict):
    """Generate AI meal suggestion"""
    user_id = data.get("user_id")
    meal_type = data.get("meal_type", "Breakfast")
    special_notes = data.get("special_notes", "")

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")

    # Get user profile
    user_result = supabase.table("users").select("*").eq("id", user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")

    user = user_result.data[0]

    # Get targets
    targets = calculate_tdee(
        weight_kg=user.get("weight_kg", 70),
        height_cm=user.get("height_cm", 170),
        age=user.get("age", 25),
        sex=user.get("sex", "Male"),
        activity_level=user.get("activity_level", "Sedentary"),
        goals=user.get("goal", [])
    )

    user_profile = {**user, **targets}

    # Generate meal suggestion
    suggestion = food_parser.generate_meal_suggestion(
        meal_type=meal_type,
        user_profile=user_profile,
        special_notes=special_notes
    )

    return {
        "meal_type": meal_type,
        "suggestion": suggestion
    }


@router.get("/weekly-summary/{user_id}")
async def get_weekly_summary(user_id: str):
    """Get weekly food summary"""
    from datetime import date, timedelta

    today = date.today()
    monday = today - timedelta(days=today.weekday())

    weekly_data = []
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    for i in range(7):
        day_date = monday + timedelta(days=i)
        result = supabase.table("food_logs").select("*").eq(
            "user_id", user_id
        ).eq("log_date", str(day_date)).execute()

        logs = result.data
        total_calories = sum(log.get("calories", 0) for log in logs)
        total_protein = sum(log.get("protein_gm", 0) for log in logs)

        weekly_data.append({
            "day": days[i],
            "date": str(day_date),
            "calories": round(total_calories, 1),
            "protein_gm": round(total_protein, 1),
            "logs_count": len(logs)
        })

    return {"weekly_data": weekly_data}


@router.post("/ai-chat")
async def ai_chat(data: dict):
    """Chat with AI nutrition assistant"""
    message = data.get("message")
    user_id = data.get("user_id")

    if not message:
        raise HTTPException(status_code=400, detail="message required")

    # Get user context
    user_result = supabase.table("users").select("*").eq("id", user_id).execute()
    user = user_result.data[0] if user_result.data else {}

    # Get today's logs
    from datetime import date
    today = str(date.today())
    logs_result = supabase.table("food_logs").select("*").eq(
        "user_id", user_id
    ).eq("log_date", today).execute()

    logs_summary = "\n".join([
        f"- {log.get('meal_type')}: {log.get('food_description')} ({log.get('calories')} kcal)"
        for log in logs_result.data
    ]) if logs_result.data else "No food logged today"

    prompt = f"""You are a friendly AI nutrition assistant for Diet Tracker app.

USER PROFILE:
- Name: {user.get('full_name', 'User')}
- Goals: {', '.join(user.get('goal', []))}
- Activity: {user.get('activity_level', 'Unknown')}

TODAY'S FOOD LOG:
{logs_summary}

USER MESSAGE: {message}

Respond helpfully and concisely as a nutrition expert. Keep response under 150 words."""

    from mcp.nutrition_api import NutritionMCP
    try:
        from utils.ai_parser import call_groq, clean_ai_text
        response = clean_ai_text(call_groq(prompt))
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))