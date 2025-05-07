import hmac
import hashlib
from app.config import ENODE_WEBHOOK_SECRET


def verify_signature(payload: bytes, signature: str) -> bool:
    """
    Verifies the HMAC-SHA1 signature of an incoming Enode webhook.
    """
    expected_signature = (
        "sha1="
        + hmac.new(
            ENODE_WEBHOOK_SECRET.encode("utf-8"),
            payload,
            hashlib.sha1,
        ).hexdigest()
    )
    return hmac.compare_digest(expected_signature, signature)
