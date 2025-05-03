from fastapi import Request, HTTPException
from app.lib.supabase import supabase

async def get_supabase_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.split("Bearer ")[1]

    try:
        response = supabase.auth.get_user(token)
        if response.user is None:
            raise HTTPException(status_code=401, detail="Invalid Supabase token")
        return response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth failed: {str(e)}")
