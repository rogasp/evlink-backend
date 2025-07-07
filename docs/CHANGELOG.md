# Changelog

All notable changes to **evlink-backend** will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## \[0.2.0] â€“ 2025-06-27

### Added

* Webhook support from API to Home Assistant, with dynamic HA URL and webhook ID per user (stored in Supabase, managed via frontend profile page)
* API endpoint for retrieving all vehicles for a user (for HA config flow)
* Better status/log endpoints and admin monitoring tools
* Push event from backend to Home Assistant with structured merge logic
* New fields and onboarding logic for tracking user progress and sending onboarding emails via Brevo
* Support for sandbox/prod selection in HA integration
* Extensive debug logging and admin feedback
* ShadCN skeletons/loader in frontend while waiting for Supabase
* Migration and environment/branch improvements for staging and production

### Changed

* Moved vehicle update merge logic to only apply for vehicle field in webhook payload
* HA config flow updated to allow selection of environment and (optionally) dynamic vehicle selection
* Entity creation logic for sensors in HA refactored for capabilities (isCapable) and enabled\_by\_default
* Improved error handling for vehicle and user lookup (KeyError, empty results)
* Streamlined API error handling and persistent notification logic
* Refactored various endpoints to support better async and retry strategies

### Fixed

* Numerous bugfixes in API (KeyError on vehicle\_id, handling of missing/optional fields)
* Fixed issues with push-to-HA logic not updating entities correctly
* Bugfix for onboarding email logic and event tracking
* Fixed webhook registration and reload issues in Home Assistant integration
* Various UI/UX fixes and code cleanups in admin tools

### Removed

* Hardcoded HA base URL and webhook ID (now per-user)
* Redundant SQLite code (Supabase now default)

---

## \[0.1.0] â€“ 2025-05-31

### Added

* Initial public release of EVLink backend
* FastAPI backend with full support for Enode â†’ Home Assistant proxying
* Supabase integration for Auth and database (users, vehicles, onboarding, API keys)
* Endpoints for user registration, onboarding, vehicle linking, and API key management
* Webhook/event logging, caching, and admin reporting
* Basic e-mail and notification support (Brevo integration)
* Stripe and Twilio integration for notifications/payments (prototype)
* CI/CD pipeline for staging/production (GitHub Actions)
* Dashboard and status endpoints for frontend

### Changed

* Refactored API and storage layers for modularity (move to app/storage, app/services etc)
* Config and environment handling to always go through config.py

### Fixed

* Early bugfixes for vehicle cache, API error handling, and test data
* Database schema corrections and consistency updates

### Removed

* All legacy SQLite-based tables and code

---

*Full commit log available in GitHub repository for traceability.*