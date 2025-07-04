import stripe
import logging
from app.config import STRIPE_SECRET_KEY
from app.lib.supabase import get_supabase_admin_client

logger = logging.getLogger("app.services.stripe_utils")

stripe.api_key = STRIPE_SECRET_KEY
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

async def change_user_subscription_plan(subscription_id: str, new_price_id: str, user_id: str):
    logger.info(f"[Stripe] Changing subscription {subscription_id} to new price {new_price_id}")
    subscription = stripe.Subscription.retrieve(subscription_id)
    current_item = subscription["items"]["data"][0]
    current_price_id = current_item["price"]["id"]
    current_unit_amount = current_item["price"]["unit_amount"]
    new_price = stripe.Price.retrieve(new_price_id)
    new_unit_amount = new_price["unit_amount"]

    is_upgrade = new_unit_amount > current_unit_amount

    logger.info(f"[Stripe] Current: {current_price_id} ({current_unit_amount}), New: {new_price_id} ({new_unit_amount}), Upgrade: {is_upgrade}")

    try:
        if is_upgrade:
            logger.info(f"[⬆️] Upgrading (immediate/prorate)")
            return stripe.Subscription.modify(
                subscription_id,
                items=[{
                    'id': current_item["id"],
                    'price': new_price_id,
                }],
                proration_behavior="create_prorations",
                cancel_at_period_end=False,
                metadata={
                    "changed_by": user_id,
                    "upgrade_type": "upgrade"
                }
            )
        else:
            logger.info(f"[⬇️] Downgrading (at period end, no proration)")
            return stripe.Subscription.modify(
                subscription_id,
                items=[{
                    'id': current_item["id"],
                    'price': new_price_id,
                }],
                proration_behavior="none",
                cancel_at_period_end=True,
                metadata={
                    "changed_by": user_id,
                    "upgrade_type": "downgrade"
                }
            )
    except Exception as e:
        logger.error(f"[❌] Failed to change subscription plan: {e}")
        raise
