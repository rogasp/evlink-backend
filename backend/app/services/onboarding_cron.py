from app.services.brevo import add_to_segment, remove_from_segment
from app.storage.user import get_onboarding_status
from app.logger import log_info, log_warn

# Segment ID:n från Brevo – ersätt med faktiska ID:n
SEGMENTS = {
    "missing_vehicle": 1,
    "missing_api_key": 2,
    "missing_ha": 3,
    "using_legacy": 4
}

async def run_onboarding_cron():
    users = await get_onboarding_status()

    for user in users:
        user_id = user["id"]
        email = user["email"]

        has_linked_vehicle = user.get("has_linked_vehicle")
        has_api_key = user.get("has_api_key")
        has_ha = user.get("has_ha")
        uses_legacy = user.get("uses_legacy_api")

        # 1. Saknar fordon
        if not has_linked_vehicle:
            await assign_segment(user_id, email, SEGMENTS["missing_vehicle"], exclude=[SEGMENTS["missing_api_key"], SEGMENTS["missing_ha"], SEGMENTS["using_legacy"]])
            continue

        # 2. Saknar API-nyckel
        if not has_api_key:
            await assign_segment(user_id, email, SEGMENTS["missing_api_key"], exclude=[SEGMENTS["missing_ha"], SEGMENTS["using_legacy"]])
            continue

        # 3. Saknar HA-integration
        if not has_ha:
            await assign_segment(user_id, email, SEGMENTS["missing_ha"], exclude=[SEGMENTS["using_legacy"]])
            continue

        # 4. Använder legacy API
        if uses_legacy:
            await assign_segment(user_id, email, SEGMENTS["using_legacy"])
            continue

        # ✅ Klar – ta bort från alla segment
        for seg_id in SEGMENTS.values():
            await remove_from_segment(email, seg_id)

async def assign_segment(user_id: str, email: str, target_segment: int, exclude: list[int] = []):
    try:
        await add_to_segment(email, target_segment)
        for seg_id in exclude:
            await remove_from_segment(email, seg_id)
        log_info(f"[✅] Updated segments for {email}")
    except Exception as e:
        log_warn(f"[⚠️] Failed updating segments for {email}: {e}")
