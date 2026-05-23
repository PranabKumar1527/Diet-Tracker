from pydantic import BaseModel, EmailStr, field_validator
from typing import List
from datetime import date

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    dob: date
    sex: str
    profession: str
    activity_level: str
    weight_kg: float
    height_cm: float

    @field_validator("full_name")
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v.strip()

    @field_validator("phone")
    def validate_phone(cls, v):
        digits = v.replace(" ", "").replace("+", "")
        if not digits.isdigit():
            raise ValueError("Phone number must contain only digits")
        if len(digits) < 10 or len(digits) > 13:
            raise ValueError("Phone number must be 10 to 13 digits")
        return v

    @field_validator("dob")
    def validate_dob(cls, v):
        today = date.today()
        age = today.year - v.year - (
            (today.month, today.day) < (v.month, v.day)
        )
        if age < 10:
            raise ValueError("User must be at least 10 years old")
        if age > 100:
            raise ValueError("Please enter a valid date of birth")
        return v

    @field_validator("sex")
    def validate_sex(cls, v):
        allowed = ["Male", "Female", "Other"]
        if v not in allowed:
            raise ValueError(f"Sex must be one of: {', '.join(allowed)}")
        return v

    @field_validator("activity_level")
    def validate_activity(cls, v):
        allowed = [
            "Sedentary",
            "Lightly Active",
            "Moderately Active",
            "Very Active",
            "Athlete"
        ]
        if v not in allowed:
            raise ValueError(f"Activity level must be one of: {', '.join(allowed)}")
        return v

    @field_validator("weight_kg")
    def validate_weight(cls, v):
        if v < 20 or v > 300:
            raise ValueError("Weight must be between 20 kg and 300 kg")
        return v

    @field_validator("height_cm")
    def validate_height(cls, v):
        if v < 50 or v > 250:
            raise ValueError("Height must be between 50 cm and 250 cm")
        return v


class GoalUpdate(BaseModel):
    user_id: str
    goals: List[str]

    @field_validator("goals")
    def validate_goals(cls, v):
        allowed = ["Fat Loss", "Muscle Build", "Bulking", "Slim Fit"]
        for goal in v:
            if goal not in allowed:
                raise ValueError(f"Goal must be one of: {', '.join(allowed)}")
        if len(v) == 0:
            raise ValueError("At least one goal must be selected")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str