from app.lib.supabase import get_supabase_admin_client
from datetime import datetime, timezone
import logging

from app.storage.user import get_user_id_by_stripe_customer_id

logger = logging.getLogger(__name__)
supabase = get_supabase_admin_client()

def find_subscription_id(invoice):
    # 1. Direkt på invoice
    sub_id = invoice.get("subscription")
    if sub_id:
        return sub_id
    # 2. I lines
    lines = invoice.get("lines", {}).get("data", [])
    if lines:
        line = lines[0]
        # I Stripe-nya kan det ligga i parent > subscription_item_details
        parent = line.get("parent")
        if parent and isinstance(parent, dict):
            details = parent.get("subscription_item_details")
            if details and isinstance(details, dict):
                sub_id = details.get("subscription")
                if sub_id:
                    return sub_id
    # 3. I parent på root
    parent = invoice.get("parent")
    if parent and isinstance(parent, dict):
        details = parent.get("subscription_details")
        if details and isinstance(details, dict):
            sub_id = details.get("subscription")
            if sub_id:
                return sub_id
    # Not found
    return None

def to_iso(dt):
    if not dt:
        return None
    if isinstance(dt, (int, float)):
        # Stripe skickar ibland epoch (sekunder)
        return datetime.fromtimestamp(dt, tz=timezone.utc).isoformat().replace("+00:00", "Z")
    if isinstance(dt, datetime):
        return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    return str(dt)

async def extract_invoice_fields(invoice, user_id=None):
    subscription_id = find_subscription_id(invoice)
    stripe_customer_id = invoice.get("customer")
    if not user_id:
        user_id = await get_user_id_by_stripe_customer_id(stripe_customer_id)
    # Hosted/PDF/receipt
    hosted_invoice_url = invoice.get("hosted_invoice_url")
    pdf_url = invoice.get("invoice_pdf")
    receipt_number = invoice.get("number")

    # Plan name (första line item)
    lines = invoice.get("lines", {}).get("data", [])
    plan_name = None
    if lines and isinstance(lines, list):
        plan_name = lines[0].get("description")

    # Datumfält
    created_at = to_iso(invoice.get("created"))
    due_date = to_iso(invoice.get("due_date"))
    paid_at = to_iso(invoice.get("status_transitions", {}).get("paid_at"))

    return {
        "invoice_id": invoice.get("id"),
        "user_id": user_id,
        "subscription_id": subscription_id,
        "stripe_customer_id": invoice.get("customer"),
        "stripe_payment_intent_id": invoice.get("payment_intent"),
        "amount_due": invoice.get("amount_due") or invoice.get("total"),
        "currency": invoice.get("currency"),
        "status": invoice.get("status"),
        "hosted_invoice_url": hosted_invoice_url,
        "pdf_url": pdf_url,
        "receipt_number": receipt_number,
        "plan_name": plan_name,
        "due_date": due_date,
        "created_at": created_at,
        "paid_at": paid_at,
        "metadata": invoice.get("metadata"),
    }

async def upsert_invoice_from_stripe(invoice, user_id=None):
    supabase = get_supabase_admin_client()

    # 1. Plocka ut alla fält säkert
    data = await extract_invoice_fields(invoice, user_id)
    if not data:
        logger.error("[❌] Invoice upsert: No data extracted!")
        return

    # 2. Kontrollera så invoice_id finns (Stripe invoice-id)
    invoice_id = data.get("invoice_id")
    if not invoice_id:
        logger.error("[❌] Invoice upsert: invoice_id missing!")
        return

    # 3. Finns invoice redan?
    result = supabase.table("invoices").select("id").eq("invoice_id", invoice_id).execute()
    logger.info(f"[🔎] Invoice upsert: select result: {result}")
    exists = result and hasattr(result, "data") and result.data and len(result.data) > 0

    if exists:
        # Uppdatera befintlig rad
        update_result = supabase.table("invoices").update(data).eq("invoice_id", invoice_id).execute()
        logger.info(f"[📝] Invoice {invoice_id} updated: {update_result}")
    else:
        # Skapa ny rad
        insert_result = supabase.table("invoices").insert(data).execute()
        logger.info(f"[➕] Invoice {invoice_id} inserted: {insert_result}")

    return True

async def get_user_invoices(user_id: str) -> list[dict]:
    supabase = get_supabase_admin_client()
    res = supabase.table("invoices").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return res.data if hasattr(res, "data") else []
