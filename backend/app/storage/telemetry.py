"""
backend/app/storage/telemetry.py

Functions to store API telemetry events in the database using Supabase.
"""
from typing import Optional
from app.lib.supabase import get_supabase_admin_client

supabase = get_supabase_admin_client()

async def log_api_telemetry(
    endpoint: str,
    user_id: Optional[str],
    vehicle_id: Optional[str],
    status: int,
    error_message: Optional[str],
    duration_ms: int,
    timestamp: str,
) -> None:
    """
    Insert a new telemetry record into the api_telemetry table.
    Fields:
      - endpoint: path of the API call
      - user_id: authenticated user ID or None
      - vehicle_id: optional vehicle identifier
      - status: HTTP status code returned
      - error_message: error details if status >= 400
      - duration_ms: request duration in milliseconds
      - timestamp: ISO 8601 timestamp of the event
    """
    payload = {
        "endpoint": endpoint,
        "user_id": user_id,
        "vehicle_id": vehicle_id,
        "status": status,
        "error_message": error_message,
        "duration_ms": duration_ms,
        "timestamp": timestamp,
    }
    # Insert the payload into the api_telemetry table
    supabase.table("api_telemetry").insert(payload).execute()
