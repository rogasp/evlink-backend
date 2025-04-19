import sqlite3
from pathlib import Path
import json
from datetime import datetime, timezone, timedelta


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
