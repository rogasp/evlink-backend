# backend/app/api/admin/subscription.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth.supabase_auth import get_supabase_user
from app.services.stripe_utils import create_stripe_subscription_plan, sync_stripe_plans_to_db
from app.storage.subscription import get_all_subscription_plans

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

class CreateSubscriptionPlan(BaseModel):
    code: str
    name: str
    description: str | None = None
    amount: int   # i cent/öre (t.ex. 499 = €4.99)
    currency: str = "eur"
    interval: str = "month"  # eller "year"
    type: str = "recurring"  # eller "one_time"

class SubscriptionPlanOut(BaseModel):
    id: str
    name: str
    description: str | None
    type: str
    stripe_product_id: str
    stripe_price_id: str
    amount: int
    currency: str
    interval: str | None
    is_active: bool
    created_at: str
    updated_at: str

@router.post("/admin/subscription-plans")
async def create_subscription_plan(
    payload: CreateSubscriptionPlan,
    user=Depends(get_supabase_user),
):
    if user.get("user_metadata", {}).get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    try:
        result = await create_stripe_subscription_plan(payload)
    except Exception as e:
        raise HTTPException(400, f"Stripe error: {e}")
    return {"success": True, "plan": result["db_row"]}

@router.get("/admin/subscription-plans", response_model=list[SubscriptionPlanOut])
async def list_subscription_plans(user=Depends(require_admin)):
    print(f"👮 Admin {user['id']} requested list of all subscription plans")
    plans = await get_all_subscription_plans()
    print(f"✅ Returning {len(plans)} subscription plans")
    return plans

@router.post("/admin/subscription-plans/sync")
async def sync_subscription_plans(user=Depends(require_admin)):
    """
    Sync all subscription plans from Stripe into the local database.
    """
    print(f"[🔄] Admin {user['id']} started subscription plan sync from Stripe")
    result = await sync_stripe_plans_to_db()
    print(f"[✅] Synced {result.get('inserted', 0)} new plans, {result.get('updated', 0)} updated")
    return result
