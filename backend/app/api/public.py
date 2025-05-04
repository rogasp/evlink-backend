# app/api/public.py

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr

from app.storage.interest import save_interest

router = APIRouter()

class InterestSubmission(BaseModel):
    name: str
    email: EmailStr


@router.get("/status")
async def status():
    return {"status": "ok"}

@router.get("/ping")
async def ping():
    return {"message": "pong"}

@router.post("/interest")
async def submit_interest(data: InterestSubmission, request: Request):
    try:
        save_interest(data.name, data.email)
        return {"message": "Thanks! We'll notify you when we launch."}
    except Exception as e:
        print(f"❌ Interest submission error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")