from fastapi import APIRouter, Body, HTTPException
from app.storage import user_exists, create_user

router = APIRouter()

@router.get("/ping")
async def ping():
    return {"message": "pong"}

@router.get("/public/user/{user_id}")
async def check_user_exists(user_id: str):
    exists = user_exists(user_id)
    return {"exists": exists}

@router.post("/register")
async def register_user(payload: dict = Body(...)):
    user_id = payload.get("user_id")
    email = payload.get("email")

    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id")

    create_user(user_id, email)
    return {"status": "created", "user_id": user_id}
