from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.webhook import router as webhook_router
from app.api import public, private, user_routes
from app.storage import init_db
from app.security import verify_jwt_token

app = FastAPI(
    title="EVLink Backend",
    version="0.1.0",
    description="Secure backend for EV integrations via Home Assistant and Enode.",
    root_path="/backend/api"
)

origins = [
    "http://localhost:3000",  # Frontend URL i utveckling
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://95bcf61e0e04.ngrok.app",  # 👈 lägg till din ngrok-url här
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🛠️ Init database
init_db()

# 🧾 API endpoints
app.include_router(public.router)
app.include_router(private.router, dependencies=[Depends(verify_jwt_token)])
app.include_router(user_routes.router)

# 📬 Webhook
app.include_router(webhook_router)
