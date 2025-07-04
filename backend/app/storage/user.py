# backend/app/storage/user.py

import os
from supabase import create_client, Client
from app.lib.supabase import get_supabase_admin_client
from app.enode.user import get_all_users as get_enode_users
from app.models.user import User
from app.logger import logger

# -------------------------------------------------------------------
# Initialize Supabase admin client (service role key) from `app/lib/supabase.py`
# -------------------------------------------------------------------
supabase: Client = get_supabase_admin_client()

# -------------------------------------------------------------------
# ORIGINAL FUNCTIONS (restored in full)
# -------------------------------------------------------------------

async def get_all_users_with_enode_info():
    """
    Fetch all users from Supabase and enrich them with Enode info.
    """
    try:
        logger.info("🔎 Fetching Supabase users...")
        res = supabase.table("users").select("id, email, name, role, is_approved").limit(1000).execute()
        users = res.data or []
        logger.info(f"ℹ️ Found {len(users)} users in Supabase")

        logger.info("🔄 Fetching Enode users...")
        enode_data = await get_enode_users()
        enode_users = enode_data.get("data", [])
        enode_lookup = {u["id"]: u for u in enode_users}
        logger.info(f"ℹ️ Found {len(enode_users)} users in Enode")

        enriched = []
        for user in users:
            uid = user["id"]
            enode_match = enode_lookup.get(uid)

            enriched.append({
                "id": uid,
                "full_name": user.get("name"),
                "email": user.get("email"),
                "is_admin": user.get("role") == "admin",
                "linked_to_enode": enode_match is not None,
                "linked_at": enode_match.get("createdAt") if enode_match else None,
                "is_approved": user.get("is_approved"),
            })

        return enriched
    except Exception as e:
        logger.error(f"[❌ get_all_users_with_enode_info] {e}")
        return []

async def set_user_approval(user_id: str, is_approved: bool) -> None:
    """
    Update the `is_approved` column for a given user.
    """
    try:
        result = supabase.table("users") \
            .update({"is_approved": is_approved}) \
            .eq("id", user_id) \
            .execute()

        if not result.data:
            raise Exception("No rows were updated")
        logger.info(f"✅ Updated is_approved={is_approved} for user_id={user_id}")
    except Exception as e:
        logger.error(f"[❌ set_user_approval] {e}")
        raise

async def get_user_approved_status(user_id: str) -> bool:
    """
    Return the `is_approved` status for a given user ID.
    """
    try:
        result = supabase.table("users").select("is_approved").eq("id", user_id).maybe_single().execute()
        if not result.data:
            return False
        return result.data.get("is_approved", False)
    except Exception as e:
        logger.error(f"[❌ get_user_approved_status] {e}")
        return False

async def get_user_accepted_terms(user_id: str) -> bool:
    """
    Return the `accepted_terms` status for a given user ID.
    """
    try:
        result = supabase.table("users").select("accepted_terms").eq("id", user_id).maybe_single().execute()
        if not result.data:
            return False
        return result.data.get("accepted_terms", False)
    except Exception as e:
        logger.error(f"[❌ get_user_accepted_terms] {e}")
        return False

async def get_user_by_id(user_id: str) -> User | None:
    """
    Fetch a single user by ID. Returns an instance of `User` model or None.
    """
    try:
        response = supabase.table("users") \
            .select("id, email, role, name, notify_offline, stripe_customer_id, tier, sms_credits") \
            .eq("id", user_id) \
            .maybe_single() \
            .execute()

        print(f"Response data: {response.data}")  # Debugging line

        row = response.data
        if not row:
            logger.info(f"[ℹ️] No user found with id={user_id}")
            return None

        user = User(**row)
        logger.info(f"✅ Retrieved user by ID: {user_id}")
        return user
    except Exception as e:
        logger.error(f"[❌ get_user_by_id] {e}")
        return None

async def update_user_stripe_id(user_id: str, stripe_customer_id: str) -> None:
    """
    Update the `stripe_customer_id` column for a given user.
    """
    try:
        result = supabase.table("users") \
            .update({"stripe_customer_id": stripe_customer_id}) \
            .eq("id", user_id) \
            .execute()

        if not result.data:
            raise Exception("No rows were updated for stripe_customer_id")
        logger.info(f"✅ Updated stripe_customer_id={stripe_customer_id} for user_id={user_id}")
    except Exception as e:
        logger.error(f"[❌ update_user_stripe_id] {e}")
        raise

