### Feature: Real-time API Usage Updates via Supabase Realtime

### Problem Description

The current display of "API Calls" and "API Tokens" on the user profile page (`/profile`) is static and requires a page refresh to show updated usage. This provides a suboptimal user experience, as users cannot see their real-time consumption.

### Proposed Solution

Implement real-time updates for the "API Calls" and "API Tokens" metrics on the user profile page using Supabase Realtime. This will ensure that users always see their most current usage without manual refreshes.

### Technical Approach

1.  **Frontend (Next.js):**
    *   Modify the `UserInfoCard` (or a new sub-component within it) to subscribe to Supabase Realtime channels relevant to user API usage.
    *   Listen for changes in the `users` table (specifically `purchased_api_tokens`) and potentially a new `api_usage` table/view if created.
    *   Update the displayed "API Calls" and "API Tokens" values dynamically when a real-time event is received.
2.  **Backend (FastAPI/Supabase):**
    *   Ensure that API call logging (e.g., to `poll_logs` or a dedicated `api_usage` table) triggers Supabase Realtime events.
    *   Verify that `purchased_api_tokens` updates in the `users` table also trigger Realtime events.
    *   Consider creating a dedicated Supabase View or Function to aggregate real-time API call data if direct table changes are not sufficient or efficient.

### Acceptance Criteria

-   The "API Calls" counter on the profile page updates in real-time as the user makes API calls.
-   The "API Tokens" balance on the profile page updates in real-time when tokens are consumed or purchased.
-   No manual page refresh is required for these metrics to update.
-   The real-time updates are efficient and do not negatively impact frontend performance.

### Definition of Done (DOD)

-   Frontend components are subscribed to relevant Supabase Realtime channels.
-   API usage data (calls and tokens) updates dynamically on the profile page without refresh.
-   Backend logging of API calls and token consumption correctly triggers Supabase Realtime events.
-   Solution is scalable and maintains performance under load.
-   Relevant unit and integration tests are updated/added.
-   Documentation (if any new API endpoints or database structures are introduced) is updated.

### Labels

`feature`, `frontend`, `backend`, `realtime`, `supabase`, `priority: high`
