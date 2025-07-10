import stripe
from app.logger import logger
from app.config import STRIPE_SECRET_KEY

stripe.api_key = STRIPE_SECRET_KEY

async def get_stripe_balance() -> dict:
    """
    Fetches the current Stripe balance.
    """
    try:
        balance = stripe.Balance.retrieve()
        return balance.to_dict()
    except stripe.error.StripeError as e:
        logger.error(f"[❌ Stripe Error] Failed to retrieve Stripe balance: {e}")
        raise
    except Exception as e:
        logger.error(f"[❌ General Error] Failed to retrieve Stripe balance: {e}")
        raise
