from fastapi import Request, HTTPException, Header, status, Depends
from jose import jwt, JWTError
from datetime import datetime, timedelta

from typing import Optional
from storage import get_user_id_from_api_key
import bcrypt

SECRET_KEY = "supersecretkey123"  # Byt till en riktig hemlighet i din .env fil sen!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 timme

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

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.split(" ")[1]
    payload = decode_token(token)

    return payload  # Vi returnerar hela payload just nu (kan anpassas senare)