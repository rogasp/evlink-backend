# 0001 - Initial Architecture Overview

**Status**: Accepted

## Context

When starting the EVLinkHA project, we needed to decide on the core technologies, system boundaries, and data flows to ensure a maintainable, scalable, and secure foundation.

Key requirements:

* Provide a REST API for Home Assistant integration
* Support real-time updates via webhooks
* Secure authentication and access control
* Open source and self-hostable

## Decision

We have chosen:

* **Backend**: FastAPI (Python 3.12) for high performance and modern Python features.
* **Frontend**: Next.js 15 with the App Router (TypeScript) for a robust, SSR-compatible UI.
* **Database & Auth**: Supabase (PostgreSQL) to leverage managed services for auth, realtime, and data storage.
* **Cron/Worker**: Python async functions for background tasks within FastAPI.
* **Email**: Resend API for transactional emails.

## Consequences

### Positive

* Fast development with type-safe code (TypeScript/Python)
* Scalable server with FastAPI + Uvicorn
* Built-in auth and realtime features via Supabase
* Simplified hosting: can use Vercel, Supabase cloud, and any Python host

### Negative

* Vendor lock-in to Supabase platform
* Learning curve for team unfamiliar with FastAPI or Next.js 15
* Less flexibility compared to self-managed Postgres and custom auth

*Created on May 25, 2025*
