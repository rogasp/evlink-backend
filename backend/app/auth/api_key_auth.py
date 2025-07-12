from fastapi import Depends, Header, HTTPException
from app.storage.api_key import get_user_by_api_key
from app.models.user import User

async def get_api_key_user(
    authorization: str = Header(..., alias="Authorization")
) -> User:
    """Authenticates a user based on a provided API key in the Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    user = await get_user_by_api_key(token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")

    return user
