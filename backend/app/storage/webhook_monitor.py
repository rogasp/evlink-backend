from app.storage.settings import get_setting_by_name
from app.storage.status_logs import log_status
from app.storage.webhook import sync_webhook_subscriptions_from_enode
from app.lib.supabase import get_supabase_admin_client
from app.enode.auth import get_access_token
from app.config import ENODE_BASE_URL

from datetime import datetime, timedelta, timezone
import httpx

supabase = get_supabase_admin_client()

async def monitor_webhook_health():
    print("[🔍] Starting webhook health monitor")

    # 1. Synka med Enode → Supabase
    print("[🔄] Syncing webhook subscriptions from Enode...")
    await sync_webhook_subscriptions_from_enode()
    print("[✅] Sync complete")
    result = supabase.table("webhook_subscriptions").select("*").execute()
    subscriptions = result.data or []
    inactive = [s for s in subscriptions if not s.get("is_active")]

    if inactive:
        print(f"[⚠️] {len(inactive)} inactive subscriptions detected after sync")
        await log_status("webhook_incoming", False, f"{len(inactive)} inactive after sync")
    else:
        print("[✅] All subscriptions are active after sync")
        await log_status("webhook_incoming", True, "All active after sync")

    # 2. Läs inställningar
    enabled_setting = await get_setting_by_name("webhook.monitor.enabled")
    if not enabled_setting or enabled_setting.get("value") != "true":
        print("[ℹ️] Monitoring is disabled via setting → Exiting")
        return

    try:
        max_minutes_setting = await get_setting_by_name("webhook.monitor.max_failed_minutes")
        max_minutes = int(max_minutes_setting.get("value", "720"))
    except Exception as e:
        print(f"[⚠️] Failed to read max_failed_minutes → Defaulting to 720: {e}")
        max_minutes = 720

    auto_reactivate_setting = await get_setting_by_name("webhook.monitor.auto_reactivate")
    auto_test = auto_reactivate_setting and auto_reactivate_setting.get("value") == "true"

    print(f"[⚙️] max_failed_minutes: {max_minutes}")
    print(f"[⚙️] auto_reactivate: {auto_test}")

    # 3. Läs aktuella subscriptions
    result = supabase.table("webhook_subscriptions").select("*").execute()
    subscriptions = result.data or []

    print(f"[📋] Checking {len(subscriptions)} webhook(s)...")

    now = datetime.now(timezone.utc)
    threshold = now - timedelta(minutes=max_minutes)
    inactive_count = 0

    for sub in subscriptions:
        sub_id = sub.get("enode_webhook_id")
        last_success = sub.get("last_success")
        is_active = sub.get("is_active", False)

        print(f"\n🔎 Checking webhook {sub_id}")
        print(f"     is_active: {is_active}")
        print(f"     last_success: {last_success}")

        if not last_success:
            print("     Skipping: no last_success value")
            continue

        try:
            last_success_dt = datetime.fromisoformat(last_success.replace("Z", "+00:00"))
        except Exception as e:
            print(f"[⚠️] Failed to parse last_success for {sub_id}: {e}")
            continue

        if not is_active or last_success_dt < threshold:
            print(f"[🚨] Webhook {sub_id} is inactive or last_success too old")
            inactive_count += 1

            if auto_test:
                print(f"[🔁] Sending test webhook to {sub_id}...")
                await test_enode_webhook(sub_id)
        else:
            print("     ✅ Webhook is healthy")

    print(f"\n[✅] Monitoring done. Inactive or outdated: {inactive_count}/{len(subscriptions)}")


async def test_enode_webhook(webhook_id: str):
    token = await get_access_token()
    url = f"{ENODE_BASE_URL}/webhooks/{webhook_id}/test"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(url, headers=headers)
            print(f"[📡] Test result {webhook_id}: {res.status_code} {res.text[:100]}")
            return res
    except Exception as e:
        print(f"[❌] Failed to send test webhook to {webhook_id}: {e}")
