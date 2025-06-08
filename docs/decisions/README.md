# Architecture Decision Records (ADR)

This directory contains the Architecture Decision Records (ADRs) for EVLinkHA. ADRs document significant architectural decisions, their context, and their consequences.

## How to use

1. **Create a new ADR**: Copy `0001-record-architecture.md` as `0002-your-decision-title.md`.
2. **Fill in the template**: Ensure each ADR follows the structure:

   * **Title**: Short, imperative (e.g., `Use FastAPI for backend`)
   * **Status**: Proposed, Accepted, Deprecated, etc.
   * **Context**: Background and why the decision is being made.
   * **Decision**: The decision itself.
   * **Consequences**: Positive and negative outcomes.
3. **Reference ADRs** in code/docs when relevant.

## Existing ADRs

* [0001-record-architecture.md](0001-record-architecture.md) - Initial architecture overview and technology choices
* [0002-stripe-payments.md](0002-stripe-payments.md) - Stripe Checkout integration and webhook handling options

---

*After adding or updating ADRs, please link them in the main project README under an Architecture Decisions section.*
