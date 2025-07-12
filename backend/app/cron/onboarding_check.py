# 📄 backend/app/cron/onboarding_check.py

import asyncio
import logging
from app.lib.supabase import get_supabase_admin_client
from app.services.brevo import set_onboarding_step

logger = logging.getLogger(__name__)

async def run_missing_vehicle_check():
    """Checks for users who have not yet linked a vehicle and updates their onboarding status."""
    client = get_supabase_admin_client()

    # Fetch all users
    response = client.table("users").select("id, email, name").execute()
    all_users = response.data

    # Fetch all users who have linked vehicles
    linked_response = client.table("vehicles").select("user_id").execute()
    linked_ids = {row["user_id"] for row in linked_response.data}

    for user in all_users:
        if user["id"] not in linked_ids:
            logger.info(f"🟡 Missing vehicle: {user['email']}")
            await set_onboarding_step(user["email"], "missing_vehicle")

if __name__ == "__main__":
    asyncio.run(run_missing_vehicle_check())
