# EVLink Backend Architecture

## Overview
This backend is built using **FastAPI** and integrates with **Supabase** for authentication and database functionality.

## Tech Stack
- **Frontend**: Next.js
- **Backend**: FastAPI (Python 3.12)
- **Auth & DB**: Supabase (Auth, Postgres, RLS)
- **Deployment**: GitHub Actions + VPS

## Folder Structure
```
backend/
├── app/
│   ├── api/                # API routes (public, private, admin, system)
│   ├── auth/               # Supabase JWT auth logic
│   ├── lib/                # Supabase client logic
│   ├── storage/            # DB access functions
│   ├── config.py           # Centralized env var loading
│   └── main.py             # FastAPI app definition
├── docs/                   # Documentation files
└── .env                    # Environment config (local)
```

## Auth Flow
- Frontend handles registration/login via Supabase Auth (GitHub, Magic Link).
- Frontend stores and sends JWT as Bearer token to backend.
- Backend verifies token and applies access rules (user, admin, system).

## Supabase Keys
- **Anon Key**: used on frontend.
- **Service Key**: used on backend for admin/system access.

## RLS Strategy
- RLS is enabled on all sensitive tables.
- Policies are defined for:
  - `authenticated` users: only access own data.
  - `admin` role: full access.
  - `service` backend: full access (used only in trusted endpoints like webhooks).

## Security Notes
- All `public` routes avoid Supabase auth.
- `private` routes require token.
- `admin` and `system` routes perform role checks.

## Next Steps
- Add `private.py` routes.
- Add vehicle storage + linking.
- Setup webhook verification.
- Finalize RLS for `vehicles`, `webhook_logs`.
