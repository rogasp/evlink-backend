# backend/app/storage/vendor.py

from app.storage.db import supabase

def save_linked_vendor(user_id: str, vendor: str):
    """
    Save or update a linked vendor for the user.
    """
    data = {
        "user_id": user_id,
        "vendor": vendor
    }

    # UPSERT via insert → on conflict do update
    supabase.table("linked_vendors").upsert(data).execute()
    print(f"🔗 Linked vendor saved: {user_id} → {vendor}")

def get_linked_vendors(user_id: str) -> list[str]:
    """
    Return all vendor codes linked to a given user.
    """
    res = supabase.table("linked_vendors").select("vendor").eq("user_id", user_id).execute()
    return [row["vendor"] for row in res.data] if res.data else []
