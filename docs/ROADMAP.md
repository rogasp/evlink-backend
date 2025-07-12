# EVLinkHA Roadmap

This roadmap outlines the major milestones, planned features, and overall vision for the EVLinkHA project.

## 🚀 Prioritized Backlog July 2025

### 1. Frontend: Refactoring & Componentization

**High Priority:**
*   **#208:** Refactor UserContext (`enhancement`, `frontend`, `auth`)
*   **#202:** Refactor useAuth Hook (`enhancement`, `frontend`, `auth`)
*   **#201:** Refactor API Fetch Utility (`enhancement`, `frontend`, `api`)
*   **#164:** Refactor Frontend Authentication with UserContext and Global Providers (`bug`, `enhancement`, `frontend`)

**Medium Priority:**
*   **#207:** Refactor useVehicles Hook (`enhancement`, `frontend`, `api`)
*   **#206:** Refactor useUserInfo Hook (`enhancement`, `frontend`, `auth`)
*   **#205:** Refactor useUserDetails Hook (`enhancement`, `frontend`, `auth`)
*   **#204:** Refactor useUser Hook (`enhancement`, `frontend`, `auth`)
*   **#203:** Refactor useBillingInfo Hook (`enhancement`, `frontend`, `api`)
*   **#197:** Refactor Link Callback Page Component (`enhancement`, `frontend`, `ui`)
*   **#196:** Refactor Login Page Components (`enhancement`, `frontend`, `ui`)
*   **#195:** Refactor Newsletter Verify Page Component (`enhancement`, `frontend`, `ui`)
*   **#194:** Refactor Privacy Page Component (`enhancement`, `frontend`, `ui`)
*   **#192:** Refactor Register Page Components (`enhancement`, `frontend`, `ui`)
*   **#191:** Refactor Release Notes Page Component (`enhancement`, `frontend`, `ui`)
*   **#190:** Refactor Roadmap Page Component (`enhancement`, `frontend`, `ui`)
*   **#189:** Refactor Status Page Component (`enhancement`, `frontend`, `ui`)
*   **#187:** Refactor Success Page Component (`enhancement`, `frontend`, `ui`)
*   **#186:** Refactor Profile Page Components (`enhancement`, `frontend`, `ui`)
*   **#185:** Refactor Onboarding Page Components (`enhancement`, `frontend`, `ui`)
*   **#183:** Refactor Insights Page Components (`enhancement`, `frontend`, `ui`)
*   **#181:** Refactor Dashboard Page Components (`enhancement`, `frontend`, `ui`)
*   **#180:** Implement Confirmation Modal for Plan Changes/Purchases (`enhancement`, `frontend`, `ui`)
*   **#178:** Extract Billing Page Components (`enhancement`, `frontend`, `ui`)
*   **#177:** Extract Webhook Admin Components (`enhancement`, `frontend`, `ui`, `admin`)
*   **#176:** Extract VehicleTable Component (`enhancement`, `frontend`, `ui`, `admin`)
*   **#175:** Refactor Admin User Detail Page (`enhancement`, `frontend`)
*   **#174:** Refactor Admin Users Page (`enhancement`, `frontend`)
*   **#173:** Add Admin Subscriptions Link to Sidebar (`enhancement`, `frontend`)
*   **#172:** Refactor NewPlanModal Component: Migrate to useUserContext (`enhancement`, `frontend`)
*   **#171:** Refactor Admin Subscriptions Page (`enhancement`, `frontend`)
*   **#170:** Refactor Admin Settings Page Component (`enhancement`, `frontend`)
*   **#169:** Refactor Admin Webhook Logs Page (`enhancement`, `frontend`)
*   **#166:** Refactor Admin Dashboard Page: Extract Data Fetching and Componentize Cards (`enhancement`, `frontend`)

**Low Priority:**
*   **#199:** Refactor Landing Page Metadata and Component Structure (`enhancement`, `frontend`, `ui`)
*   **#198:** Refactor Contact Page Component (`enhancement`, `frontend`, `ui`)
*   **#195:** Refactor Newsletter Verify Page Component (`enhancement`, `frontend`, `ui`)
*   **#194:** Refactor Privacy Page Component (`enhancement`, `frontend`, `ui`)
*   **#191:** Refactor Release Notes Page Component (`enhancement`, `frontend`, `ui`)
*   **#190:** Refactor Roadmap Page Component (`enhancement`, `frontend`, `ui`)
*   **#189:** Refactor Status Page Component (`enhancement`, `frontend`, `ui`)
*   **#187:** Refactor Success Page Component (`enhancement`, `frontend`, `ui`)
*   **#183:** Refactor Insights Page Components (`enhancement`, `frontend`, `ui`)
*   **#173:** Add Admin Subscriptions Link to Sidebar (`enhancement`, `frontend`)

### 2. Backend: Refactoring & Module Management

**High Priority:**
*   **#152:** Refactor: Break Down Unified Checkout Endpoint (`enhancement`, `backend`, `api`)

