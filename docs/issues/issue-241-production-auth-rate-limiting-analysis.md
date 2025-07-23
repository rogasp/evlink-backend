# GitHub Issue #241: Production Auth/Rate Limiting Bugs - Analysis

**Status**: EVALUATED - Awaiting Implementation  
**Priority**: High  
**Project**: evlinkha-api (not evlink-backend as initially assumed)  
**Date**: 2025-07-23

## Issue Summary

Critical production authentication and rate limiting bugs identified in the evlinkha-api service. Two major problem areas require attention to prevent revenue loss and user experience degradation.

## Problem Areas Identified

### 1. Token Decrementation Race Conditions ⚡

**Location**: `/home/roger/dev/evlinkha-api/app/dependencies/rate_limit.py:124-135`

**Issue**: Potential double-spending of purchased API tokens due to concurrent request handling.

**Current Code**:
```python
if current_count >= max_calls:
    if purchased_api_tokens > 0:
        await decrement_purchased_api_tokens(user_id)  # Point of failure
        # Request continues regardless of success/failure!
```

**Risk Scenarios**:
- **Race Condition**: Two simultaneous requests both see `tokens > 0` and both decrement
- **Database Failure**: RPC call fails but request continues, leading to inconsistent state
- **Network Issues**: Timeout during token decrementation causes undefined behavior

**Business Impact**:
- Users may consume more tokens than their balance allows
- Revenue loss from "free" API calls that should be paid
- Inconsistent token balance reporting

### 2. Tier Enforcement Fallback Logic ⚠️

**Location**: `/home/roger/dev/evlinkha-api/app/dependencies/rate_limit.py:63-68`

**Issue**: Premium users automatically downgraded to free tier during subscription sync issues.

**Current Logic**:
```python
if tier in ["basic", "pro"]:
    if not tier_reset_date or tier_reset_date <= now:
        effective_tier = "free"  # AUTOMATIC FALLBACK
        print(f"User {user_id} falling back to FREE tier...")
```

**Root Causes**:
- **Webhook Latency**: Stripe webhook delays cause temporary downgrades
- **Timezone Issues**: UTC vs local time parsing errors in `tier_reset_date`
- **Subscription Logic Bug**: Uses `trial_ends_at` for subscription date calculation
- **Data Quality**: Missing or malformed subscription data

**Business Impact**:
- Paying customers receive degraded service
- Customer satisfaction and retention issues
- Potential contract violations for service level agreements

## Technical Details

### Token Decrementation Implementation
```python
# /home/roger/dev/evlinkha-api/app/storage/user.py:198-208
async def decrement_purchased_api_tokens(user_id: UUID) -> None:
    try:
        supabase = get_supabase_admin_async_client()
        await supabase.rpc('decrement_user_tokens', {'p_user_id': str(user_id)}).execute()
    except Exception as e:
        print(f"Failed to decrement tokens for user {user_id}: {e}")
        raise  # Request will fail, but token state uncertain
```

### Tier Reset Date Logic
```python
# /home/roger/dev/evlinkha-api/app/storage/user.py:144-155
if not tier_reset_date and user_data.get("is_subscribed"):
    base_date = user_data.get("trial_ends_at")  # Suspicious - why trial_ends_at?
    if base_date:
        tier_reset_date = base_date + relativedelta(months=1)
```

## Critical Questions for Implementation

### Token Decrementation:
1. Is the `decrement_user_tokens` RPC function atomic and handles concurrent calls?
2. Should requests fail if token decrementation fails, or continue with warning?
3. How can we implement rollback for failed API calls after token decrementation?

### Tier Enforcement:
1. What is the acceptable business policy when subscription data is unclear?
2. Should there be a grace period for webhook processing delays?
3. How can admins manually override stuck users?
4. Is monitoring in place for fallback events?

## Monitoring Indicators

**Current Evidence of Issues**:
- Print statement in rate limiter suggests fallback is happening in production
- No structured logging or alerting for these edge cases

**Recommended Monitoring**:
- Alert on tier fallback events for paid users
- Track token decrementation failures
- Monitor webhook processing latency from Stripe

## Next Steps

1. **Immediate**: Implement monitoring for existing fallback events
2. **Short-term**: Add exception handling and rollback logic for token operations
3. **Medium-term**: Redesign tier enforcement with grace periods and better error handling
4. **Long-term**: Implement comprehensive subscription state management system

## Related Security Fixes

As part of security review, timing attack vulnerabilities were also fixed in:
- `/home/roger/dev/evlinkha-api/app/dependencies/auth.py`
- `/home/roger/dev/evlinkha-api/app/api/v1/webhook.py`
- `/home/roger/dev/evlinkha-api/app/api/v1/enode_webhooks.py`

These fixes are completed and ready for deployment.

---

**Analysis completed by**: Claude Code Assistant  
**Analysis date**: 2025-07-23  
**Implementation status**: Awaiting business decision and development scheduling