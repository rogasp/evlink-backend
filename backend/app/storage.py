import sqlite3
from pathlib import Path
import json
import hashlib
import uuid
import os

from datetime import datetime, timezone, timedelta
import secrets

# 📍 Database path setup
DATABASE_PATH = os.getenv("DATABASE_PATH", ".data/evlink.db")

DB_PATH = Path(DATABASE_PATH)

# 📂 Ensure the parent folder exists
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

# ============================
# 🚀 INIT: Skapa alla tabeller
# ============================

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        # Webhook-eventlogg
        conn.execute("""
            CREATE TABLE IF NOT EXISTS webhook_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                json TEXT NOT NULL
            )
        """)
        # Fordonsdata-cache
        conn.execute("""
            CREATE TABLE IF NOT EXISTS vehicle_cache (
                vehicle_id TEXT PRIMARY KEY,
                user_id TEXT,
                data TEXT,
                updated_at TEXT
            )
        """)
        # Länkade vendors per användare
        conn.execute("""
            CREATE TABLE IF NOT EXISTS linked_vendors (
                user_id TEXT,
                vendor TEXT,
                PRIMARY KEY (user_id, vendor)
            )
        """)
        conn.execute("""
                     CREATE TABLE IF NOT EXISTS api_keys (
                        key_id TEXT PRIMARY KEY,
                        user_id TEXT,
                        key_hash TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        active BOOLEAN DEFAULT 1,
                        FOREIGN KEY(user_id) REFERENCES users(user_id)
                    )
                     """)
        conn.execute("""
                     CREATE TABLE IF NOT EXISTS users
                     (
                         user_id
                         TEXT
                         PRIMARY
                         KEY,
                         email
                         TEXT,
                         hashed_password
                         TEXT,
                         created_at
                         TIMESTAMP
                         DEFAULT
                         CURRENT_TIMESTAMP
                     )
                     """)

        conn.commit()
    print("✅ Databasen initierad")

# ============================
# 💾 Fordonsdata
# ============================

def cache_vehicle_data(user_id: str, vehicle_id: str, data: str, updated_at: str):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO vehicle_cache (vehicle_id, user_id, data, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(vehicle_id) DO UPDATE SET
              data=excluded.data,
              updated_at=excluded.updated_at
            """,
            (vehicle_id,user_id, data, updated_at),
        )
        conn.commit()
    print(f"✅ Fordon {vehicle_id} cachades")

def get_cached_vehicle(vehicle_id: str):
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT data FROM vehicle_cache WHERE vehicle_id = ?",
            (vehicle_id,),
        ).fetchone()
        return row[0] if row else None

def get_all_cached_vehicles(user_id: str) -> list[dict]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT data, updated_at FROM vehicle_cache WHERE user_id = ?",
            (user_id,)
        ).fetchall()
        return [dict(row) for row in rows]

# ============================
# 🔗 Vendor-länkning
# ============================

def save_linked_vendor(user_id: str, vendor: str):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO linked_vendors (user_id, vendor) VALUES (?, ?)",
            (user_id, vendor)
        )
        conn.commit()
    print(f"🔗 Sparade länkad vendor: {user_id} → {vendor}")

# ============================
# 📥 Webhook-events
# ============================

def save_webhook_event(raw_json: dict):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO webhook_events (json) VALUES (?)",
            (json.dumps(raw_json),)
        )
    print("✅ Webhook-event sparat till DB")

def clear_webhook_events():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("DELETE FROM webhook_events")
        conn.commit()
    print("🗑️  Alla webhook-events rensade")

def is_recent(timestamp_str: str, minutes: int = 5) -> bool:
    """Returns True if the timestamp is within the last N minutes."""
    if not timestamp_str:
        return False
    try:
        ts = datetime.datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        return datetime.datetime.now(datetime.UTC) - ts < datetime.timedelta(minutes=minutes)
    except Exception as e:
        print(f"⚠️  Kunde inte tolka timestamp: {timestamp_str} – {e}")
        return False


def create_api_key_for_user(user_id: str) -> str:
    api_key = secrets.token_hex(32)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO api_keys (user_id, api_key) VALUES (?, ?)",
            (user_id, api_key)
        )
        conn.commit()
    print(f"🔑 Skapade API-nyckel för {user_id}")
    return api_key

def get_user_id_from_api_key(api_key: str) -> str | None:
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute("SELECT user_id FROM api_keys WHERE api_key = ?", (api_key,)).fetchone()
        return row[0] if row else None

def list_all_api_keys():
    with sqlite3.connect(DB_PATH) as conn:
        rows = conn.execute("SELECT user_id, api_key FROM api_keys").fetchall()
        return [{"user_id": row[0], "api_key": row[1]} for row in rows]


def create_user(user_id: str, email: str = None, hashed_password: str = None):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT OR IGNORE INTO users (user_id, email, hashed_password) VALUES (?, ?, ?)",
            (user_id, email, hashed_password),
        )
        conn.commit()


def get_user_by_email(email: str):
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT user_id, email, hashed_password, created_at FROM users WHERE email = ?",
            (email,)
        ).fetchone()
        return {
            "user_id": row[0],
            "email": row[1],
            "hashed_password": row[2],
            "created_at": row[3]
        } if row else None


def user_exists(user_id: str) -> bool:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            "SELECT 1 FROM users WHERE user_id = ? LIMIT 1",
            (user_id,)
        )
        return cursor.fetchone() is not None

def get_user(user_id: str):
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT user_id, email, created_at FROM users WHERE user_id = ?",
            (user_id,)
        ).fetchone()
        return {"user_id": row[0], "email": row[1], "created_at": row[2]} if row else None

def get_linked_vendors(user_id: str) -> list[str]:
    """
    Returnerar en lista med alla vendor-koder som användaren länkat till tidigare.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT vendor FROM linked_vendors WHERE user_id = ?
    """, (user_id,))
    result = cursor.fetchall()
    conn.close()
    return [row[0] for row in result]

def get_api_key_info(user_id: str):
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT key_id, created_at, active FROM api_keys WHERE user_id = ? AND active = 1",
            (user_id,)
        ).fetchone()

        if row:
            return {
                "key_id": row[0],
                "created_at": row[1],
                "active": bool(row[2])
            }
        else:
            return None


def generate_api_key():
    """Generate a secure random API key."""
    return secrets.token_urlsafe(32)

def hash_api_key(api_key: str) -> str:
    """Hash the API key before storing it."""
    return hashlib.sha256(api_key.encode()).hexdigest()

def create_api_key(user_id: str) -> str:
    """Creates a new API key for a user, deactivates old ones, returns new plain key."""
    new_key = generate_api_key()
    hashed_key = hash_api_key(new_key)
    key_id = str(uuid.uuid4())

    with sqlite3.connect(DB_PATH) as conn:
        # Inactivate old keys
        conn.execute(
            "UPDATE api_keys SET active = 0 WHERE user_id = ?",
            (user_id,)
        )

        # Insert new key as active
        conn.execute(
            """
            INSERT INTO api_keys (key_id, user_id, key_hash, active)
            VALUES (?, ?, ?, 1)
            """,
            (key_id, user_id, hashed_key)
        )

        conn.commit()

    return new_key  # Return the plain key so frontend can show it once


def update_user_email(user_id: str, new_email: str):
    """Updates the email for a specific user."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "UPDATE users SET email = ? WHERE user_id = ?",
            (new_email, user_id)
        )
        conn.commit()
        