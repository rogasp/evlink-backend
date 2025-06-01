import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

WEBHOOK_URL = os.getenv("WEBHOOK_URL")
ENODE_WEBHOOK_SECRET = os.getenv("ENODE_WEBHOOK_SECRET")
ENODE_BASE_URL = os.getenv("ENODE_BASE_URL")
ENODE_AUTH_URL = os.getenv("ENODE_AUTH_URL")
CLIENT_ID = os.getenv("ENODE_CLIENT_ID")
CLIENT_SECRET = os.getenv("ENODE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
USE_MOCK = os.getenv("MOCK_LINK_RESULT", "false").lower() == "true"
IS_PROD = os.getenv("ENV", "prod") == "prod"

CACHE_EXPIRATION_MINUTES = int(os.getenv("CACHE_EXPIRATION_MINUTES", 5))

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = "roger@evlinkha.se"

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_CUSTOMERS_LIST_ID = int(os.getenv("BREVO_CUSTOMERS_LIST_ID", "4"))
