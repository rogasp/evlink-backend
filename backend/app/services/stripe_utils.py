import stripe
import logging
from app.config import STRIPE_SECRET_KEY # OBS: STRIPE_API_VERSION ÄR BORTTAGEN HÄR
from app.lib.supabase import get_supabase_admin_client
from app.storage.subscription import get_price_id_map, get_subscription_by_stripe_id 
import time

logger = logging.getLogger("app.services.stripe_utils")

stripe.api_key = STRIPE_SECRET_KEY
# stripe.api_version = STRIPE_API_VERSION # DENNA RAD ÄR BORTTAGEN
supabase = get_supabase_admin_client()

def extract_price_and_product(data_object: dict):
    if data_object.get("object") == "price":
        price_id = data_object.get("id")
        product_field = data_object.get("product")
        if isinstance(product_field, dict):
            product_id = product_field.get("id")
        else:
            product_id = product_field
        return price_id, product_id
    elif data_object.get("object") == "product":
        return None, data_object.get("id")
    return None, None

async def log_stripe_webhook(event: dict, status: str = "received", error: str = None):
    data_object = event.get("data", {}).get("object", {})
    metadata = data_object.get("metadata", {}) or {}

    user_id = metadata.get("user_id")
    customer_id = data_object.get("customer")
    subscription_id = data_object.get("subscription") or (data_object.get("id") if "subscription" in event.get("type", "") else None)

    price_id, product_id = extract_price_and_product(data_object)

    logger.info(f"[Stripe Log] Event: {event.get('type')}, status: {status}, user_id: {user_id}, customer_id: {customer_id}, sub_id: {subscription_id}, price_id: {price_id}, product_id: {product_id}, error: {error}")

    try:
        supabase.table("stripe_webhook_logs").insert({
            "event_type": event.get("type"),
            "status": status,
            "processed": status == "processed",
            "payload": event,
            "error": error,
            "user_id": user_id,
            "customer_id": customer_id,
            "subscription_id": subscription_id,
            "price_id": price_id,
            "product_id": product_id,
        }).execute()
    except Exception as e:
        logger.error(f"[❌] Failed to log Stripe webhook: {e}")

async def create_stripe_subscription_plan(payload):
    logger.info(f"[Stripe] Creating product: {payload.name}")
    product = stripe.Product.create(
        name=payload.name,
        description=payload.description,
        metadata={"code": payload.code},
        active=True,
    )
    logger.info(f"[Stripe] Creating price for product {product.id}: {payload.amount} {payload.currency} ({payload.type}/{payload.interval})")
    price = stripe.Price.create(
        unit_amount=payload.amount,
        currency=payload.currency,
        product=product.id,
        recurring={"interval": payload.interval} if payload.type == "recurring" else None,
        metadata={"code": payload.code},
        active=True,
    )
    data = {
        "name": payload.name,
        "description": payload.description,
        "type": payload.type,
        "stripe_product_id": product.id,
        "stripe_price_id": price.id,
        "amount": payload.amount,
        "currency": payload.currency,
        "interval": payload.interval if payload.type == "recurring" else None,
        "is_active": True,
        "code": payload.code,
    }
    logger.info(f"[Stripe] Inserting new subscription_plan row to DB: {data}")
    supabase.table("subscription_plans").insert(data).execute()
    return {"product": product, "price": price, "db_row": data}

