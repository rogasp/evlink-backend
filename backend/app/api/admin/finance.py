from fastapi import APIRouter, Depends, HTTPException
from app.auth.supabase_auth import get_supabase_user
from app.storage.invoice import get_all_invoices
from app.storage.subscription import get_all_subscriptions
from app.storage.user import get_all_customers
from app.services.stripe_service import get_stripe_balance

router = APIRouter()

def require_admin(user=Depends(get_supabase_user)):
    print("🔍 Admin check - Full user object:")
    # print(user)

    role = user.get("user_metadata", {}).get("role")
    print(f"🔐 Extracted role: {role}")

    if role != "admin":
        print(f"⛔ Access denied: user {user['id']} with role '{role}' tried to access admin route")
        raise HTTPException(status_code=403, detail="Admin access required")

    print(f"✅ Admin access granted to user {user['id']}")
    return user

@router.get("/finance/invoices")
async def list_all_invoices(user=Depends(require_admin)):
    """
    Returns a list of all invoices.
    """
    invoices = await get_all_invoices()
    return invoices

@router.get("/finance/subscriptions")
async def list_all_subscriptions(user=Depends(require_admin)):
    """
    Returns a list of all subscriptions.
    """
    subscriptions = await get_all_subscriptions()
    return subscriptions

@router.get("/finance/customers")
async def list_all_customers(user=Depends(require_admin)):
    """
    Returns a list of all customers.
    """
    customers = await get_all_customers()
    return customers

@router.get("/finance/balance")
async def get_stripe_balance_insight(user=Depends(require_admin)):
    """
    Returns the current Stripe balance.
    """
    balance = await get_stripe_balance()
    return balance
