from fastapi import APIRouter, HTTPException
from schemas.auth import LoginRequest, TokenResponse

router = APIRouter()

@router.get("/ping")
async def ping():
    return {"message": "pong"}


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    # Mock: Vi accepterar bara en viss användare för test
    if credentials.email == "test@example.com" and credentials.password == "password123":
        return TokenResponse(access_token="mocked-jwt-token")
    
    raise HTTPException(status_code=401, detail="Invalid email or password")