async def sync_stripe_plans_to_db():
    logger.info("[Stripe] Syncing Stripe plans and prices to database...")
    products = stripe.Product.list(active=True, limit=100)
    prices = stripe.Price.list(active=True, limit=100, expand=["data.product"])

    count_inserted = 0
    count_updated = 0

    for price in prices.auto_paging_iter():
        product = price.product
        stripe_product_id = product["id"]
        stripe_price_id = price["id"]
        code = None
        if hasattr(product, "metadata"):
            code = product["metadata"].get("code")
        if not code:
            code = None  # or autogenerate

        existing = supabase.table("subscription_plans") \
            .select("id") \
            .eq("stripe_price_id", stripe_price_id) \
            .execute()
        data = {
            "name": product["name"],
            "description": product.get("description"),
            "type": "recurring" if price.get("type") == "recurring" else "one_time",
            "stripe_product_id": stripe_product_id,
            "stripe_price_id": stripe_price_id,
            "amount": price["unit_amount"],
            "currency": price["currency"],
            "interval": price["recurring"]["interval"] if price.get("recurring") else None,
            "is_active": product["active"] and price["active"],
            "code": code,
        }
        try:
            if existing.data:
                plan_id = existing.data[0]["id"]
                logger.info(f"[Stripe] Updating subscription_plan id={plan_id} ({stripe_price_id})")
                supabase.table("subscription_plans").update(data).eq("id", plan_id).execute()
                count_updated += 1
            else:
                logger.info(f"[Stripe] Inserting new subscription_plan ({stripe_price_id})")
                supabase.table("subscription_plans").insert(data).execute()
                count_inserted += 1
        except Exception as e:
            logger.error(f"[❌] Failed to sync plan for price_id={stripe_price_id}: {e}")

    logger.info(f"[Stripe] Synced plans: inserted={count_inserted}, updated={count_updated}")
    return {"inserted": count_inserted, "updated": count_updated}

