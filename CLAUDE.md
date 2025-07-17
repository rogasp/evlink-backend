# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (FastAPI)
- **Start dev server**: `./start-backend.sh` or `cd backend && uvicorn app.main:app --reload --reload-dir backend/app --host 0.0.0.0 --port 8000`
- **Install dependencies**: `pip install -r backend/requirements.txt`
- **Test**: No specific test framework configured - check for pytest usage in backend/
- **Lint**: Use `black` and `isort` for code formatting (available in requirements.txt)

### Frontend (Next.js 15)
- **Start dev server**: `cd frontend && npm run dev`
- **Build**: `cd frontend && npm run build`
- **Lint**: `cd frontend && npm run lint`
- **Install dependencies**: `cd frontend && npm install`

### Database (Supabase)
- **Local development**: Uses Supabase CLI (`supabase` command available)
- **Migrations**: Located in `supabase/sql_definitions/` and `supabase/local/supabase/migrations/`

## Architecture Overview

EVLinkHA is a bridge between Home Assistant and Enode for electric vehicle integration.

### Tech Stack
- **Backend**: FastAPI (Python 3.12) with async/await
- **Frontend**: Next.js 15 with App Router, TypeScript, TailwindCSS
- **Database**: Supabase (PostgreSQL) with auth, realtime, and RLS
- **Authentication**: Supabase Auth with magic links, GitHub, Google OAuth
- **Payments**: Stripe integration for subscriptions
- **Email**: Brevo (formerly Sendinblue) for transactional emails
- **Monitoring**: Sentry for error tracking

### Key Components

#### Backend Structure (`backend/app/`)
- **`api/`**: API endpoints organized by feature (admin/, ha.py, me.py, etc.)
- **`auth/`**: Authentication handlers (API key, service role, Supabase auth)
- **`enode/`**: Enode API integration (vehicles, webhooks, linking)
- **`storage/`**: Database access layer for different entities
- **`services/`**: Business logic (email, Stripe, onboarding)
- **`models/`**: Pydantic models for data validation

#### Frontend Structure (`frontend/src/`)
- **`app/`**: Next.js 15 App Router pages
  - **`(app)/`**: Authenticated pages (dashboard, profile, admin)
  - **`(public)/`**: Public pages (login, register, landing)
- **`components/`**: Organized by feature and reusability
  - **`ui/`**: Generic UI components (ShadCN-based)
  - **`layout/`**: Layout components (navbar, sidebar, footer)
  - **`[feature]/`**: Feature-specific components
- **`hooks/`**: Custom React hooks for data fetching and state
- **`lib/`**: Utilities and API clients
- **`i18n/`**: Internationalization with react-i18next

### Data Flow
1. Users authenticate via Supabase Auth
2. Frontend calls FastAPI backend with JWT tokens
3. Backend validates tokens and interacts with Supabase database
4. Enode webhooks trigger real-time updates via FastAPI
5. Email notifications sent via Brevo API

### Key Features
- **Vehicle Management**: Link/unlink vehicles via Enode
- **Real-time Updates**: Vehicle status updates via webhooks
- **Subscription Billing**: Stripe integration for Pro plans
- **Admin Dashboard**: User management and system monitoring
- **Multi-language Support**: Swedish and English via i18next
- **Home Assistant Integration**: RESTful API for HA add-on

## Development Notes

### Component Guidelines
- Use PascalCase for all component files
- Follow the folder structure in `frontend/src/components/`
- Prefer props-driven components for reusability
- Use TypeScript interfaces for all component props

### Code Style
- Backend: Use `black` and `isort` for Python formatting
- Frontend: Use ESLint configuration in `eslint.config.mjs`
- Follow existing patterns in authentication and data fetching

### Authentication Flow
- Users authenticate via Supabase Auth
- Frontend uses `useAuth` hook and `SupabaseProvider`
- Backend validates JWT tokens via `supabase_auth.py`
- API keys available for external integrations

### Database Schema
Key tables:
- `users`: User profiles and settings
- `vehicles`: Vehicle data and cache
- `subscriptions`: Stripe subscription management
- `webhook_events`: Enode webhook history
- `poll_logs`: API usage tracking

### Testing
- No specific test framework configured
- Manual testing via development servers
- Production deployment uses GitHub Actions

## Common Tasks

