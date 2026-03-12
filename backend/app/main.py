from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import finances, users
import os

app = FastAPI(title="FinSight API")

origins = [
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(finances.router)

@app.get("/")
def root():
    return {"message": "Welcome to FinSight API"}