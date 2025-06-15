""
# backend/app/storage/telemetry.py

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
    request_size: Optional[int] = None,
    response_size: Optional[int] = None,
    request_payload: Optional[dict] = None,
    response_payload: Optional[str] = None,
    cost_tokens: int = 0,
) -> None:
    """
    Insert a new telemetry record into the api_telemetry table.
    Fields:
      - endpoint
      - user_id
      - vehicle_id
      - status
      - error_message
      - duration_ms
      - timestamp
      - request_size
      - response_size
      - request_payload
      - response_payload
      - cost_tokens
    """
    payload = {
        "endpoint":         endpoint,
        "user_id":          user_id,
        "vehicle_id":       vehicle_id,
        "status":           status,
        "error_message":    error_message,
        "duration_ms":      duration_ms,
        "timestamp":        timestamp,
        "request_size":     request_size,
        "response_size":    response_size,
        "request_payload":  request_payload,
        "response_payload": response_payload,
        "cost_tokens":      cost_tokens,
    }
    # Insert the payload into the api_telemetry table
    supabase.table("api_telemetry").insert(payload).execute()
""