async def change_user_subscription_plan(subscription_obj: stripe.Subscription, new_price_id: str, user_id: str):
    """
    Handles the actual Stripe API call for changing a subscription plan (upgrade or downgrade).
    Receives the initial subscription object.
    """
    subscription_id = subscription_obj.id
    current_item = subscription_obj["items"]["data"][0]
    current_price_id = current_item["price"]["id"]
    current_unit_amount = current_item["price"]["unit_amount"]
    new_price = stripe.Price.retrieve(new_price_id)
    new_unit_amount = new_price["unit_amount"]

    is_upgrade = new_unit_amount > current_unit_amount

    logger.info(f"[Stripe] Current: {current_price_id} ({current_unit_amount}), New: {new_price_id} ({new_unit_amount}), Upgrade: {is_upgrade}")

    # Hämta den interna plan_id (t.ex. "pro_monthly") baserat på new_price_id
    internal_plan_id_for_new_price = None
    price_id_map = await get_price_id_map() 
    for p_id, s_id in price_id_map.items():
        if s_id == new_price_id:
            internal_plan_id_for_new_price = p_id
            break
    if not internal_plan_id_for_new_price:
        logger.warning(f"[Stripe] Could not map new_price_id {new_price_id} to internal plan_id for metadata. Defaulting to new_price_id for plan_id metadata.")
        internal_plan_id_for_new_price = new_price_id # Fallback om ingen match hittas

    # Skapa gemensam metadata som alltid skickas med prenumerationsändringar
    common_metadata = {
        "user_id": user_id, # Detta är Kritiskt för att spåra användaren
        "plan_id": internal_plan_id_for_new_price, # Detta är Kritiskt för att spåra den nya planen
        "changed_by": user_id,
        "change_action": "upgrade" if is_upgrade else "downgrade"
    }

    try:
        if is_upgrade:
            logger.info(f"[⬆️] Upgrading (immediate/prorate)")

            updated_subscription = stripe.Subscription.modify(
                subscription_id,
                items=[{
                    'id': current_item["id"],
                    'price': new_price_id,
                }],
                proration_behavior="always_invoice",
                cancel_at_period_end=False,
                metadata=common_metadata # Använd den gemensamma metadatan här
            )

            logger.info(f"[✅] Subscription upgraded immediately. Subscription ID: {updated_subscription.id}")

            stripe_customer_id = updated_subscription["customer"]
            logger.info(f"[DEBUG_TRACE] After subscription modify, customer ID: {stripe_customer_id}")

            pending_invoice_items = stripe.InvoiceItem.list(
                customer=stripe_customer_id,
                pending=True
            )

            logger.info(f"[DEBUG_TRACE] Before pending_invoice_items.data check.")
            logger.info(f"[DEBUG] Pending invoice items found: {len(pending_invoice_items.data)}")
            for item in pending_invoice_items.data:
                logger.info(f"[DEBUG] Pending item: {item.id}, Amount: {item.amount}, Description: {item.description}")
            logger.info(f"[DEBUG_TRACE] After pending_invoice_items loop.")

            if pending_invoice_items.data:
                logger.info(f"[DEBUG_TRACE] Inside pending_invoice_items.data block.")
                invoice = stripe.Invoice.create(
                    customer=stripe_customer_id,
                    collection_method='charge_automatically',
                    auto_advance=True
                )

                logger.info(f"[🧾] Invoice {invoice.id} created and finalized for upgrade with prorations.")

                if not invoice.paid:
                    logger.info(f"[DEBUG_TRACE] Invoice not paid, attempting payment.")
                    try:
                        invoice.pay()
                        logger.info(f"[✅] Invoice {invoice.id} paid successfully.")
                    except stripe.error.CardError as e:
                        logger.error(f"[❌] Card declined for invoice {invoice.id}: {e.user_message}")
                    except Exception as e:
                        logger.error(f"[❌] Error paying invoice {invoice.id}: {e}")
                else:
                    logger.info(f"[DEBUG_TRACE] Invoice already paid.")
            else:
                logger.info(f"[ℹ️] No pending invoice items found to create an immediate invoice for.")

            logger.info(f"[DEBUG_TRACE] End of upgrade flow.")
            return updated_subscription

        else: # Downgrade logic - Använder den enkla modify-logiken som fungerade i Stripe tidigare
            logger.info(f"[⬇️] Downgrading (at period end - using direct Subscription.modify as per earlier working state)")
            
            # Detta är den exakta kombinationen som du rapporterade resulterade i
            # "Pro i din DB men Basic i Stripe, schemalagd för nästa faktura" tidigare.
            # Vi tar bort alla anrop till current_period_end och Subscription Schedules här,
            # eftersom de orsakade kraschar.

            updated_subscription = stripe.Subscription.modify(
                subscription_id,
                items=[{
                    'id': current_item["id"],
                    'price': new_price_id,
                }],
                proration_behavior="none", # Ingen proratering
                billing_cycle_anchor="unchanged", # Behåll nuvarande faktureringscykel
                cancel_at_period_end=False, # Fortsätt prenumerationen med nya priset vid nästa förnyelse
                metadata=common_metadata # Behåll metadatan
            )
            logger.info(f"[✅] Downgrade scheduled (Subscription.modify) for {subscription_id}. New plan: {new_price_id}")
            return updated_subscription

    except Exception as e:
        logger.error(f"[❌] Failed to change subscription plan: {e}", exc_info=True)
        raise

async def handle_subscription_plan_change_request(customer_id: str, new_price_id: str, user_id: str):
    """
    Handles the entire flow for changing a user's subscription plan,
    including retrieving the current subscription and delegating to
    change_user_subscription_plan for the Stripe API call and invoicing.
    """
    logger.info(f"[StripeService] Initiating subscription plan change for customer {customer_id} to new price {new_price_id}.")

    # Hämta den aktiva prenumerationen för kunden.
    subs = stripe.Subscription.list(
        customer=customer_id, 
        status="active", 
        limit=1
    ) 
    if not subs.data:
        logger.error(f"[StripeService] No active subscription found for customer {customer_id}.")
        raise ValueError("No active subscription to update for this customer.")

    subscription_obj = subs.data[0] # Hela subscription-objektet

    logger.info(f"[StripeService] Found active subscription {subscription_obj.id} for customer {customer_id}.")

    # Anropa din befintliga funktion för att utföra ändringen och hantera fakturering
    updated_subscription = await change_user_subscription_plan(
        subscription_obj=subscription_obj,
        new_price_id=new_price_id,
        user_id=user_id
    )

    logger.info(f"[StripeService] Subscription plan change process completed. New subscription status: {updated_subscription.status}.")
    return updated_subscription