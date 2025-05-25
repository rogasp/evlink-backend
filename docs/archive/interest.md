# Interest Form Submissions

This document describes how we handle anonymous interest submissions from unauthenticated users.

---

## 🧠 API Layer: `app/api/public.py`

### POST `/api/interest`

- Accepts `name` and `email`.
- Saves the data in Supabase via `save_interest(...)`.
- Open to the public — no authentication required.
- Returns a thank-you message or error.

---

## 📦 Storage Layer: `app/storage/interest.py`

### `save_interest(name: str, email: str)`

- Inserts a new row into the `interest` table.
- Uses the Supabase service client (admin privileges).
- Logs the request and any errors.

---

## 🔐 RLS Rules for `interest`

```sql
-- Anyone can submit interest
create policy "Allow all to insert"
on interest
for insert
with check (true);

-- Only admin/system can read/update/delete
create policy "Allow admin/system to manage"
on interest
for select, update, delete
using (
  auth.role() = 'service_role'
  or auth.jwt() ->> 'role' = 'admin'
);
```

---

## 📁 Notes

- `interest` table contains: `id`, `name`, `email`, `created_at`.
- Used to gauge early interest before registration is enabled.