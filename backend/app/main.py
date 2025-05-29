"""
backend/app/main.py

FastAPI application entrypoint for EVLink backend.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.logger import logger  # Initialize logging config
from app.api import admin, ha, me, private, public, webhook
from app.config import (
    IS_PROD,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET,
)

logger.info("🚀 Starting EVLink Backend...")

app = FastAPI(
    title="EVLink Backend",
    version="0.2.0",
    description="Minimal FastAPI backend for secured API access.",
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
    openapi_url=None if IS_PROD else "/openapi.json",
)

# Configure CORS for frontend origins
origins = ["http://localhost:3100"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(public.router, prefix="/api")
app.include_router(private.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(webhook.router, prefix="/api")
app.include_router(me.router, prefix="/api")
app.include_router(ha.router, prefix="/api")

# Custom OpenAPI schema to enforce JWT security globally

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    components = openapi_schema.setdefault("components", {})
    security_schemes = components.setdefault("securitySchemes", {})
    security_schemes["bearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }

    for path_item in openapi_schema.get("paths", {}).values():
        for operation in path_item.values():
            operation.setdefault("security", [{"bearerAuth": []}])

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
