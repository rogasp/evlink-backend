# backend/app/storage/user.py
from app.lib.supabase import get_supabase_admin_client
from app.enode.user import get_all_users as get_enode_users
import asyncio

from app.models.user import User

supabase = get_supabase_admin_client()

async def get_all_users_with_enode_info():
    
    try:
        print("🔎 Fetching Supabase users...")
        res = supabase.table("users").select("id, email, name, role, is_approved").limit(1000).execute()
        users = res.data or []
        print(f"ℹ️ Found {len(users)} users in Supabase")

        print("🔄 Fetching Enode users...")
        enode_data = await get_enode_users()
        enode_users = enode_data.get("data", [])
        enode_lookup = {u["id"]: u for u in enode_users}
        print(f"ℹ️ Found {len(enode_users)} users in Enode")

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
        print(f"[❌ get_all_users_with_enode_info] {e}")
        return []

async def set_user_approval(user_id: str, is_approved: bool) -> None:
    try:
        result = supabase.table("users") \
            .update({"is_approved": is_approved}) \
            .eq("id", user_id) \
            .execute()

        if not result.data:
            raise Exception("No rows were updated")

    except Exception as e:
        print(f"[❌ set_user_approval] {e}")
        raise

async def get_user_approved_status(user_id: str) -> bool:
    result = supabase.table("users").select("is_approved").eq("id", user_id).maybe_single().execute()
    if not result.data:
        return False
    return result.data.get("is_approved", False)

async def get_user_by_id(user_id: str) -> User | None:
    response = supabase.table("users") \
        .select("id, email, role") \
        .eq("id", user_id) \
        .maybe_single() \
        .execute()

    row = response.data
    if not row:
        return None

    return User(**row)

