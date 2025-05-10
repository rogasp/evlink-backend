import hashlib
import secrets

def generate_api_key(length: int = 32) -> str:
    """
    Generates a secure random API key as a hex string.
    """
    return secrets.token_hex(length)

def hash_api_key(api_key: str) -> str:
    """
    Hashes the API key using SHA-256 for secure storage.
    """
    return hashlib.sha256(api_key.encode()).hexdigest()
