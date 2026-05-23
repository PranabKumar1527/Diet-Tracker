import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ.get("RESEND_API_KEY")

def send_verification_email(to_email: str, token: str):
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    verification_link = f"{frontend_url}/verify?token={token}"
    
    params = {
        "from": "Diet Tracker <onboarding@resend.dev>",
        "to": [to_email],
        "subject": "Verify your Diet Tracker Account",
        "html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e;">Welcome to Diet Tracker!</h2>
            <p>Hi there! Please verify your email address to complete registration.</p>
            <a href="{verification_link}" 
               style="background-color: #22c55e; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
                Verify My Account
            </a>
            <p style="color: #666;">This link expires in 24 hours.</p>
            <p style="color: #666;">If you did not create this account, ignore this email.</p>
        </div>
        """
    }
    
    response = resend.Emails.send(params)
    return response