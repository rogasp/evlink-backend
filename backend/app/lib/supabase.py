from supabase import create_client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Admin-klient (för server-anrop, t.ex. webhooks)
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Auth-klient – sätts dynamiskt när du har en användartoken
def get_supabase_client_with_token(token: str):
    return create_client(SUPABASE_URL, token)
