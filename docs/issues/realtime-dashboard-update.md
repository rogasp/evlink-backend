# ✅ Realtime vehicle update in dashboard

**Labels:** `enhancement`, `backlog`, `realtime`

When an update is received via a webhook for a vehicle, the dashboard should immediately reflect the updated vehicle data — without requiring a manual page reload.

**Suggested implementation:**
- Use WebSockets or HTMX-triggered refresh to update only the specific vehicle card.
- Highlight or animate updated content briefly for user feedback.
