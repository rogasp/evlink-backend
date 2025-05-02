import sqlite3
import json

DB_PATH = ".data/evlink.db"

def migrate_webhook_log():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        # Lägg till kolumner om de inte finns
        cursor.execute("PRAGMA table_info(webhook_log)")
        existing_cols = [row[1] for row in cursor.fetchall()]

        if "user_id" not in existing_cols:
            cursor.execute("ALTER TABLE webhook_log ADD COLUMN user_id TEXT")
        if "vehicle_id" not in existing_cols:
            cursor.execute("ALTER TABLE webhook_log ADD COLUMN vehicle_id TEXT")
        if "event" not in existing_cols:
            cursor.execute("ALTER TABLE webhook_log ADD COLUMN event TEXT")

        # Gå igenom alla rader och uppdatera fälten
        rows = cursor.execute("SELECT id, payload FROM webhook_log").fetchall()

        for row in rows:
            log_id, payload_json = row
            try:
                parsed = json.loads(payload_json)
                first = parsed[0] if isinstance(parsed, list) else parsed

                user_id = first.get("user", {}).get("id")
                vehicle_id = first.get("vehicle", {}).get("id")
                event = first.get("event")

                cursor.execute("""
                    UPDATE webhook_log
                    SET user_id = ?, vehicle_id = ?, event = ?
                    WHERE id = ?
                """, (user_id, vehicle_id, event, log_id))

            except Exception as e:
                print(f"⚠️  Skipping row {log_id}, parse failed: {e}")

        conn.commit()
        print("✅ Migration complete and data updated.")

if __name__ == "__main__":
    migrate_webhook_log()
