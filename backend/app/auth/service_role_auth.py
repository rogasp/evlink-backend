# app/auth/service_role_auth.py

from fastapi import Header, HTTPException
from app.config import SUPABASE_SERVICE_ROLE_KEY

async def verify_service_role_token(authorization: str = Header(...)):
    """Verifies the provided Authorization header against the Supabase Service Role Key."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    token = authorization.split(" ")[1]

    if token != SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=403, detail="Invalid service role key")

    return {"role": "service"}
