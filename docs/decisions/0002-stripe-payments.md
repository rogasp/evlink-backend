# 0002 - Stripe Payments

**Status**: Accepted

## Context

Need to accept payments for premium features and donations while keeping the system easy to operate.

## Decision

We have chosen to use **Stripe Checkout** for processing payments. We are evaluating two options for handling Stripe webhooks:

1. **Supabase Edge functions**
2. **FastAPI** routes


## Consequences

#### Supabase Edge
* Simplifies server maintenance and scales automatically
* Limited runtime environment and less control

#### FastAPI
* Full control over the webhook logic and dependencies
* Requires additional backend routing and hosting

*Created on May 26, 2025*
