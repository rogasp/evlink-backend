from fastapi import APIRouter, HTTPException, Depends, Header, Response, Path,status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from schemas.auth import LoginRequest, TokenResponse, RegisterRequest, RegisterResponse
from storage import create_user, get_user_by_email, create_api_key, get_api_key_info, update_user_email
from security import hash_password, verify_password, create_access_token, get_current_user, create_refresh_token, decode_token, verify_jwt_token
import uuid

router = APIRouter()

class UpdateEmailRequest(BaseModel):
    email: EmailStr

@router.get("/ping")
async def ping():
    return {"message": "pong"}

@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token_endpoint(refresh_token: str = Header(...)):
    try:
        payload = decode_token(refresh_token)
        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id or not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        new_access_token = create_access_token(
            data={"sub": user_id, "email": email}
        )

        return TokenResponse(access_token=new_access_token)

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, response: Response):
    user = get_user_by_email(credentials.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(
        data={"sub": user["user_id"], "email": user["email"]}
    )
    refresh_token = create_refresh_token(
        data={"sub": user["user_id"], "email": user["email"]}
    )

    # Sätt refresh-token i en HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Borde vara True i production (HTTPS)
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 dagar
        path="/",
    )

    return {"access_token": access_token}


@router.post("/register", response_model=RegisterResponse)
async def register_user(payload: RegisterRequest):
    existing_user = get_user_by_email(payload.email)
    if existing_user:
        return JSONResponse(
            status_code=400,
            content={"detail": "An account with this email already exists."}
        )

    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(payload.password)
    
    create_user(user_id=user_id, email=payload.email, hashed_password=hashed_pw)
    
    return RegisterResponse(message="User registered successfully")

@router.get("/protected-data")
async def protected_data(user: dict = Depends(get_current_user)):
    return {"message": f"Hello, {user['email']}! This is protected data."}

@router.post("/users/{user_id}/apikey")
async def create_user_api_key(user_id: str = Path(...)):
    raw_key = create_api_key(user_id)
    return {"api_key": raw_key}

@router.get("/users/{user_id}/apikey")
async def get_user_api_key_info(user_id: str = Path(...)):
    info = get_api_key_info(user_id)

    if info:
        return {
            "api_key_masked": "***************",  # Visa bara maskerat
            "created_at": info["created_at"]
        }
    else:
        return {"api_key_masked": None}
    
