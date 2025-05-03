# Storage Module – evlink-backend

This folder contains all logic for interacting with Supabase storage (PostgreSQL).

## Structure

- `db.py`: Connects to Supabase using credentials from `.env`.
- `user.py`: Functions for user creation, lookup, and updates.
- `apikey.py`: Manages API key creation and retrieval for users.
- `vehicle.py`: Handles caching and retrieval of vehicle data.
- `webhook.py`: Stores webhook events for logging/debugging.

## How to Use

Each module exposes functions that interact with specific tables.
Example usage:

```python
from app.storage.user import create_user

user = create_user(name="Alice", email="alice@example.com")

Supabase credentials must be available as environment variables:

SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=your_anon_or_service_role_key

Tables in Supabase
These tables must exist in your Supabase instance:

users

apikeys

vehicles

webhook_logs

See app/storage/README.md or Supabase SQL Editor for table definitions.

