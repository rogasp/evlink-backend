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
    Includes 'is_subscribed' in the selected fields.
    """
    try:
        response = supabase.table("users") \
            .select("id, email, role, name, notify_offline, is_subscribed") \
            .eq("id", user_id) \
            .maybe_single() \
            .execute()

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
    """
    Update the `is_subscribed` flag for a given user by email.
    Returns the updated user record as a dict.
    Raises on failure.
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
    