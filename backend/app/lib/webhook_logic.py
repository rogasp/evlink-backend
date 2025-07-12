import logging
from app.storage.vehicle import save_vehicle_data_with_client

logger = logging.getLogger(__name__)

async def process_event(event: dict) -> int:
    """Processes an incoming webhook event and dispatches it to appropriate handlers."""
    event_type = event.get("event")
    logger.info(f"[🔔 WEBHOOK] Event: {event_type}")

    if event_type == "system:heartbeat":
        logger.info("💓 Heartbeat received")
        return 1

    if event_type in ["user:vehicle:discovered", "user:vehicle:updated"]:
        vehicle = event.get("vehicle")
        user = event.get("user", {})
        user_id = user.get("id")

        if vehicle and user_id:
            vehicle["userId"] = user_id
            logger.info(f"[🚗 Saving vehicle] Vehicle ID: {vehicle.get('id')} User ID: {user_id}")
            await save_vehicle_data_with_client(vehicle)
            return 1
        else:
            logger.warning(f"[⚠️ Missing data] vehicle or user_id missing in event: {event}")
            return 0

    logger.warning(f"[⚠️ Unhandled event] type: {event_type}")
    return 0