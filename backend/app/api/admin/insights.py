from fastapi import APIRouter, Depends, HTTPException
from app.storage.user import get_total_user_count, get_new_user_count
from app.storage.vehicle import get_total_vehicle_count, get_new_vehicle_count
from app.storage.invoice import get_total_revenue, get_monthly_revenue, get_yearly_revenue
from app.storage.subscription import count_subscriptions_by_plan, count_users_on_trial
from app.auth.supabase_auth import get_supabase_user
from datetime import datetime

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

@router.get("/insights/users/total")
async def get_total_users(user=Depends(require_admin)):
    """
    Returns the total number of users.
    """
    total_users = await get_total_user_count()
    return {"total_users": total_users}

@router.get("/insights/users/new/1day")
async def get_new_users_1day(user=Depends(require_admin)):
    """
    Returns the number of new users in the last 24 hours.
    """
    new_users = await get_new_user_count(1)
    return {"new_users_1day": new_users}

@router.get("/insights/users/new/7days")
async def get_new_users_7days(user=Depends(require_admin)):
    """
    Returns the number of new users in the last 7 days.
    """
    new_users = await get_new_user_count(7)
    return {"new_users_7days": new_users}

@router.get("/insights/users/new/30days")
async def get_new_users_30days(user=Depends(require_admin)):
    """
    Returns the number of new users in the last 30 days.
    """
    new_users = await get_new_user_count(30)
    return {"new_users_30days": new_users}

@router.get("/insights/vehicles/total")
async def get_total_vehicles(user=Depends(require_admin)):
    """
    Returns the total number of vehicles.
    """
    total_vehicles = await get_total_vehicle_count()
    return {"total_vehicles": total_vehicles}

@router.get("/insights/vehicles/new/1day")
async def get_new_vehicles_1day(user=Depends(require_admin)):
    """
    Returns the number of new vehicles in the last 24 hours.
    """
    new_vehicles = await get_new_vehicle_count(1)
    return {"new_vehicles_1day": new_vehicles}

@router.get("/insights/vehicles/new/7days")
async def get_new_vehicles_7days(user=Depends(require_admin)):
    """
    Returns the number of new vehicles in the last 7 days.
    """
    new_vehicles = await get_new_vehicle_count(7)
    return {"new_vehicles_7days": new_vehicles}

@router.get("/insights/vehicles/new/30days")
async def get_new_vehicles_30days(user=Depends(require_admin)):
    """
    Returns the number of new vehicles in the last 30 days.
    """
    new_vehicles = await get_new_vehicle_count(30)
    return {"new_vehicles_30days": new_vehicles}

@router.get("/insights/revenue/total")
async def get_total_revenue_insight(user=Depends(require_admin)):
    """
    Returns the total revenue.
    """
    total_revenue = await get_total_revenue()
    return {"total_revenue": total_revenue}

@router.get("/insights/revenue/monthly")
async def get_monthly_revenue_insight(year: int, month: int, user=Depends(require_admin)):
    """
    Returns the monthly revenue for a given year and month.
    """
    monthly_revenue = await get_monthly_revenue(year, month)
    return {"monthly_revenue": monthly_revenue}

@router.get("/insights/revenue/yearly")
async def get_yearly_revenue_insight(year: int, user=Depends(require_admin)):
    """
    Returns the yearly revenue for a given year.
    """
    yearly_revenue = await get_yearly_revenue(year)
    return {"yearly_revenue": yearly_revenue}

@router.get("/insights/subscriptions/basic")
async def get_basic_subscriptions(user=Depends(require_admin)):
    """
    Returns the number of active Basic subscriptions.
    """
    count = await count_subscriptions_by_plan("Basic")
    return {"basic_subscriptions": count}

@router.get("/insights/subscriptions/pro")
async def get_pro_subscriptions(user=Depends(require_admin)):
    """
    Returns the number of active Pro subscriptions.
    """
    count = await count_subscriptions_by_plan("Pro")
    return {"pro_subscriptions": count}

@router.get("/insights/users/on_trial")
async def get_users_on_trial(user=Depends(require_admin)):
    """
    Returns the number of users currently on a trial period.
    """
    count = await count_users_on_trial()
    return {"users_on_trial": count}