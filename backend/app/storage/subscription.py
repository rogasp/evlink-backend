# backend/app/storage/subscription.py
import logging
from datetime import datetime
from app.lib.supabase import get_supabase_admin_client

# Initialize Supabase admin client
supabase = get_supabase_admin_client()
logger = logging.getLogger(__name__)

def to_iso(ts):
    """Convert UNIX timestamp (eller ISO) till ISO8601-tid med UTC."""
    if not ts:
        return None
    try:
        if isinstance(ts, int) or ts.isdigit():
            return datetime.fromtimestamp(int(ts), tz=timezone.utc).isoformat()
        elif isinstance(ts, float):
            return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()
        elif isinstance(ts, str):
            # Redan ISO-format?
            return ts
    except Exception as e:
        logger.warning(f"Could not convert timestamp {ts}: {e}")
        return None

def extract_subscription_fields(sub, user_id=None):
    """
    Extract and normalize fields from a Stripe subscription object.
    """
    stripe_customer_id = sub.get("customer")
    if not user_id and stripe_customer_id:
        # Hämta user_id från users-tabellen (Supabase)
        user = supabase.table("users").select("id").eq("stripe_customer_id", stripe_customer_id).maybe_single().execute()
        if user and getattr(user, "data", None):
            user_id = user.data.get("id")

    items = sub.get("items", {}).get("data", [])
    plan_name = None
    price_id = None
    if items:
        plan = items[0].get("plan", {})
        plan_name = plan.get("nickname") or plan.get("id")
        price_id = plan.get("id")
    else:
        plan = sub.get("plan", {})
        plan_name = plan.get("nickname") or plan.get("id")
        price_id = plan.get("id")

    return {
        "subscription_id": sub.get("id"),
        "user_id": user_id,
        "stripe_customer_id": sub.get("customer"),
        "status": sub.get("status"),
        "plan_name": plan_name,
        "price_id": price_id,
        "current_period_start": to_iso(sub.get("current_period_start")),
        "current_period_end": to_iso(sub.get("current_period_end")),
        "latest_invoice": sub.get("latest_invoice"),
        "metadata": sub.get("metadata") if sub.get("metadata") else {},
        "created_at": to_iso(sub.get("created")),
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
    Update the linked_vehicle_count for a user.
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
    Return a dict mapping local plan keys (name or type) to Stripe price_id.
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
            .eq("stripe_subscription_id", subscription_id) \
            .execute()
        logger.info(f"[DB] Updated subscription {subscription_id} to status {status}")
        return result
    except Exception as e:
        logger.error(f"[❌] Failed to update subscription status for {subscription_id}: {e}")
        raise

async def upsert_subscription_from_stripe(sub, user_id=None):
    """
    Upsert a Stripe subscription event into the subscriptions table.
    """
    data = extract_subscription_fields(sub, user_id)
    if not data:
        logger.error("[❌] Subscription upsert: No data extracted!")
        return

    subscription_id = data.get("subscription_id")
    if not subscription_id:
        logger.error("[❌] Subscription upsert: subscription_id missing!")
        return

    try:
        # Kolla om subscription finns redan
        result = supabase.table("subscriptions").select("id").eq("subscription_id", subscription_id).execute()
        logger.info(f"[🔎] Subscription upsert: select result: {result.data if hasattr(result, 'data') else result}")
        exists = result and hasattr(result, "data") and result.data and len(result.data) > 0

        if exists:
            update_result = supabase.table("subscriptions").update(data).eq("subscription_id", subscription_id).execute()
            logger.info(f"[📝] Subscription {subscription_id} updated: {update_result.data if hasattr(update_result, 'data') else update_result}")
        else:
            insert_result = supabase.table("subscriptions").insert(data).execute()
            logger.info(f"[➕] Subscription {subscription_id} inserted: {insert_result.data if hasattr(insert_result, 'data') else insert_result}")
    except Exception as e:
        logger.error(f"[❌] Subscription upsert failed for {subscription_id}: {e}")

    return True
