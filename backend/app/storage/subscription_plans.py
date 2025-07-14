# backend/app/storage/subscription_plans.py

from app.lib.supabase import get_supabase_admin_client
from app.logger import logger

supabase = get_supabase_admin_client()

async def get_plan_by_price_id(price_id: str) -> dict | None:
    """
    Retrieves a subscription plan or one-time product from the database
    using its Stripe Price ID.

    Args:
        price_id: The stripe_price_id of the plan to retrieve.

    Returns:
        A dictionary representing the plan, or None if not found.
    """
    try:
        response = supabase.table("subscription_plans") \
            .select("*") \
            .eq("stripe_price_id", price_id) \
            .maybe_single() \
            .execute()

        if not response.data:
            logger.warning(f"[⚠️] No subscription plan found with price_id: {price_id}")
            return None

        return response.data
    except Exception as e:
        logger.error(f"[❌ get_plan_by_price_id] Error fetching plan for price_id {price_id}: {e}")
        return None
