from fastapi import APIRouter, HTTPException, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from passlib.context import CryptContext

from backend.app.storage import create_user, user_exists

router = APIRouter()
templates = Jinja2Templates(directory="templates")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("/register", response_class=HTMLResponse)
async def show_register_form(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@router.post("/register")
async def register_user(
    user_id: str = Form(...),
    email: str = Form(...),
    password: str = Form(...)
):
    if user_exists(user_id):
        raise HTTPException(status_code=409, detail="User already exists")

    hashed_password = pwd_context.hash(password)
    create_user(user_id, email=email, password_hash=hashed_password)

    return HTMLResponse(
        content=f"<p class='text-green-600'>✅ User <strong>{user_id}</strong> successfully registered.</p>"
    )

@router.get("/register/success")
async def register_success(request: Request, user_id: str):
    return templates.TemplateResponse("register_success.html", {"request": request, "user_id": user_id})
