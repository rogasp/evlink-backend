# backend/app/api/admin/subscription.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth.supabase_auth import get_supabase_user
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

@router.get("/admin/subscription-plans", response_model=list[SubscriptionPlanOut])
async def list_subscription_plans(user=Depends(require_admin)):
    print(f"👮 Admin {user['id']} requested list of all subscription plans")
    plans = await get_all_subscription_plans()
    print(f"✅ Returning {len(plans)} subscription plans")
    return plans
