### Problem Description

Currently, the `/user/{user_id}/subscription` endpoint in the backend does not return `amount` and `currency` for a user's subscription, even for paying users. This results in the frontend displaying "—" for the price on the profile page, which is incorrect for active, paying subscriptions.

This data is crucial for accurately displaying billing information to the user.

### Proposed Solution

Modify the `get_user_subscription` function in `backend/app/storage/subscription.py` to include `amount` and `currency` from the `subscription_plans` table.

**Current `get_user_subscription` (simplified):**
```python
async def get_user_subscription(user_id: str) -> dict | None:
    supabase = get_supabase_admin_client()
    res = supabase.table("subscriptions").select("*").eq("user_id", user_id).maybe_single().execute()
    return res.data if hasattr(res, "data") else None
```

**Proposed `get_user_subscription` modification:**
```python
# backend/app/storage/subscription.py

async def get_user_subscription(user_id: str) -> dict | None:
    """Retrieves a single subscription record for a given user ID, including plan details."""
    supabase = get_supabase_admin_client()
    
    # Fetch the subscription record
    res = supabase.table("subscriptions").select("*").eq("user_id", user_id).maybe_single().execute()
    subscription_data = res.data if hasattr(res, "data") else None

    if subscription_data:
        # Fetch the corresponding plan details from subscription_plans table
        plan_name = subscription_data.get("plan_name")
        if plan_name:
            plan_res = supabase.table("subscription_plans").select("amount", "currency").eq("name", plan_name).maybe_single().execute()
            plan_data = plan_res.data if hasattr(plan_res, "data") else None
            if plan_data:
                subscription_data["amount"] = plan_data.get("amount")
                subscription_data["currency"] = plan_data.get("currency")
    
    return subscription_data
```

### Acceptance Criteria

- The `/user/{user_id}/subscription` endpoint successfully returns `amount` and `currency` fields for active, paying subscriptions.
- The frontend profile page correctly displays the subscription price for PRO users.

### Labels

`bug`, `backend`, `api`, `priority: high`
