from app.lib.supabase import get_supabase_admin_client

supabase = get_supabase_admin_client()

async def get_vehicle_by_id_and_user_id(vehicle_id: str, user_id: str):
    """
    Fetches a vehicle record by its ID and associated user ID.
    """
    resp = supabase.table("vehicles").select("*").eq("id", vehicle_id).eq("user_id", user_id).maybe_single().execute()
    return resp.data
