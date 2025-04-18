# app/storage.py

import sqlite3
from pathlib import Path

DB_PATH = Path(".data/evlink.db")
DB_PATH.parent.mkdir(exist_ok=True)


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('''
        CREATE TABLE IF NOT EXISTS vehicle_cache (
            vehicle_id TEXT PRIMARY KEY,
            data TEXT,
            updated_at TEXT
        )
        ''')
        conn.commit()


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


def get_cached_vehicle(vehicle_id: str):
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT data FROM vehicle_cache WHERE vehicle_id = ?",
            (vehicle_id,),
        ).fetchone()
        return row[0] if row else None