async def is_subscriber(user_id: str) -> bool:
    """Return True if the user has `is_newsletter` flag set in interest."""
    try:
        result = (
            supabase.table("interest")
            .select("is_newsletter")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if not result or not result.data:
            return False
        return bool(result.data.get("is_newsletter"))
    except Exception as e:
        logger.error(f"[❌ is_newsletter] {e}")
        return False

async def get_user_online_status(user_id: str) -> str:
    """
    Determine online/offline/partial status for a given user’s vehicles.
    Returns one of: “green”, “yellow”, “red”, or “grey”.
    """
    try:
        result = supabase.table("vehicles").select("online").eq("user_id", user_id).execute()
        vehicles = result.data or []

        if not vehicles:
            return "grey"

        statuses = [v.get("online") for v in vehicles]

        if all(statuses):
            return "green"
        elif any(statuses) and any(s is False for s in statuses):
            return "yellow"
        elif all(s is False for s in statuses):
            return "red"
        else:
            return "grey"
    except Exception as e:
        logger.error(f"[❌ get_user_online_status] {e}")
        return "grey"

async def update_user_terms(user_id: str, accepted_terms: bool):
    """
    Update the `accepted_terms` column for a given user.
    """
    try:
        result = supabase.table("users").update({"accepted_terms": accepted_terms}).eq("id", user_id).execute()
        logger.info(f"✅ Updated accepted_terms={accepted_terms} for user_id={user_id}")
        return result
    except Exception as e:
        logger.error(f"[❌ update_user_terms] {e}")
        raise

async def update_notify_offline(user_id: str, notify_offline: bool):
    """
    Update the `notify_offline` column for a given user.
    """
    try:
        result = supabase.table("users") \
            .update({"notify_offline": notify_offline}) \
            .eq("id", user_id) \
            .execute()
        logger.info(f"✅ Updated notify_offline={notify_offline} for user_id={user_id}")
        return result
    except Exception as e:
        logger.error(f"[❌ update_notify_offline] {e}")
        raise

# -------------------------------------------------------------------
# NEW FUNCTIONS: get_user_by_email & set_user_subscription
# -------------------------------------------------------------------

async def get_user_by_email(email: str) -> dict | None:
    """
    Fetch a single user by email from Supabase.
    Returns a dict with user fields, or None if not found.
    """
    try:
        response = supabase.table("users") \
            .select("id, email, name, role, is_approved, is_subscribed") \
            .eq("email", email) \
            .maybe_single() \
            .execute()

        if not response.data:
            logger.info(f"[ℹ️] No user found with email={email}")
            return None

        logger.info(f"✅ Retrieved user by email: {email}")
        return response.data
    except Exception as e:
        logger.error(f"[❌ get_user_by_email] {e}")
        return None

async def set_user_subscription(email: str, is_subscribed: bool) -> dict:
    """DEPRECATED: use :func:`app.storage.newsletter.set_subscriber` instead.

    Update the ``is_subscribed`` flag for a given user by email and return the
    updated user record. Raises on failure.
    """
    try:
        # 1) Perform the update
        _ = supabase.table("users") \
            .update({"is_subscribed": is_subscribed}) \
            .eq("email", email) \
            .execute()

        # 2) Fetch the updated row separately
        select_resp = supabase.table("users") \
            .select("id, email, name, role, is_approved, is_subscribed") \
            .eq("email", email) \
            .maybe_single() \
            .execute()

        if not select_resp.data:
            raise Exception("Failed to fetch updated user after setting subscription")

        updated_data = select_resp.data
        logger.info(f"✅ Set is_subscribed={is_subscribed} for user with email={email}")
        return updated_data

    except Exception as e:
        logger.error(f"[❌ set_user_subscription] {e}")
        raise
    
# backend/app/storage/user.py

async def update_user_subscription(
    user_id: str,
    tier: str,
    status: str = "active",
) -> None:
    """
    Uppdatera användarens prenumerationstyp och status i Supabase.
    - tier: t.ex. "free", "pro", "fleet"
    - status: "active", "canceled", "past_due" osv.
    """
    try:
        resp = (
            supabase.table("users")
            .update({"tier": tier, "subscription_status": status})
            .eq("id", user_id)
            .execute()
        )
        # Kontrollera att någon rad uppdaterades
        if not resp.data:
            raise Exception(f"No rows updated for user {user_id}")
        logger.info(
            f"✅ Updated subscription for user {user_id}: tier={tier}, status={status}"
        )
    except Exception as e:
        logger.error(f"[❌ update_user_subscription] {e}")
        raise
    
async def add_user_sms_credits(user_id: str, credits: int) -> None:
    """
    Addera SMS‐krediter till användarens saldo i en kolumn `sms_credits`.
    """
    from app.lib.supabase import get_supabase_admin_client
    supabase = get_supabase_admin_client()

    # Läs nuvarande kredit
    resp = supabase \
        .table("users") \
        .select("sms_credits") \
        .eq("id", user_id) \
        .maybe_single() \
        .execute()
    current = resp.data.get("sms_credits", 0) if resp.data else 0

    # Uppdatera med nya credits
    supabase \
        .table("users") \
        .update({"sms_credits": current + credits}) \
        .eq("id", user_id) \
        .execute()

async def get_onboarding_status(user_id: str) -> dict | None:
    try:
        result = supabase.table("onboarding_progress") \
            .select("*") \
            .eq("user_id", user_id) \
            .maybe_single() \
            .execute()

        if result.data:
            return result.data
        return None
    except Exception as e:
        print(f"[❌ get_onboarding_status] {e}")
        return None
    
async def set_welcome_sent_if_needed(user_id: str) -> None:
    try:
        supabase.table("onboarding_progress") \
            .update({"welcome_sent": True}) \
            .eq("user_id", user_id) \
            .execute()
    except Exception as e:
        print(f"[❌ set_welcome_sent_if_needed] {e}")

async def create_onboarding_row(user_id: str) -> dict | None:
    """
    Creates a default onboarding_progress row for the given user.
    Returns the inserted row as dict, or None on failure.
    """
    try:
        result = supabase.table("onboarding_progress").insert({
            "user_id": user_id
        }).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]
        return None

    except Exception as e:
        print(f"[❌ create_onboarding_row] {e}")
        return None

