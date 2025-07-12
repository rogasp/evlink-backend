# backend/app/auth/supabase_auth.py

from fastapi import Request, HTTPException
from jose import jwt
from app.config import SUPABASE_JWT_SECRET

async def get_supabase_user(request: Request):
    """Authenticates a user based on a Supabase JWT provided in the Authorization header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.split("Bearer ")[1]

    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        user_id = payload.get("sub")
        role = payload.get("role", "user")
        email = payload.get("email")
        user_metadata = payload.get("user_metadata", {})  # Add this

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        return {
            "id": user_id,
            "role": role,
            "email": email,
            "access_token": token,
            "user_metadata": user_metadata  # Key for require_admin to work
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token decode failed: {str(e)}")
