"""
Configuration settings for the EVLink backend, loaded from environment variables.
"""
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
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@evlinkha.se")
FROM_NAME = os.getenv("FROM_NAME", "EVLinkHA")

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_CUSTOMERS_LIST_ID = int(os.getenv("BREVO_CUSTOMERS_LIST_ID", "4"))

SENTRY_DSN = os.getenv("SENTRY_DSN")

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
STRIPE_WEBHOOK_SECRET= os.getenv("STRIPE_WEBHOOK_SECRET", "whc")
SUCCESS_URL = os.getenv("STRIPE_SUCCESS_URL", "https://evlinkha.se/success")
CANCEL_URL = os.getenv("STRIPE_CANCEL_URL", "https://evlinkha.se/cancel")

INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")

ENDPOINT_COST = {
    "/api/ha/status/": 1,
    "/api/ha/charging/":1,
}
