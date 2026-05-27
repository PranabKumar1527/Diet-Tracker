def calculate_tdee(weight_kg: float, height_cm: float, age: int, sex: str, activity_level: str, goals: list):
    """
    Calculate Total Daily Energy Expenditure using Mifflin-St Jeor formula
    """

    # Step 1: Calculate BMR
    if sex == "Male":
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

    # Step 2: Apply activity multiplier
    activity_multipliers = {
        "Sedentary": 1.2,
        "Lightly Active": 1.375,
        "Moderately Active": 1.55,
        "Very Active": 1.725,
        "Athlete": 1.9
    }
    multiplier = activity_multipliers.get(activity_level, 1.2)
    tdee = bmr * multiplier

    # Step 3: Adjust for goals
    if "Fat Loss" in goals:
        tdee = tdee - 500
    elif "Bulking" in goals:
        tdee = tdee + 500
    elif "Muscle Build" in goals:
        tdee = tdee + 250

    # Step 4: Calculate protein target
    if "Muscle Build" in goals or "Bulking" in goals:
        protein = weight_kg * 2.2
    elif "Fat Loss" in goals:
        protein = weight_kg * 2.0
    else:
        protein = weight_kg * 1.8

    # Step 5: Calculate water and fiber
    water_ltr = round(weight_kg * 0.033, 1)
    fiber_gm = 30 if sex == "Male" else 25

    return {
        "calories": round(tdee),
        "protein_gm": round(protein),
        "water_ltr": water_ltr,
        "fiber_gm": fiber_gm
    }