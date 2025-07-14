# Subscription, Billing, and Rate Limiting Flow

This document outlines the end-to-end process of how user subscriptions are managed, how billing events from Stripe are handled, and how this data is used to enforce API rate limits.

## 1. Data Sources & Single Source of Truth

- **`public.users`**: This table holds core user information, including their assigned `tier` (`free`, `basic`, `pro`), their `subscription_status`, and their balance of `purchased_api_tokens`.
- **`public.subscriptions`**: This table is the **single source of truth** for the *current state* of a user's subscription plan. It mirrors the subscription data from Stripe. The most critical field for rate limiting is `current_period_end`, which dictates when the monthly API allowance should reset.
- **`public.poll_logs`**: A log of every API call made by a user, used to count usage within a given period.
- **Stripe**: The external source of truth for all billing and payment information. Our system listens to webhooks from Stripe to keep our local database in sync.

## 2. Subscription Lifecycle & Webhook Handling

The entire subscription lifecycle is managed by Stripe and communicated to our backend via webhooks. The primary webhook endpoint is `/api/webhook/stripe`.

### Key Webhook Events:

1.  **`customer.subscription.created`** / **`customer.subscription.updated`**:
    - **Trigger**: A user subscribes to a new plan, changes their plan, or the subscription is renewed.
    - **Action**:
        - The webhook is received by `stripe_webhook()` in `backend/app/api/webhook.py`.
        - The function `upsert_subscription_from_stripe()` in `backend/app/storage/subscription.py` is called.
        - This function creates or updates the corresponding record in the `public.subscriptions` table with the latest data from Stripe, including `status`, `plan_name`, and `current_period_end`.
        - The user's `tier` and `subscription_status` in the `public.users` table are also updated via `update_user_subscription()`.

2.  **`customer.subscription.deleted`**:
    - **Trigger**: A user cancels their subscription.
    - **Action**:
        - The webhook handler updates the subscription status to `canceled` in the `public.subscriptions` table.
        - The user's `tier` in `public.users` is typically set back to `free`, and `subscription_status` is updated.

## 3. API Rate Limiting Logic

The rate limiting is enforced by the `api_key_rate_limit` dependency in `backend/app/api/dependencies.py`. It's applied to all API-key protected endpoints.

### The Process:

1.  **Request Received**: A user makes an API call with their key.
2.  **Fetch User Data**: The `api_key_rate_limit` dependency calls `get_user_rate_limit_data()` in `backend/app/storage/user.py`.
3.  **Gather Rate Limit Info**:
    - `get_user_rate_limit_data()` fetches the user's `tier`, `linked_vehicle_count`, and `purchased_api_tokens` from the `users` table.
    - **Crucially**, it then calls `get_user_subscription()` from `backend/app/storage/subscription.py` to fetch the active subscription record.
    - It extracts the `current_period_end` timestamp from the subscription record and returns it as `tier_reset_date`.
4.  **Calculate Usage Window**:
    - The rate limiter now has the `tier_reset_date`. It defines the start of the current usage window as 30 days prior to this reset date.
5.  **Count Recent Polls**:
    - It queries the `poll_logs` table to count how many API calls the user (or specific vehicle, for higher tiers) has made since the start of the usage window.
6.  **Check Allowance**:
    - The system compares the `current_count` against the maximum calls allowed for the user's `tier` (defined in settings).
7.  **Enforce Limit**:
    - **If `current_count` < `max_calls`**: The request is allowed. A background task is created to log the new poll.
    - **If `current_count` >= `max_calls`**: The system checks the `purchased_api_tokens` balance.
        - **If `purchased_api_tokens` > 0**: The request is allowed. The `decrement_purchased_api_tokens()` RPC function is called to atomically decrement the token balance by one. The poll is logged.
        - **If `purchased_api_tokens` <= 0**: The request is denied with an `HTTP 429 Too Many Requests` error.

This flow ensures that the user's monthly allowance is tied directly to their Stripe billing cycle, providing a fair and accurate rate limiting system.
