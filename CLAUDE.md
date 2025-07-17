# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

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