**Medium Priority:**
*   **#200:** Refactor Customer Service Module (`enhancement`, `frontend`, `backend`)
*   **#163:** Consolidate vehicles.py into vehicle.py Storage Module (`enhancement`, `backend`)
*   **#162:** Refactor: Split Monolithic Vehicle Storage Module (`enhancement`, `backend`)
*   **#161:** Refactor: Split Monolithic User Storage Module (`enhancement`, `backend`)
*   **#160:** Refactor: Relocate update_linked_vehicle_count and Evaluate Subscription Module Split (`enhancement`, `backend`)
*   **#159:** Refactor: Split Invoice Storage Module (`enhancement`, `backend`)
*   **#157:** Consolidate Stripe Service Files (`enhancement`, `backend`)
*   **#155:** Refactor: Split Monolithic webhook.py into Domain-Specific Files (`enhancement`, `backend`)
*   **#154:** Refactor: Split Monolithic public.py into Domain-Specific Files (`enhancement`, `backend`)
*   **#153:** Refactor: Split Monolithic private.py into Domain-Specific Files (`enhancement`, `backend`)
*   **#150:** Refactor Home Assistant Endpoints (ha.py)

**Low Priority:**
*   **#143:** Refactor Telemetry Middleware

### 3. Documentation & Guidelines

**High Priority:**
*   **#188:** Review and Update TermsContent (`documentation`, `enhancement`, `topic: legal`)
*   **#184:** Update Home Assistant Integration Guide (`documentation`, `enhancement`, `frontend`, `priority: high`)
*   **#182:** Rewrite Home Assistant API Documentation for HACS Component (`documentation`, `enhancement`, `frontend`, `priority: high`)

**Medium Priority:**
*   **#165:** Document Frontend Component Structure Guidelines (`documentation`, `frontend`)
*   **#148:** Comprehensive Docstring Coverage for Backend Functions

### 4. New Features & Improvements

**High Priority:**
*   **#179:** Move Subscription Plan Data to Database (`enhancement`, `frontend`, `backend`, `database`)

**Medium Priority:**
*   **#149:** Define Tier Names as Constants or Enum
*   **#139:** Configurable polling/wake-up strategy for each vehicle
*   **#138:** Public API endpoint for State of Charge (SoC) without Home Assistant

### 5. Investigation & Deprecation

**High Priority:**
*   **#193:** Investigate Removal of Register with Code Page (`enhancement`, `frontend`, `priority: high`)

**Medium Priority:**
*   **#168:** Investigate Deprecation/Refactor Admin Interest Page (`documentation`, `enhancement`, `frontend`)
*   **#158:** Investigate Deprecation of Interest Management Module (`documentation`, `enhancement`, `backend`)
*   **#156:** Investigate and Implement Brevo Segment Management Functions (`bug`, `enhancement`, `backend`)
*   **#147:** Review and Potentially Deprecate/Refactor Admin Interest API

### 6. Bug Fixes

**High Priority:**
*   **#151:** Fix: Incorrect API Usage Calculation for Tiered Plans (`bug`, `backend`, `api`)
*   **#112:** Safeguard un-link vehicle function (`bug`, `documentation`, `frontend`, `enode`, `severity:high`)
*   **#103:** [❌ fetch_fresh] Failed to fetch or save vehicles: (`bug`)
*   **#102:** [❌ ERROR] Failed to create link session: Client error '400 Bad Request' for url 'https://enode-api.production.enode.io/users/xxxx/link' (`bug`)

### 7. Cross-cutting & Infrastructure

**Medium Priority:**
*   **#167:** Refactor Admin Finance Page: Extract Data, Componentize Cards and Tables (`enhancement`, `frontend`)
*   **#146:** Centralize Admin Authentication Dependency
*   **#145:** Standardize Logging Format with Icons
*   **#144:** Refactor Configuration with Pydantic-Settings

---

## 🔍 Previous Focus (May–June 2025)

These are the final tasks before our first public release (Go Live):

* [x] Supabase integration for auth + data
* [x] Basic API for Home Assistant
* [x] Vehicle linking via Enode
* [x] Dashboard UI with HTMX + Tailwind
* [x] Webhook log view & status tracking
* [x] Online/offline vehicle monitoring
* [x] Notify user on vehicle offline
* [x] Improved logging and error tracking
* [x] Add Google as login option
* [x] Send and receive email via Resend
* [x] Make GitHub repository public ✅
* [x] Create issue templates and contribution guidelines
* [x] Mobile responsiveness and UI improvements
* [x] Clean and finalize HA API structure
* [x] Public documentation and guides

---

## 📬 Feature Suggestions

We welcome ideas! Please create an [issue](https://github.com/rogasp/evlink-backend/issues) or start a [discussion](https://github.com/rogasp/evlink-backend/discussions) with your suggestions.

---

*This roadmap is a living document. Updated July 2025.*