from fastapi import FastAPI
from app.api import router as api_router
from app.storage import init_db
from fastapi.staticfiles import StaticFiles
import os
from fastapi.responses import RedirectResponse
from app.webhook import router as webhook_router  # 👈 denna rad


app = FastAPI(
    title="EV Link Backend",
    version="0.1.0",
    description="A secure proxy between Home Assistant and Enode."
)

init_db()
app.include_router(api_router, prefix="/api")
app.include_router(webhook_router)  # 👈 registrerar webhook utan prefix
app.include_router(webhook_router)

# Serve static files from /static
app.mount("/static", StaticFiles(directory=os.path.join(os.getcwd(), "static")), name="static")

@app.get("/")
async def root():
    return RedirectResponse(url="/static/link.html")

@app.get("/ping")
async def ping():
    return {"message": "pong"}
