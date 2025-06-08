# backend/app/storage/subscription.py

from app.lib.supabase import get_supabase_admin_client

# Initialize Supabase admin client
supabase = get_supabase_admin_client()

async def get_user_record(user_id: str) -> dict:
    """
    Fetch the subscription-related fields for a user.
    Returns a dict with keys:
      - tier (e.g. "free" or "pro")
      - linked_vehicle_count (int)
      - subscription_status (e.g. "active", "canceled", "")
      - stripe_customer_id (str or None)
    """
    response = supabase \
        .table("users") \
        .select(
            "tier",
            "linked_vehicle_count",
            "subscription_status",
            "stripe_customer_id"
        ) \
        .eq("id", user_id) \
        .single() \
        .execute()

    return response.data or {}


async def update_linked_vehicle_count(user_id: str, new_count: int) -> None:
    """
    Update the linked_vehicle_count for a user.
    """
    supabase \
        .table("users") \
        .update({"linked_vehicle_count": new_count}) \
        .eq("id", user_id) \
        .execute()
