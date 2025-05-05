# 📄 app/enode/verify.py

import hmac
import hashlib
from app.config import ENODE_WEBHOOK_SECRET

def verify_signature(raw_body: bytes, signature: str) -> bool:
    """
    Verifies the HMAC SHA-256 signature of the webhook payload.
    """
    secret = ENODE_WEBHOOK_SECRET.encode()
    computed = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed, signature)
