# RLS Policies for Supabase Tables

This document outlines the Row-Level Security (RLS) policies applied to the Supabase tables used by the EVLink backend.

## ✅ General Principles

- **RLS must be enabled** on all tables that store user-specific or vehicle-specific data.
- **Users should only be able to access their own data**, based on `user_id` linkage.
- Policies should follow the least privilege principle and allow only the required operations (SELECT, INSERT, UPDATE, DELETE).

---

## ✅ Enabled Tables & Policies

### `users`
- **RLS Enabled:** ✅
- **Policy:**
  - Allow `SELECT`, `UPDATE` where `id = auth.uid()`

### `vehicles`
- **RLS Enabled:** ❌ (to be implemented)
- **Planned Policy:**
  - Allow `SELECT`, `UPDATE`, `DELETE` where `user_id = auth.uid()`
  - Allow `INSERT` where `user_id = auth.uid()`

### `webhook_logs`
- **RLS Enabled:** ❌ (to be implemented)
- **Planned Policy:**
  - Allow `SELECT` where `user_id = auth.uid()`
  - Allow `INSERT` (optional: only from specific service roles)

### `api_keys`
- **RLS Enabled:** ❌ (to be implemented)
- **Planned Policy:**
  - Allow `SELECT`, `UPDATE`, `DELETE` where `user_id = auth.uid()`
  - Allow `INSERT` where `user_id = auth.uid()`

### `vendor_links`
- **RLS Enabled:** ❌ (to be implemented)
- **Planned Policy:**
  - Allow `SELECT`, `INSERT`, `DELETE` where `user_id = auth.uid()`

---

## 🔐 Notes

- For service-to-service inserts (e.g., webhook handlers), consider using **Supabase service roles** with `Bearer` tokens and bypass RLS if necessary.
- Always test RLS with both valid and invalid users to verify isolation.

---

_Last updated: 2025-05-03_
