# app/dependencies/auth.py
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.storage.api_key import get_user_by_api_key
from app.models.user import User
from app.lib.supabase import get_supabase_admin_client
from supabase import SupabaseAuthClient

# 1) Setup for Bearer token (auto_error=False so we can raise our own exceptions)
bearer_scheme = HTTPBearer(auto_error=False)

# 2) Get the Supabase admin client
supabase_admin: SupabaseAuthClient = get_supabase_admin_client()

async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> User:
    """Retrieves the current authenticated user, supporting both JWT and API key authentication."""
    if not creds or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = creds.credentials

    # 3a) Attempt to validate as JWT via Supabase
    try:
        user_resp = supabase_admin.auth.get_user(token)
        if user_resp and user_resp.user:
            # Map to your app.models.user.User if necessary
            return user_resp.user  # or: return User(**user_resp.user.dict())
    except Exception:
        # JWT invalid or expired
        pass

    # 3b) Attempt to validate as Home Assistant API-key
    user = await get_user_by_api_key(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid JWT or API key")

    return user
