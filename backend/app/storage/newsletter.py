# backend/app/storage/newsletter.py

import uuid
from datetime import datetime, timedelta, timezone
import logging

from app.lib.supabase import get_supabase_admin_client

logger = logging.getLogger(__name__)
supabase = get_supabase_admin_client()

VERIFICATION_CODE_TTL_HOURS = 48  # Adjust if you want a shorter/longer expiry


async def create_newsletter_request(email: str, name: str | None = None):
    """
    Create or update a row in `interest` for a newsletter request:
      1. Generate a random verification code.
      2. Set `newsletter_verified = False`.
      3. Set `is_newsletter = False` (until they click the link).
      4. Set `newsletter_verification_code` and `newsletter_code_expires_at`.

    If an entry with the same email already exists:
      - Update that row’s `name`, `newsletter_verification_code`, and `newsletter_code_expires_at`.
      - Keep other flags (e.g. contacted, user_id) as they were.

    Returns the inserted or updated row(s) from Supabase.
    """
    email = email.strip().lower()
    name_to_use = name.strip() if (name and name.strip()) else None

    # 1) Generate a new random UUID‐based code (hex)
    code = uuid.uuid4().hex

    # 2) Compute expiration timestamp (now + TTL)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=VERIFICATION_CODE_TTL_HOURS)

    # 3) Build upsert payload
    payload = {
        "email": email,
        # Use name_to_use if provided, otherwise leave name alone (NULL or existing)
        "name": name_to_use,
        "is_newsletter": False,
        "newsletter_verified": False,
        "newsletter_verification_code": code,
        "newsletter_code_expires_at": expires_at.isoformat(),
        # NOTE: created_at is handled automatically by default
    }

    # 4) Upsert on unique email
    result = supabase.table("interest") \
        .upsert(payload, on_conflict="email") \
        .execute()

    return result.data


async def verify_newsletter_request(code: str):
    """
    Verify a newsletter request by checking the given code:
      1. Find a row in `interest` where:
           - newsletter_verification_code == code
           - newsletter_verified == False
           - newsletter_code_expires_at >= now
      2. If found, set:
           - is_newsletter = True
           - newsletter_verified = True
           - (Optionally) clear newsletter_verification_code and newsletter_code_expires_at
      3. Return the updated row if successful, or raise an error if not found/expired.

    Raises:
      HTTPException(404) if no matching code is found or code has expired.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    # 1) Try to select a single row matching the code and not expired
    result = (
        supabase.table("interest")
        .select("*")
        .eq("newsletter_verification_code", code)
        .eq("newsletter_verified", False)
        .gte("newsletter_code_expires_at", now_iso)
        .maybe_single()
        .execute()
    )

    if not result or not result.data:
        # No row or code expired / already verified
        return None

    row = result.data

    # 2) Update that row: set both flags true, and clear the code fields
    update_payload = {
        "is_newsletter": True,
        "newsletter_verified": True,
        "newsletter_verification_code": None,
        "newsletter_code_expires_at": None
    }

    updated = supabase.table("interest") \
        .update(update_payload) \
        .eq("id", row["id"]) \
        .execute()

    return updated.data  # list with the updated row


async def remove_public_subscriber(email: str):
    """
    “Unsubscribe” a user by setting is_newsletter = false and clearing verified state.

    - If a row with this email exists:
        • set is_newsletter = False
        • set newsletter_verified = False
        • (Optionally) clear newsletter_verification_code & newsletter_code_expires_at
    - If no row exists: return an empty list.

    Returns the updated row(s) or an empty list.
    """
    email = email.strip().lower()

    # 1) Check if a row exists
    existing = supabase.table("interest") \
        .select("id") \
        .eq("email", email) \
        .maybe_single() \
        .execute()

    if not existing.data:
        return []  # Nothing to remove

    # 2) Update that row: clear flags
    update_payload = {
        "is_newsletter": False,
        "newsletter_verified": False,
        "newsletter_verification_code": None,
        "newsletter_code_expires_at": None
    }

    result = supabase.table("interest") \
        .update(update_payload) \
        .eq("email", email) \
        .execute()

    return result.data

async def set_subscriber(email: str, is_subscribed: bool):
    """Upsert a subscriber row and set newsletter flags.

    If a row with ``email`` exists in the ``interest`` table it will be
    updated. Otherwise a new row is inserted. ``is_newsletter`` and
    ``newsletter_verified`` are both set to ``is_subscribed``.

    Returns the inserted/updated row(s) from Supabase.
    """
    email = email.strip().lower()

    payload = {
        "email": email,
        "is_newsletter": is_subscribed,
        "newsletter_verified": is_subscribed,
    }

    result = supabase.table("interest") \
        .upsert(payload, on_conflict="email") \
        .execute()

    return result.data


async def is_subscriber(email: str) -> bool:
    """Return ``True`` if a verified newsletter subscriber exists."""
    email = email.strip().lower()
    result = (
        supabase.table("interest")
        .select("is_newsletter, newsletter_verified")
        .eq("email", email)
        .maybe_single()
        .execute()
    )

    if not result or not result.data:
        return False

    row = result.data

    return bool(row.get("is_newsletter") and row.get("newsletter_verified"))