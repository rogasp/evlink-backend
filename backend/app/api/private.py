from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.security import verify_jwt_token
from app.storage import update_user_email

router = APIRouter()

class UpdateEmailRequest(BaseModel):
    email: EmailStr

@router.post("/users/{user_id}/email")
async def update_email(user_id: str, payload: UpdateEmailRequest, token_data: dict = Depends(verify_jwt_token)):
    """Update user's email."""
    if token_data["sub"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to update this user")

    update_user_email(user_id, payload.email)
    return {"message": "Email updated successfully"}
