# 📄 app/lib/supabase.py

from supabase import create_client, create_async_client
from app.config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise RuntimeError("Missing Supabase URL or anon key.")

def create_supabase_client_with_token(token: str):
    """Creates a Supabase client with a user's JWT, respecting Row Level Security (RLS)."""
    return create_client(SUPABASE_URL, token)

async def get_supabase_admin_async_client():
    """
    Creates an ASYNCHRONOUS Supabase client with the service role key, bypassing Row Level Security (RLS).
    This client should be used for async operations (e.g., RPC calls).
    """
    if not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("Missing Supabase service role key.")
    return await create_async_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def get_supabase_admin_client():
    """Creates a Supabase client with the service role key, bypassing Row Level Security (RLS)."""
    if not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("Missing Supabase service role key.")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
