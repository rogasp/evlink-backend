from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from webhook import router as webhook_router
from api import public, private
from storage import init_db

from security import verify_jwt_token

app = FastAPI(
    title="EVLink Backend",
    version="0.1.0",
    description="Secure backend for EV integrations via Home Assistant and Enode."
)

origins = [
    "http://localhost:3000",  # Frontend URL i utveckling
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🛠️ Init database

init_db()

# 🧾 API endpoints
app.include_router(public.router, prefix="/api")


app.include_router(private.router, prefix="/api", dependencies=[Depends(verify_jwt_token)])


# 📬 Webhook
app.include_router(webhook_router)

