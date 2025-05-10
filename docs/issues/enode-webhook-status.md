# 🌐 Display and manage Enode webhook subscription status

**Labels:** `enhancement`, `backlog`, `admin`, `enode`

## Description

The system currently logs the Enode webhook subscription status and response to the console. This should be exposed in the admin interface so developers or admins can view and validate webhook setup without checking logs manually.

## Example log output

```
[📡 ENODE] Webhook subscription status: 200
[📡 ENODE] Webhook subscription response: {
  "id": "8616b84d-253d-4917-9a77-75c55bb71a78",
  "url": "https://95bcf61e0e04.ngrok.app/backend/api/webhook/enode",
  "apiVersion": null,
  "isActive": true,
  "lastSuccess": "2025-04-30T22:05:02.565Z",
  "createdAt": "2025-04-30T22:05:02.565Z",
  "events": ["user:vehicle:discovered", "user:vehicle:updated"],
  "authentication": null
}
```

## Suggested Feature

- Add a dedicated view in the admin panel to:
  - Display the current webhook subscription status
  - Show timestamps (`lastSuccess`, `createdAt`)
  - Show enabled events and target URL
- Include a "Refresh status" button that re-queries the Enode API
- Log errors clearly if subscription is not active

## Benefits

- Easier debugging and deployment validation
- Transparent insight into webhook configuration
- Faster onboarding for collaborators/admins