def set_ha_webhook_settings(user_id: str, webhook_id: str, external_url: str) -> bool:
    """Spara Home Assistant webhook-inställningar för en användare."""
    try:
        result = supabase.table("users") \
            .update({"ha_webhook_id": webhook_id, "ha_external_url": external_url}) \
            .eq("id", user_id) \
            .execute()
        return result.status_code == 204
    except Exception as e:
        print(f"[❌ set_ha_webhook_settings] {e}")
        return False

def get_ha_webhook_settings(user_id: str) -> dict | None:
    """Hämta Home Assistant webhook-inställningar för en användare."""
    try:
        result = supabase.table("users") \
            .select("ha_webhook_id, ha_external_url") \
            .eq("id", user_id) \
            .maybe_single() \
            .execute()

        if result.data:
            return {
                "ha_webhook_id": result.data.get("ha_webhook_id"),
                "ha_external_url": result.data.get("ha_external_url"),
            }
        return None
    except Exception as e:
        print(f"[❌ get_ha_webhook_settings] {e}")
        return None

async def update_user_subscription(user_id: str, tier: str, status: str = "active"):
    """Update the user's tier (e.g. 'free', 'basic', 'pro') and status (e.g. 'active', 'canceled')."""
    try:
        result = supabase.table("users") \
            .update({"tier": tier, "subscription_status": status}) \
            .eq("id", user_id) \
            .execute()
        logger.info(f"[DB] Updated user {user_id} to tier {tier}, status {status}")
        return result
    except Exception as e:
        logger.error(f"[❌] Failed to update user {user_id} subscription: {e}")
        raise

async def remove_stripe_customer_id(user_id: str):
    """Set stripe_customer_id to NULL for a given user."""
    try:
        result = supabase.table("users") \
            .update({"stripe_customer_id": None}) \
            .eq("id", user_id) \
            .execute()
        logger.info(f"[DB] Removed stripe_customer_id for user {user_id}")
        return result
    except Exception as e:
        logger.error(f"[❌] Failed to remove stripe_customer_id for user {user_id}: {e}")
        raise

async def get_user_id_by_stripe_customer_id(stripe_customer_id):
    supabase = get_supabase_admin_client()
    result = supabase.table("users").select("id").eq("stripe_customer_id", stripe_customer_id).execute()
    if result and hasattr(result, "data") and result.data:
        return result.data[0]["id"]
    return None
