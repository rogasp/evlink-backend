from fastapi import FastAPI
from app.api import router as api_router
from app.webhook import router as webhook_router
from app.storage import init_db

app = FastAPI(
    title="EV Link Backend",
    version="0.1.0",
    description="A secure proxy between Home Assistant and Enode."
)

init_db()
app.include_router(api_router, prefix="/api")
app.include_router(webhook_router)

@app.get("/ping")
async def ping():
    return {"message": "pong"}
