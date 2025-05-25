# Vehicle API and Storage

This document outlines how vehicle data is handled within the EVLink backend, focusing on caching, access control, and data flow.

---

## 🔐 Authentication

- All `/api/user/vehicles` endpoints require a valid Supabase access token (`Bearer <JWT>`) from Supabase Auth.
- The backend uses the token to create a Supabase client, which enforces Row Level Security (RLS).

---

## 📦 Storage Layer: `app/storage/vehicle.py`

### `get_all_cached_vehicles(user_id, supabase_client)`

Fetches all cached vehicle data for a specific user from the `vehicles` table.

- Requires a Supabase client with the user token.
- Returns a list of cached vehicle entries.
- Logs success and error messages for traceability.

### `save_vehicle_data_with_client(vehicle, supabase_client)`

Saves or updates a vehicle entry (cached) in the `vehicles` table.

- Uses `upsert()` with `vehicle_id` as the conflict key.
- Requires user ID and vehicle ID.
- Logs detailed info about saving process.

---

## 🧠 API Layer: `app/api/private.py`

### GET `/api/user/vehicles`

- Returns cached vehicles if they are fresh (within a defined expiration time).
- Otherwise fetches new data from Enode and updates the cache.
- Response contains either cached or fresh vehicles.
- Full logs of cache decision and DB update.

---

## 🔐 RLS Rules for `vehicles`

```sql
-- Select own vehicles
create policy "Users can view their own vehicles"
on vehicles
for select
using (auth.uid() = user_id);

-- Insert own vehicles
create policy "Users can insert vehicles"
on vehicles
for insert
with check (auth.uid() = user_id);

-- Update own vehicles
create policy "Users can update their own vehicles"
on vehicles
for update
using (auth.uid() = user_id);
```

---

## ℹ️ Notes

- Vehicle cache is stored as JSON string under column `vehicle_cache`.
- All timestamps are stored in UTC using ISO 8601 format.