# backend/app/lib/supabase.py

from supabase import create_client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# 🔐 Admin client – används i webhook och serverkod
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# 👤 Auth client – används när användaren är inloggad
def get_supabase_client_with_token(token: str):
    return create_client(SUPABASE_URL, token)

# 🧩 Alias som tar token (för kompatibilitet med kod som använder create_supabase_client(token))
def create_supabase_client(token: str):
    return create_client(SUPABASE_URL, token)
