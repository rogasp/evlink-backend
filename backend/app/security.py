from fastapi import Request, HTTPException, Header, status
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
import bcrypt
import os

from app.storage.apikey import get_user_id_from_api_key

SECRET_KEY = os.getenv("NEXTAUTH_SECRET", "KqGxiCaEm2FoQIAzgOGmVuHWkGRg01KO0Xkre76tmhA=")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

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
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=7))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
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
    return decode_token(token)

def verify_jwt_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization Header")

    token = auth_header.split(" ")[1]
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
