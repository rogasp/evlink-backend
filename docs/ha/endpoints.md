# EVLinkHA API: `GET /status/{vehicle_id}`

Returns the current status of a specific vehicle, including charging state, location, and connectivity.

## 🔐 Authentication
- Requires a valid **API key**
- Only vehicles belonging to the authenticated user can be accessed

## ✅ Response Fields

### Legacy root-level fields *(to be deprecated)*
| Field           | Type     | Description                                                |
|----------------|----------|------------------------------------------------------------|
| `batteryLevel` | number   | Battery percentage of the vehicle                         |
| `range`        | number   | Estimated range in kilometers                             |
| `isCharging`   | boolean  | Whether the vehicle is currently charging                 |
| `isPluggedIn`  | boolean  | Whether the vehicle is physically plugged in              |
| `chargingState`| string   | Charging state (e.g. `CHARGING`, `UNPLUGGED`)             |
| `vehicleName`  | string   | Human-readable name (brand + model)                       |
| `latitude`     | number   | Last known latitude                                        |
| `longitude`    | number   | Last known longitude                                       |
| `lastSeen`     | string   | ISO timestamp of last contact with vehicle                |
| `isReachable`  | boolean  | Whether the vehicle is currently reachable                |

> ⚠️ **Note:** These fields will be removed in a future version. Use `chargeState` instead.

---

### 🔋 `chargeState` object *(recommended)*

| Field                 | Type         | Description                                                 |
|----------------------|--------------|-------------------------------------------------------------|
| `batteryLevel`       | number       | Battery percentage of the vehicle                          |
| `range`              | number       | Estimated range in kilometers                              |
| `isCharging`         | boolean      | Whether charging is active                                 |
| `isPluggedIn`        | boolean      | Whether the vehicle is plugged in                          |
| `isFullyCharged`     | boolean      | Whether the battery is full                                |
| `batteryCapacity`    | number       | Battery capacity in kWh                                    |
| `chargeRate`         | number/null  | Current charging rate in kW                                |
| `chargeLimit`        | number/null  | Configured charge limit in %                               |
| `chargeTimeRemaining`| number/null  | Estimated time to full charge in minutes                   |
| `maxCurrent`         | number/null  | Maximum allowed current (A)                                |
| `powerDeliveryState` | string       | Power state (e.g. `CHARGING`, `UNPLUGGED`, etc.)           |
| `lastUpdated`        | string       | ISO timestamp of last update of this data block            |

## 🧪 Example Response
```json
{
  "batteryLevel": 18,
  "range": 98.28,
  "isCharging": false,
  "isPluggedIn": false,
  "chargingState": "UNPLUGGED",
  "vehicleName": "XPENG G6",
  "latitude": 59.1438402,
  "longitude": 18.1394997,
  "lastSeen": "2025-05-20T15:48:12.933Z",
  "isReachable": true,
  "chargeState": {
    "chargeRate": null,
    "chargeTimeRemaining": null,
    "isFullyCharged": false,
    "isPluggedIn": false,
    "isCharging": false,
    "batteryLevel": 18,
    "range": 98.28,
    "batteryCapacity": 91,
    "chargeLimit": null,
    "lastUpdated": "2025-05-13T14:15:29.717Z",
    "powerDeliveryState": "UNPLUGGED",
    "maxCurrent": null
  }
}
```

---

## 🚧 Deprecation Notice

Fields at the root level (e.g. `batteryLevel`, `range`) are considered **legacy** and will be removed after the transition period. Use `chargeState` for all new integrations.

## 🏁 Usage with Home Assistant
Refer to the [Integration Guide](/docs/integration-guide) for examples on how to configure `rest` and `template` sensors.
