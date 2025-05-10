# 📄 app/lib/supabase.py

from supabase import create_client
from app.config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise RuntimeError("Missing Supabase URL or anon key.")

# 👥 Used when authenticating users (respects RLS)
def create_supabase_client_with_token(token: str):
    return create_client(SUPABASE_URL, token)

# 🔐 Used internally for webhooks or admin tasks (bypasses RLS)
def get_supabase_admin_client():
    if not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("Missing Supabase service role key.")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
