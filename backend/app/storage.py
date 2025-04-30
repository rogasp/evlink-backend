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
        conn.execute("""
            CREATE TABLE IF NOT EXISTS webhook_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                payload TEXT NOT NULL
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

def save_vehicle_data(vehicle: dict):
    vehicle_id = vehicle.get("id")
    user_id = vehicle.get("userId")
    if not vehicle_id or not user_id:
        print("[⚠️] Invalid vehicle object:", vehicle)
        return

    cached_str = get_cached_vehicle(vehicle_id)
    if cached_str:
        try:
            cached = json.loads(cached_str)
            if not is_newer_data(vehicle, cached):
                print(f"⚠️ Webhook-data för {vehicle_id} är äldre – cache uppdateras ej.")
                return
        except Exception as e:
            print(f"⚠️ Fel vid tolkning av cache: {e}")

    updated_at = vehicle.get("chargeState", {}).get("lastUpdated") or vehicle.get("lastSeen") or datetime.utcnow().isoformat()
    data_str = json.dumps(vehicle)

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO vehicle_cache (vehicle_id, user_id, data, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(vehicle_id) DO UPDATE SET
              data=excluded.data,
              updated_at=excluded.updated_at
            """,
            (vehicle_id, user_id, data_str, updated_at)
        )
        conn.commit()
    print(f"✅ Vehicle {vehicle_id} updated in cache")

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
        
    vehicle_id = vehicle.get("id")
    user_id = vehicle.get("userId")  # Enodes fält för användar-ID
    data = json.dumps(vehicle)
    updated_at = datetime.utcnow().isoformat()

    if not vehicle_id or not user_id:
        print("[⚠️] Invalid vehicle object:", vehicle)
        return

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO vehicle_cache (vehicle_id, user_id, data, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(vehicle_id) DO UPDATE SET
              data=excluded.data,
              updated_at=excluded.updated_at
            """,
            (vehicle_id, user_id, data, updated_at)
        )
        conn.commit()
    print(f"✅ Vehicle {vehicle_id} updated in cache")

def get_webhook_logs(limit: int = 50, event_filter: str | None = None) -> list[dict]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        if event_filter:
            rows = conn.execute(
                """
                SELECT id, timestamp, event, user_id, vehicle_id, payload
                FROM webhook_log
                WHERE event = ?
                ORDER BY timestamp DESC
                LIMIT ?
                """,
                (event_filter, limit)
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT id, timestamp, event, user_id, vehicle_id, payload
                FROM webhook_log
                ORDER BY timestamp DESC
                LIMIT ?
                """,
                (limit,)
            ).fetchall()

        return [dict(row) for row in rows]
    
def save_webhook_event(payload: dict | list):
    timestamp = datetime.utcnow().isoformat()

    # Extrahera metadata
    try:
        parsed = payload[0] if isinstance(payload, list) else payload
        user_id = parsed.get("user", {}).get("id")
        vehicle_id = parsed.get("vehicle", {}).get("id")
        event = parsed.get("event")
    except Exception as e:
        print(f"⚠️  Failed to extract metadata from webhook payload: {e}")
        user_id = vehicle_id = event = None

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO webhook_log (timestamp, payload, user_id, vehicle_id, event)
            VALUES (?, ?, ?, ?, ?)
            """,
            (timestamp, json.dumps(payload), user_id, vehicle_id, event)
        )
        conn.commit()
    print("✅ Webhook event saved")

def is_newer_data(incoming: dict, cached: dict) -> bool:
    """
    Return True if the incoming vehicle data is newer than the cached data.
    Compares chargeState.lastUpdated or lastSeen timestamps.
    """
    try:
        incoming_ts = incoming.get("chargeState", {}).get("lastUpdated") or incoming.get("lastSeen")
        cached_ts = cached.get("chargeState", {}).get("lastUpdated") or cached.get("lastSeen")

        if not incoming_ts or not cached_ts:
            return True  # Saknar tidpunkt → vi sparar hellre än att tappa data

        dt_incoming = datetime.fromisoformat(incoming_ts.replace("Z", "+00:00"))
        dt_cached = datetime.fromisoformat(cached_ts.replace("Z", "+00:00"))

        return dt_incoming > dt_cached
    except Exception as e:
        print(f"⚠️ Failed to compare timestamps: {e}")
        return True  # För säkerhets skull – spara ändå om något går fel
