from fastapi import APIRouter, HTTPException
from app.utils.db import add_user, get_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/signup")
def signup(user_id: str, name: str, email: str):
    """Create a new user"""
    if get_user(user_id):
        raise HTTPException(status_code=400, detail="User already exists")
    user = add_user(user_id, {"name": name, "email": email})
    return user

@router.get("/{user_id}")
def get_user_profile(user_id: str):
    """Get user profile"""
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user