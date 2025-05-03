import json
from datetime import datetime
from app.storage.db import supabase

def save_interest(name: str, email: str) -> None:
    try:
        created_at = datetime.utcnow().isoformat()

        res = supabase.table("interest_submissions").insert({
            "name": name,
            "email": email,
            "created_at": created_at
        }).execute()

        if not res.data:
            print(f"❌ save_interest() failed: {res}")
        else:
            print(f"✅ Interest from {email} saved successfully.")
    except Exception as e:
        print(f"❌ save_interest() exception: {e}")
