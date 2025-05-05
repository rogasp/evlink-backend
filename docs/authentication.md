# Authentication and API Key Management

This document describes how authentication and authorization are handled in the EVLink backend using Supabase and FastAPI.

## 🔐 Supabase Authentication Flow

- Frontend (Next.js) authenticates users via Supabase using GitHub or magic link.
- The frontend receives an access token (JWT) and passes it as a Bearer token to the FastAPI backend.
- The backend verifies the JWT using `SUPABASE_JWT_SECRET`.
- Role and user ID are extracted from the token and used for authorization and RLS enforcement.

## 🧪 Verified Token Handling

The following helper is used:
```python
@router.get("/api/user/vehicles")
async def get_user_vehicles(user=Depends(get_supabase_user)):
```

### `get_supabase_user()`
- Verifies Bearer token
- Extracts `user_id`, `email`, `role`
- Returns dict for further use

---

## 🔑 API Key Endpoints

| Method | Endpoint                                 | Auth Required | Description                      |
|--------|------------------------------------------|---------------|----------------------------------|
| POST   | `/api/users/{user_id}/apikey`            | ✅ Yes        | Creates a new API key            |
| GET    | `/api/users/{user_id}/apikey`            | ✅ Yes        | Gets metadata of active API key |

### Behavior
- On creation, all old keys for the user are deactivated
- Only one `active=True` key is allowed at a time

---

## 🔐 Supabase RLS Policy for `api_keys`

### Insert
```sql
CREATE POLICY "Allow user to insert own api_key"
ON api_keys
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Update (to deactivate)
```sql
CREATE POLICY "Allow user to deactivate own api_key"
ON api_keys
FOR UPDATE
USING (
  auth.uid() = user_id AND
  active = false
);
```

### Read/Delete
No policy exists → only backend system or admin via service role key can access these.

---

## 🔍 Logging Example

```
🔑 Creating API key for user: 671043ea-955c-4f57-aba5-4c71a0348412
[🔄 create_api_key] Deactivating old keys for user_id: ...
[📤 insert] Storing new key with ID: ...
✅ API key created for user: ...
```