### Adding New API Endpoints
1. Create endpoint in appropriate `backend/app/api/` file
2. Add storage functions in `backend/app/storage/`
3. Update frontend API client in `frontend/src/lib/api.ts`
4. Add TypeScript types in `frontend/src/types/`

### Adding New Frontend Pages
1. Create page in `frontend/src/app/` following App Router conventions
2. Add navigation links in `frontend/src/components/layout/`
3. Create page-specific components in appropriate feature folder
4. Add route to navigation constants if needed

### Database Changes
1. Write SQL in `supabase/sql_definitions/`
2. Apply via Supabase CLI or manual execution
3. Update storage functions and models accordingly

### Webhook Handling
- Enode webhooks handled in `backend/app/enode/webhook.py`
- Stripe webhooks handled in `backend/app/api/webhook.py`
- All webhook events logged to database for monitoring

### Frontend (Next.js)
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
```

### Backend (FastAPI)
```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --reload-dir backend/app --host 0.0.0.0 --port 8000
```

Alternative: Use the convenience script:
```bash
./start-backend.sh
```

### Database (Supabase)
```bash
cd supabase/local
supabase start       # Start local Supabase
supabase stop        # Stop local Supabase
```

### Testing
- **Backend**: Uses pytest - run `pytest` from the backend directory
- **Frontend**: Uses Jest/React Testing Library - run `npm test`

## Architecture Overview

EVLinkHA is an EV integration platform with a clear separation between frontend and backend:

### Backend Architecture (FastAPI)
- **Main entry**: `backend/app/main.py` - FastAPI app with telemetry middleware
- **Configuration**: `backend/app/config.py` - Environment-based settings
- **API structure**:
  - `/api/` - Main API endpoints
  - `/api/admin/` - Admin-only endpoints
  - `/api/ha/` - Home Assistant integration endpoints
  - `/webhook` - Enode webhook handlers
- **Authentication**: JWT-based via Supabase Auth with custom auth dependencies
- **Storage layer**: Organized by domain in `backend/app/storage/`
- **Services**: External integrations (Stripe, Brevo, Email) in `backend/app/services/`

### Frontend Architecture (Next.js 15)
- **App Router** with route groups: `(app)` for authenticated, `(public)` for public pages
- **Component structure**:
  - `components/ui/` - Reusable UI components (ShadCN-based)
  - `components/[feature]/` - Feature-specific components
  - `components/layout/` - Layout components
- **State management**: React hooks with Supabase Realtime integration
- **Authentication**: Custom `useAuth` hook with Supabase Auth
- **Styling**: Tailwind CSS with custom components

### Key Integrations
- **Enode**: EV manufacturer API integration
- **Supabase**: Database, Auth, and Realtime subscriptions
- **Stripe**: Payment processing and subscription management
- **Brevo**: Email marketing and notifications

## Development Patterns

### Authentication Flow
- Backend uses JWT tokens from Supabase Auth
- Frontend uses `useAuth` hook for authentication state
- Admin endpoints require specific user roles

### Database Access
- Backend uses direct Supabase client for database operations
- Frontend uses Supabase client with RLS policies
- Realtime updates for live data synchronization

### API Design
- RESTful endpoints with FastAPI
- Comprehensive telemetry middleware for usage tracking
- Token-based rate limiting system

### Component Conventions
- PascalCase for all React components
- Props-driven design for reusability
- Proper use of `'use client'` directive for client components

## Environment Setup

Required environment variables:
- **Supabase**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- **Enode**: `ENODE_CLIENT_ID`, `ENODE_CLIENT_SECRET`, `ENODE_BASE_URL`
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- **Email**: `BREVO_API_KEY`, `RESEND_API_KEY`

## Common Development Tasks

### Adding New API Endpoints
1. Create endpoint in appropriate router file under `backend/app/api/`
2. Add authentication dependency if needed
3. Implement storage layer function if database access required
4. Update telemetry costs in `config.py` if applicable

### Adding New Components
1. Follow component naming conventions (PascalCase)
2. Place in appropriate directory based on scope
3. Use TypeScript for type safety
4. Follow existing patterns for props and state management

### Database Changes
1. Update Supabase migrations in `supabase/sql_definitions/`
2. Apply changes to local development database
3. Update TypeScript types if needed

## File Structure Notes

- `tasks/` - Development task tracking and templates
- `docs/` - Comprehensive project documentation
- `scripts/` - Utility scripts for development and deployment
- `supabase/` - Database schema and local development setup

