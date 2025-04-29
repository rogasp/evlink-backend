# Changelog

## [0.2.0]

## [2025-04-29] Vehicle Caching & UI Update

### Added
- Per-vehicle caching logic in SQLite backend.

### Changed
- Cache expiration now properly uses timedelta.
- Adjusted vehicle table rendering in frontend to match updated Enode data structure.
- Updated error handling on vehicle fetch to use toast messages.

### Fixed
- SQL insert issue caused by incorrect number of parameters.
- TypeScript errors due to outdated vehicle type definitions.

## [2025-04-27]

### Added
- Backend endpoint `POST /api/users/{user_id}/email` to allow users to update their email.
- `private.py` router for protected user actions.
- JWT token verification for all private routes (`security.py`).
- Frontend `EditableField` component for inline editing with spinner and toast notifications.
- Toast notification and automatic forced logout after email change to refresh session.
- Full frontend and backend integration for editing user email securely.
- Secure handling of `Authorization: Bearer <token>` in all protected API calls.

### Changed
- Improved project structure by separating `public.py` and `private.py` routers.
- Updated `main.py` imports to use `from app.api import public, private`.
- Session handling improved with clear token checks and re-authentication flow.

### Fixed
- Correct database update logic for users' email.
- Minor token handling issues in frontend session management.

---

# 📦 Summary
This version introduces secure user email updates with a better structured backend and a smoother frontend UX, including spinner feedback, toast notifications, and automatic re-login after sensitive changes.
