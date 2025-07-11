import logging

from app.services.brevo import add_to_segment, remove_from_segment
from app.storage.user import get_onboarding_status

logger = logging.getLogger(__name__)

# Segment IDs from Brevo – replace with actual IDs
SEGMENTS = {
    "missing_vehicle": 1,
    "missing_api_key": 2,
    "missing_ha": 3,
    "using_legacy": 4
}

async def run_onboarding_cron():
    """Runs the onboarding cron job to assign users to appropriate Brevo segments based on their progress."""
    users = await get_onboarding_status()

    for user in users:
        user_id = user["id"]
        email = user["email"]

        has_linked_vehicle = user.get("has_linked_vehicle")
        has_api_key = user.get("has_api_key")
        has_ha = user.get("has_ha")
        uses_legacy = user.get("uses_legacy_api")

        # 1. Missing vehicle
        if not has_linked_vehicle:
            await assign_segment(email, SEGMENTS["missing_vehicle"], exclude=[SEGMENTS["missing_api_key"], SEGMENTS["missing_ha"], SEGMENTS["using_legacy"]])
            continue

        # 2. Missing API key
        if not has_api_key:
            await assign_segment(email, SEGMENTS["missing_api_key"], exclude=[SEGMENTS["missing_ha"], SEGMENTS["using_legacy"]])
            continue

        # 3. Missing HA integration
        if not has_ha:
            await assign_segment(email, SEGMENTS["missing_ha"], exclude=[SEGMENTS["using_legacy"]])
            continue

        # 4. Using legacy API
        if uses_legacy:
            await assign_segment(email, SEGMENTS["using_legacy"])
            continue

        # ✅ All clear – remove from all segments
        for seg_id in SEGMENTS.values():
            await remove_from_segment(email, seg_id)

async def assign_segment(email: str, target_segment: int, exclude: list[int] = []):
    """Assigns a contact to a target Brevo segment and removes them from specified exclusion segments."""
    try:
        await add_to_segment(email, target_segment)
        for seg_id in exclude:
            await remove_from_segment(email, seg_id)
        logger.info(f"[✅] Updated segments for {email}")
    except Exception as e:
        logger.warning(f"[⚠️] Failed updating segments for {email}: {e}")