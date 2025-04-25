from fastapi import Request, HTTPException, Header
from datetime import datetime

from storage import get_user_id_from_api_key


async def require_api_key(request: Request, x_api_key: str = Header(...)) -> str:
    user_id = get_user_id_from_api_key(x_api_key)
    if not user_id:
        client_ip = request.client.host
        print(f"[🔒 401] Unauthorized access at {datetime.utcnow().isoformat()} from {client_ip} – API key: {x_api_key[:8]}...")
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return user_id

def require_local_request(request: Request):
    client_ip = request.client.host
    if client_ip not in ["127.0.0.1", "::1"]:
        timestamp = datetime.utcnow().isoformat()
        print(f"[⛔ DENIED DEV ACCESS] {timestamp} | IP: {client_ip} tried to access local-only endpoint.")
        raise HTTPException(status_code=403, detail=f"Access denied for IP: {client_ip}")
