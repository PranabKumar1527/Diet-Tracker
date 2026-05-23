from fastapi import APIRouter, HTTPException
from models.user_model import UserRegister, GoalUpdate
from utils.token_utils import create_verification_token, verify_token
from utils.email_utils import send_verification_email
from supabase import create_client
from dotenv import load_dotenv
import os
from datetime import date

load_dotenv()

router = APIRouter()

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_KEY")
)

@router.post("/register")
async def register(user: UserRegister):
    # Check if email already exists
    existing = supabase.table("users").select("*").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Calculate age from DOB
    today = date.today()
    age = today.year - user.dob.year - (
        (today.month, today.day) < (user.dob.month, user.dob.day)
    )
    
    # Save user to database
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
        "is_verified": False
    }
    
    result = supabase.table("users").insert(new_user).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Registration failed")
    
    # Create verification token and send email
    token = create_verification_token(user.email)
    send_verification_email(user.email, token)
    
    return {
        "message": "Registration successful. Please check your email to verify your account.",
        "user_id": result.data[0]["id"]
    }


@router.get("/verify")
async def verify_email(token: str):
    email = verify_token(token)
    
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    # Mark user as verified
    result = supabase.table("users").update(
        {"is_verified": True}
    ).eq("email", email).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Email verified successfully", "email": email}


@router.post("/update-goals")
async def update_goals(data: GoalUpdate):
    result = supabase.table("users").update(
        {"goal": data.goals}
    ).eq("id", data.user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Goals updated successfully"}