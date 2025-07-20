# Setting up New EVLinkHA Services

This document outlines the architectural shift towards a more modular service-oriented approach for EVLinkHA. It provides guidelines for creating new services, focusing initially on `evlinkha-api`, and details the setup process for new contributors or agents.

## 1. Architectural Vision: Decoupled Services

Our goal is to separate the monolithic `evlink-backend` into smaller, more focused services. This improves scalability, maintainability, and allows for independent deployment.

### Service Naming Convention

All new services will follow the `evlinkha-XXXXX` naming convention.

-   `evlinkha-homeassistant`: HACS Component (existing)
-   `evlinkha-api`: The new dedicated API service for Home Assistant and internal services (e.g., cron jobs).
-   `evlinkha-app-backend`: The current `evlink-backend` will evolve into this "Backend For Frontend" (BFF) service.

## 2. Focus: `evlinkha-api`

The immediate focus is to establish `evlinkha-api` as a standalone, versioned, and low-overhead API service.

### Purpose

`evlinkha-api` will serve as the primary interface for:

-   **Home Assistant (HA) Component:** Providing vehicle status, control, and other HA-specific functionalities.
-   **Internal Services:** Such as the `evlink-cron` service for automated tasks (e.g., trial reminders).

### Key Principles for `evlinkha-api`

-   **Minimalism:** Only include endpoints and logic strictly necessary for its consumers (HA, cron).
-   **Performance:** Optimized for low latency and high throughput.
-   **Versioning:** All external-facing APIs will be versioned (e.g., `/v1/ha/status`). Internal APIs will also be versioned (e.g., `/v1/internal/send-trial-reminder`).
-   **Security:** Robust authentication and authorization mechanisms.
-   **Private Repository:** Initially, `evlinkha-api` will reside in a private GitHub repository.

### Initial Scope: Cron Integration

To get `evlinkha-api` up and running quickly, the initial focus will be on supporting the `evlink-cron` service. This means migrating the `/internal/send-trial-reminder` endpoint.

## 3. Setup Guide for `evlinkha-api` (New Project)

This section details the steps for setting up a new `evlinkha-api` project.

### 3.1. Repository Creation

-   Create a **new, private GitHub repository** named `evlinkha-api`.
-   Initialize with a basic `.gitignore` (Python, .env) and a `README.md`.

### 3.2. Project Structure (Initial)

```
evlinkha-api/
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt
└── app/
    ├── main.py
    ├── config.py
    ├── dependencies/
    │   └── auth.py
    ├── services/
    │   └── email/
    │       ├── __init__.py
    │       ├── brevo_service.py
    │       └── email_service.py
    └── storage/
        ├── __init__.py
        ├── email.py
        ├── user.py # Only what's needed for get_user_by_id
        └── supabase.py # Supabase client setup
```

### 3.3. Core Dependencies

Add the following to `requirements.txt`:

```
fastapi
uvicorn
python-dotenv
supabase
httpx
pydantic
```

### 3.4. Environment Variables (`.env.example`)

```
SUPABASE_URL="your_supabase_url"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
INTERNAL_API_KEY="a_strong_internal_api_key"
BREVO_API_KEY="your_brevo_api_key"
FROM_EMAIL="noreply@evlinkha.se"
FROM_NAME="EVLinkHA"
```

### 3.5. Code Migration (Initial)

Copy the following files/code from the current `evlink-backend` to `evlinkha-api`:

-   **`app/config.py`:** Copy relevant environment variable loading.
-   **`app/dependencies/auth.py`:** Copy `get_internal_api_key` and its dependencies (e.g., `APIKeyHeader`, `Security`).
-   **`app/services/email/` directory:** Copy `__init__.py`, `brevo_service.py`, `email_service.py`.
-   **`app/storage/email.py`:** Copy `get_email_template`, `has_email_been_sent`, `log_sent_email`.
-   **`app/storage/user.py`:** Create a minimal version containing only `get_user_by_id` (and its dependencies like `get_supabase_admin_async_client`).
-   **`app/storage/supabase.py`:** Copy `get_supabase_admin_async_client` and `create_async_client` related code.
-   **`app/main.py`:** Set up a basic FastAPI app, include `internal_router` (from `app/api/internal.py`).

### 3.6. Database Setup

-   The `email_templates` and `sent_emails` tables (and their RLS policies) are already in your Supabase database. `evlinkha-api` will connect to this existing database.
-   Ensure `SUPABASE_SERVICE_ROLE_KEY` is correctly configured for `evlinkha-api` to bypass RLS for internal operations.

### 3.7. Deployment

-   Deploy `evlinkha-api` to `evlink-api` server (10.0.0.4) or a test environment.
-   Configure Uvicorn to run the application.

## 4. Common Modules / Shared Code

If significant code needs to be shared between `evlinkha-api` and `evlinkha-app-backend` (e.g., complex data models, utility functions), we will create a separate private Python package (e.g., `evlinkha-common`) and install it as a dependency in both projects. This will be evaluated as needed.

## 5. Next Steps for New Agent

1.  **Read this document thoroughly.**
2.  **Create the `evlinkha-api` private GitHub repository.**
3.  **Set up the basic project structure** as outlined in section 3.2.
4.  **Copy the initial code** as described in section 3.5.
5.  **Install dependencies** in a `venv`.
6.  **Configure `.env` file.**
7.  **Test the `send-trial-reminder` endpoint** locally or on a test deployment.

This document will be updated as `evlinkha-api` evolves and new services are introduced.
