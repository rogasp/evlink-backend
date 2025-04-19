import sqlite3
from pathlib import Path
import json
from datetime import datetime, timezone, timedelta
import secrets



# 📍 Databasens sökväg
DB_PATH = Path(".data/evlink.db")
DB_PATH.parent.mkdir(exist_ok=True)

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
                     CREATE TABLE IF NOT EXISTS api_keys
                     (
                         user_id
                         TEXT
                         PRIMARY
                         KEY,
                         api_key
                         TEXT
                         NOT
                         NULL
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

def cache_vehicle_data(vehicle_id: str, data: str, updated_at: str):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO vehicle_cache (vehicle_id, data, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(vehicle_id) DO UPDATE SET
              data=excluded.data,
              updated_at=excluded.updated_at
            """,
            (vehicle_id, data, updated_at),
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

def get_all_cached_vehicles():
    with sqlite3.connect(DB_PATH) as conn:
        rows = conn.execute("SELECT data FROM vehicle_cache").fetchall()
        return [row[0] for row in rows]

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

def is_recent(timestamp: str, max_age_minutes: int = 5) -> bool:
    try:
        updated_time = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        return (now - updated_time) < timedelta(minutes=max_age_minutes)
    except Exception as e:
        print(f"⚠️  Kunde inte tolka timestamp: {timestamp} – {e}")
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


def create_user(user_id: str, email: str = None):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT OR IGNORE INTO users (user_id, email) VALUES (?, ?)",
            (user_id, email),
        )
        conn.commit()

def get_user(user_id: str):
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT user_id, email, created_at FROM users WHERE user_id = ?",
            (user_id,)
        ).fetchone()
        return {"user_id": row[0], "email": row[1], "created_at": row[2]} if row else None
