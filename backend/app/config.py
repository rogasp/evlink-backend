# app/config.py

import os
from dotenv import load_dotenv

load_dotenv()
CACHE_EXPIRATION_MINUTES: int = int(os.getenv("CACHE_EXPIRATION_MINUTES", 10))  # Default to 10 minutes
ENODE_WEBHOOK_SECRET = os.getenv("ENODE_WEBHOOK_SECRET")

class Settings:
    ENODE_CLIENT_ID: str = os.getenv("ENODE_CLIENT_ID")
    ENODE_CLIENT_SECRET: str = os.getenv("ENODE_CLIENT_SECRET")
    ENODE_BASE_URL: str = os.getenv("ENODE_BASE_URL", "https://enode-api.sandbox.enode.io")
    ENODE_AUTH_URL: str = os.getenv("ENODE_AUTH_URL", "https://oauth.sandbox.enode.io/oauth2/token")
    REDIRECT_URI: str = os.getenv("REDIRECT_URI")
    


settings = Settings()
