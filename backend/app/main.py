"""
backend/app/main.py

FastAPI application entrypoint with extensive telemetry middleware for EVLink backend.
"""
import asyncio
import json
import logging
import time
from typing import AsyncIterator

import sentry_sdk
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.security import HTTPAuthorizationCredentials

from app.api import ha, me, newsletter, payments, private, public, webhook
from app.api.admin import routers as admin_routers
from app.config import ENDPOINT_COST, IS_PROD, SENTRY_DSN
from app.dependencies.auth import get_current_user
from app.logger import logger
from app.storage.telemetry import log_api_telemetry

# Initialize Sentry
sentry_sdk.init(
    dsn=SENTRY_DSN,
    # Add data like request headers and IP for users,
    # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
    send_default_pii=True,
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

# -------------------------
# Telemetry middleware
# -------------------------
@app.middleware("http")
async def telemetry_middleware(request: Request, call_next):
    """
    Middleware to log API telemetry data for requests to /api/ and /webhook.

    This middleware captures:
    - Request and response bodies.
    - User ID and Vehicle ID from the request.
    - Request processing time.
    - Status code, request/response sizes.
    - Calculated token cost for the endpoint.

    All telemetry data is logged asynchronously to the `api_telemetry` table.
    It also handles replaying the response body so that it can be read
    without being consumed.
    """
    # TODO: Add a server identifier to telemetry logs. This would involve:
    # 1. Reading an environment variable (e.g., SERVER_IDENTIFIER).
    # 2. Adding a `server_id` parameter to the `log_api_telemetry` function.
    # 3. Adding a `server_id` column to the `api_telemetry` table in Supabase.
    path = request.url.path
    should_log = path.startswith("/api/") or path.startswith("/webhook")
    start_ts = None
    user_id = None
    raw_body = b""

    if should_log:
        start_ts = time.time()
        raw_body = await request.body()
        # Parse request_payload if possible, otherwise it remains None.
        request_payload = None
        try:
            if raw_body:
                request_payload = json.loads(raw_body)
        except json.JSONDecodeError:
            # This ensures that if the body is not valid JSON, request_payload remains None,
            # thus satisfying the type hint of the log_api_telemetry function.
            pass

        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            try:
                # Pass the entire auth_header to our dependency
                user = await get_current_user(creds=HTTPAuthorizationCredentials(scheme="Bearer", credentials=auth_header.split(" ",1)[1]))
                user_id = user.id
            except HTTPException:
                # Invalid JWT or API key
                pass

    # Get response
    response = await call_next(request)

    if should_log and start_ts is not None:
        duration_ms = int((time.time() - start_ts) * 1000)
        vehicle_id = request.path_params.get("vehicle_id")
        status = response.status_code

        # Start by collecting all parts from response.body_iterator
        body_chunks: list[bytes] = []
        try:
            # NOTE: body_iterator can be an async iterator
            async for chunk in response.body_iterator:
                body_chunks.append(chunk)
        except Exception:
            # If it fails, ignore the response payload
            body_chunks = []

        # Set the iterator back as an async generator
        async def _replay_body() -> AsyncIterator[bytes]:
            for chunk in body_chunks:
                yield chunk

        response.body_iterator = _replay_body()

        # Calculate size + payload
        response_payload = None
        response_size = None
        if body_chunks:
            full = b"".join(body_chunks)
            response_size = len(full)
            try:
                response_payload = full.decode("utf-8", errors="ignore")
            except:
                response_payload = None

        # Cost
        cost_tokens = 0
        if user_id:
            for prefix, cost in ENDPOINT_COST.items():
                if path.startswith(prefix):
                    cost_tokens = cost
                    break

        # Async log
        asyncio.create_task(
            log_api_telemetry(
                endpoint         = path,
                user_id          = user_id,
                vehicle_id       = vehicle_id,
                status           = status,
                error_message    = None if status < 400 else None,
                duration_ms      = duration_ms,
                timestamp        = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                request_size     = len(raw_body),
                response_size    = response_size,
                request_payload  = request_payload,
                response_payload = response_payload,
                cost_tokens      = cost_tokens,
            )
        )

    return response

# -------------------------
# CORS configuration
# -------------------------
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Routers
# -------------------------
app.include_router(public.router, prefix="/api")
app.include_router(private.router, prefix="/api")
# app.include_router(admin.router, prefix="/api")
app.include_router(webhook.router, prefix="/api")
app.include_router(me.router, prefix="/api")
app.include_router(ha.router, prefix="/api")
app.include_router(newsletter.router, prefix="/api")
app.include_router(payments.router, prefix="/api/payments")

from app.api.internal import router as internal_router

for router in admin_routers:
    app.include_router(router, prefix="/api")
app.include_router(internal_router, prefix="/api/v1")

# -------------------------
# Swagger / OpenAPI JWT support
# -------------------------
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
