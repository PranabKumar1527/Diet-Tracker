from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Diet Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
async def root():
    return {"message": "Diet Tracker API is running"}