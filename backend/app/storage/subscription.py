import logging
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field
from app.lib.supabase import get_supabase_admin_client
from app.storage.user import get_user_id_by_stripe_customer_id

# Initialize Supabase admin client
supabase = get_supabase_admin_client()
logger = logging.getLogger(__name__)

class DBSubscription(BaseModel):
    """Represents a subscription record stored in the database."""
    id: str
    subscription_id: str = Field(..., alias="stripe_subscription_id") # Maps to Stripe ID
    user_id: str
    stripe_customer_id: str
    status: str
    plan_name: str # Or a `price_id`
    price_id: str # The Stripe Price ID that the subscription uses
    current_period_start: datetime
    current_period_end: datetime # Important for us now
    latest_invoice: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        populate_by_name = True


def to_iso(ts):
    from datetime import datetime, timezone
    if not ts:
        return None
    try:
        return datetime.fromtimestamp(ts, timezone.utc).isoformat()
    except Exception as e:
        logger.warning(f"Could not convert timestamp {ts}: {e}")
        return None

async def extract_subscription_fields(sub, user_id=None):
    """
    Extracts and normalizes subscription fields from a Stripe subscription object.
    """
    if hasattr(sub, "metadata") and sub.metadata:
        user_id = sub.metadata.get("user_id")
    elif isinstance(sub.get("metadata"), dict):
        user_id = sub.get("metadata").get("user_id")
    # If user_id is missing, look up via Stripe customer if possible
    if not user_id and sub.get("customer"):
        user_id = await get_user_id_by_stripe_customer_id(sub.get("customer"))

    # Get the first item (it is always the active product/price)
    items = sub.get("items", {}).get("data", [])
    period_start = period_end = None
    plan_name = price_id = None
    if items and len(items) > 0:
        first = items[0]
        period_start = first.get("current_period_start")
        period_end = first.get("current_period_end")
        # Plan/price info
        plan_name = (
            first.get("plan", {}).get("nickname") or
            first.get("plan", {}).get("id") or
            first.get("price", {}).get("id")
        )
        price_id = (
            first.get("plan", {}).get("id") or
            first.get("price", {}).get("id")
        )

    return {
        "subscription_id": sub.get("id"),
        "user_id": user_id,  # If None, consider looking up user via stripe_customer_id if possible!
        "stripe_customer_id": sub.get("customer"),
        "status": sub.get("status"),
        "plan_name": plan_name,
        "price_id": price_id,
        "current_period_start": to_iso(period_start),
        "current_period_end": to_iso(period_end),
        "created_at": to_iso(sub.get("created")),
        "latest_invoice": sub.get("latest_invoice"),
        "metadata": sub.get("metadata", {}),
    }

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
    Updates the linked_vehicle_count for a user in the database.
    """
    supabase \
        .table("users") \
        .update({"linked_vehicle_count": new_count}) \
        .eq("id", user_id) \
        .execute()

async def get_all_subscription_plans() -> list[dict]:
    """
    Fetch all subscription plans from the subscription_plans table.
    Returns a list of dicts, one per plan.
    """
    response = supabase \
        .table("subscription_plans") \
        .select(
            "id",
            "name",
            "description",
            "type",
            "stripe_product_id",
            "stripe_price_id",
            "amount",
            "currency",
            "interval",
            "is_active",
            "created_at",
            "updated_at"
        ) \
        .order("amount", desc=False) \
        .execute()
    return response.data or []

async def get_price_id_map() -> dict:
    """
    Return a dict mapping local plan codes to Stripe price_ids.
    Example: { "pro_monthly": "price_xxx", "sms_50": "price_yyy" }
    """
    response = supabase.table("subscription_plans") \
        .select("code", "stripe_price_id") \
        .eq("is_active", True) \
        .execute()
    rows = response.data or []
    return {row["code"]: row["stripe_price_id"] for row in rows if row["stripe_price_id"]}

async def update_subscription_status(subscription_id: str, status: str):
    """Update the status of a subscription (e.g. 'active', 'canceled')."""
    try:
        result = supabase.table("subscriptions") \
            .update({"status": status}) \
            .eq("subscription_id", subscription_id) \
            .execute()
        logger.info(f"[DB] Updated subscription {subscription_id} to status {status}")
        return result
    except Exception as e:
        logger.error(f"[❌] Failed to update subscription status for {subscription_id}: {e}")
        raise

async def upsert_subscription_from_stripe(sub, user_id=None):
    """Inserts or updates a subscription record in the database based on a Stripe subscription object."""
    supabase = get_supabase_admin_client()
    # 1. Extract all fields
    data = await extract_subscription_fields(sub, user_id)
    if not data:
        logger.error("[❌] Subscription upsert: No data extracted!")
        return False

    # 2. Check if subscription_id exists
    subscription_id = data.get("subscription_id")
    if not subscription_id:
        logger.error("[❌] Subscription upsert: subscription_id missing!")
        return False

    # 3. Does the subscription already exist?
    result = supabase.table("subscriptions").select("id").eq("subscription_id", subscription_id).execute()
    logger.info(f"[🔎] Subscription upsert: select result: {result.data if hasattr(result, 'data') else result}")
    exists = result and hasattr(result, "data") and result.data and len(result.data) > 0

    if exists:
        update_result = supabase.table("subscriptions").update(data).eq("subscription_id", subscription_id).execute()
        logger.info(f"[📝] Subscription {subscription_id} updated: {getattr(update_result, 'data', update_result)}")
    else:
        insert_result = supabase.table("subscriptions").insert(data).execute()
        logger.info(f"[➕] Subscription {subscription_id} inserted: {getattr(insert_result, 'data', insert_result)}")

    return True

async def get_user_subscription(user_id: str) -> dict | None:
    """Retrieves a single subscription record for a given user ID."""
    supabase = get_supabase_admin_client()
    res = supabase.table("subscriptions").select("*").eq("user_id", user_id).maybe_single().execute()
    return res.data if hasattr(res, "data") else None

async def get_subscription_by_stripe_id(stripe_subscription_id: str) -> Optional[DBSubscription]:
    """
    Retrieves a subscription record from the local database using the Stripe Subscription ID.
    """
    try:
        response = supabase.table("subscriptions") \
            .select("*, current_period_start, current_period_end") \
            .eq("subscription_id", stripe_subscription_id) \
            .single()  \
            .execute()
        
        if response.data:
            # Check if it's a datetime object and convert if needed
            # Supabase Python SDK can sometimes return strings, then conversion is needed
            if isinstance(response.data.get("current_period_start"), str):
                response.data["current_period_start"] = datetime.fromisoformat(response.data["current_period_start"].replace('Z', '+00:00'))
            if isinstance(response.data.get("current_period_end"), str):
                response.data["current_period_end"] = datetime.fromisoformat(response.data["current_period_end"].replace('Z', '+00:00'))

            return DBSubscription(**response.data)
        logger.warning(f"No local subscription found for Stripe ID: {stripe_subscription_id}")
        return None
    except Exception as e:
        logger.error(f"Failed to retrieve local subscription for Stripe ID {stripe_subscription_id}: {e}", exc_info=True)
        return None

async def get_all_subscriptions() -> list[dict]:
    """
    Fetches all subscriptions from the database, ordered by creation date.
    """
    try:
        res = supabase.table("subscriptions").select("*").order("created_at", desc=True).execute()
        return res.data if hasattr(res, "data") else []
    except Exception as e:
        logger.error(f"[❌ get_all_subscriptions] {e}")
        return []

async def count_subscriptions_by_plan(plan_name: str) -> int:
    """
    Counts the number of active subscriptions for a given plan name.
    """
    try:
        res = supabase.table("subscriptions").select("id", count="exact") \
            .eq("plan_name", plan_name) \
            .eq("status", "active") \
            .execute()
        return res.count
    except Exception as e:
        logger.error(f"[❌ count_subscriptions_by_plan] {e}")
        return 0

async def count_users_on_trial() -> int:
    """
    Counts the number of users currently on a trial period.
    """
    try:
        res = supabase.table("users").select("id", count="exact") \
            .eq("is_on_trial", True) \
            .execute()
        return res.count
    except Exception as e:
        logger.error(f"[❌ count_users_on_trial] {e}")
        return 0