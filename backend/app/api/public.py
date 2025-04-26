from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from schemas.auth import LoginRequest, TokenResponse, RegisterRequest, RegisterResponse
from storage import create_user, get_user_by_email
from security import hash_password, verify_password, create_access_token, get_current_user
import uuid

router = APIRouter()

@router.get("/ping")
async def ping():
    return {"message": "pong"}


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    user = get_user_by_email(credentials.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(
        data={
            "sub": user["user_id"],
            "email": user["email"],
        }
    )

    return TokenResponse(access_token=access_token)

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