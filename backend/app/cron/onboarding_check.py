# 📄 backend/app/cron/onboarding_check.py

import asyncio
from app.lib.supabase import get_supabase_admin_client
from app.services.brevo import set_onboarding_step

async def run_missing_vehicle_check():
    client = get_supabase_admin_client()

    # Hämta alla användare
    response = client.table("users").select("id, email, name").execute()
    all_users = response.data

    # Hämta alla användare som har fordon
    linked_response = client.table("vehicles").select("user_id").execute()
    linked_ids = {row["user_id"] for row in linked_response.data}

    for user in all_users:
        if user["id"] not in linked_ids:
            print(f"🟡 Missing vehicle: {user['email']}")
            await set_onboarding_step(user["email"], "missing_vehicle")

if __name__ == "__main__":
    asyncio.run(run_missing_vehicle_check())
