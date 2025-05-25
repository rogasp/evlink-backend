# API Specification

This document describes the EVLinkHA HTTP API endpoints, request/response formats, and authentication requirements.

## Authentication

All API endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <API_KEY>
```

The API key is generated via the user profile and linked to your account.

---

## GET /me

Returns the authenticated user's profile and settings.

**Request**:

* Method: GET
* Headers: `Authorization: Bearer <API_KEY>`

**Response**:

```json
HTTP/1.1 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user",
  "approved": true,
  "name": "User Name",
  "accepted_terms": true,
  "online_status": "green",
  "notify_offline": false
}
```

---

## GET /api/vehicles

Lists all vehicles linked to the authenticated user.

**Request**:

* Method: GET
* Headers: `Authorization: Bearer <API_KEY>`

**Response**:

```json
HTTP/1.1 200 OK
[
  {
    "id": "vehicle-uuid",
    "vendor": "XPENG",
    "isReachable": true,
    "lastSeen": "2025-05-20T20:00:10.779Z",
    ...
  },
  ...
]
```

---

## GET /api/status/{vehicle\_id}

Returns detailed status data for a single vehicle.

**Request**:

* Method: GET
* Headers: `Authorization: Bearer <API_KEY>`
* Path Param: `vehicle_id` (UUID)

**Response**:

```json
HTTP/1.1 200 OK
{
  "id": "vehicle-uuid",
  "vendor": "XPENG",
  "isReachable": true,
  "lastSeen": "2025-05-20T20:00:10.779Z",
  "chargeState": {
    "batteryLevel": 18,
    "range": 98.28,
    ...
  },
  "location": {
    "latitude": 59.1438402,
    "longitude": 18.1394997
  },
  ...
}
```

---

## PATCH /api/user/{user\_id}

Updates user settings such as `accepted_terms` and `notify_offline`.

**Request**:

* Method: PATCH
* Headers: `Authorization: Bearer <API_KEY>`
* Path Param: `user_id` (UUID)
* Body:

  ```json
  {
    "accepted_terms": true,
    "notify_offline": true
  }
  ```

**Response**:

```json
HTTP/1.1 200 OK
{
  "id": "user-uuid",
  "notify_offline": true,
  ...
}
```

---

## DELETE /api/user/{user\_id}

Deletes a user account and all related data.

**Request**:

* Method: DELETE
* Headers: `Authorization: Bearer <API_KEY>`
* Path Param: `user_id` (UUID)

**Response**:

```json
HTTP/1.1 204 No Content
```

---

## Webhook Endpoint: POST /api/webhook

Receives events from Enode.

**Request**:

* Method: POST
* Headers: `Content-Type: application/json`
* Body: Raw JSON from Enode webhook

**Response**:

```json
HTTP/1.1 200 OK
{ "success": true }
```

For full details on webhook payload structure, see [Enode Webhook Docs](https://docs.enode.com).
