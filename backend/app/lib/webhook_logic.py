from app.storage.vehicle import save_vehicle_data_with_client

async def process_event(event: dict) -> int:
    event_type = event.get("event")
    print(f"[🔔 WEBHOOK] Event: {event_type}")

    if event_type == "system:heartbeat":
        print("💓 Heartbeat received")
        return 1

    if event_type in ["user:vehicle:discovered", "user:vehicle:updated"]:
        vehicle = event.get("vehicle")
        user = event.get("user", {})
        user_id = user.get("id")

        if vehicle and user_id:
            vehicle["userId"] = user_id
            print(f"[🚗 Saving vehicle] Vehicle ID: {vehicle.get('id')} User ID: {user_id}")
            await save_vehicle_data_with_client(vehicle)
            return 1
        else:
            print(f"[⚠️ Missing data] vehicle or user_id missing in event: {event}")
            return 0

    print(f"[⚠️ Unhandled event] type: {event_type}")
    return 0
