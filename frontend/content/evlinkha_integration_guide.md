# Connect Your Vehicle to EVLinkHA and Home Assistant

## 🚀 Step-by-step Instructions

### 1. 🔐 Create an Account
- Visit [https://evlinkha.se/register](https://evlinkha.se/register)
- Login via **Magic Link** (email) or **GitHub**
- You will be redirected to your dashboard after logging in
     
### 2. 🔑 Create API Key
- Go to **Profile**: [https://evlinkha.se/profile](https://evlinkha.se/profile)
- Click **"Create API Key"**
- Copy your API key – you’ll use it in Home Assistant's `secrets.yaml`

### 3. 🚗 Link Your Vehicle
- Go to **Dashboard**
- Click **"Link Vehicle"**
- Choose manufacturer (**XPENG** supported currently; more to come)
- You’ll be redirected to the manufacturer login
- Once linked, your vehicle will appear in the dashboard
- Click **"Copy ID"** to copy your vehicle ID for use in Home Assistant

### 4. 🏠 Configure Home Assistant

#### `secrets.yaml`:

```yaml
evlink_api_key: "Bearer <API_CODE>"
evlink_status_url: "https://evlinkha.se/api/status/<VEHICLE_ID>"
```

Replace `<API_CODE>` and `<VEHICLE_ID>` with your actual values.

#### `configuration.yaml`:

```yaml
sensor:
  - platform: rest
    name: "EVLink Location"
    unique_id: "evlink_vehicle_location"
    resource: !secret evlink_status_url
    method: GET
    headers:
      Authorization: !secret evlink_api_key
    value_template: "ok"
    scan_interval: 300
    json_attributes:
      - latitude
      - longitude

  - platform: rest
    name: "EVLink Vehicle"
    unique_id: "evlink_vehicle_sensor"
    resource: !secret evlink_status_url
    method: GET
    headers:
      Authorization: !secret evlink_api_key
    value_template: "{{ value_json.batteryLevel }}"
    unit_of_measurement: "%"
    scan_interval: 300
    json_attributes:
      - range
      - isCharging
      - isPluggedIn
      - chargingState
      - vehicleName

template:
  - sensor:
      - name: "EV Battery Level"
        unique_id: "evlink_battery_level"
        unit_of_measurement: "%"
        state: "{{ states('sensor.evlink_vehicle') }}"

      - name: "EV Battery Range"
        unique_id: "evlink_battery_range"
        unit_of_measurement: "km"
        state: "{{ state_attr('sensor.evlink_vehicle', 'range') }}"

      - name: "EV Charging State"
        unique_id: "evlink_charging_state"
        state: "{{ state_attr('sensor.evlink_vehicle', 'chargingState') }}"

      - name: "EV Vehicle Name"
        unique_id: "evlink_vehicle_name"
        state: "{{ state_attr('sensor.evlink_vehicle', 'vehicleName') }}"

  - binary_sensor:
      - name: "EV Is Charging"
        unique_id: "evlink_is_charging"
        state: "{{ state_attr('sensor.evlink_vehicle', 'isCharging') }}"
        device_class: battery_charging

      - name: "EV Is Plugged In"
        unique_id: "evlink_is_plugged_in"
        state: "{{ state_attr('sensor.evlink_vehicle', 'isPluggedIn') }}"
        device_class: plug
```

> ⚠️ **Important:** Do **not** change `scan_interval`. It must stay at `300` (5 minutes). Polling more frequently may trigger rate limiting.

### 5. ✅ Verify in Home Assistant
- Go to **Developer Tools → States**
- Look for: `sensor.evlink_battery_level`, `binary_sensor.ev_is_charging`, etc.
- You should see real-time values updating