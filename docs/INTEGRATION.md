# Integration Guide

This guide shows how to configure EVLinkHA in Home Assistant using the REST integration via `secrets.yaml` and `configuration.yaml`.

## Prerequisites

* Home Assistant instance (Core, Container, or Supervised)
* EVLinkHA account with linked vehicle(s)

## 1. Configure `secrets.yaml`

Add your EVLinkHA API credentials and status URL:

```yaml
# secrets.yaml
evlink_api_key: "Bearer <API_CODE>"
evlink_status_url: "https://evlinkha.se/api/status/<VEHICLE_ID>"
```

* Replace `<API_CODE>` with the API key from your Profile.
* Replace `<VEHICLE_ID>` with the Vehicle ID you copied after linking.

## 2. Configure `configuration.yaml`

In your Home Assistant `configuration.yaml`, add the following under the appropriate sections:

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
    scan_interval: 300  # seconds
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

* Ensure **only** this approach is used—no alternative HA integrations or custom components.
* `scan_interval: 300` (5 minutes) to avoid rate limits.

## 3. Verify in Home Assistant

1. Restart Home Assistant.
2. Go to **Developer Tools > States**.
3. Search for your new entities:

   * `sensor.evlink_vehicle_location`
   * `sensor.evlink_vehicle_sensor`
   * `sensor.evlink_battery_range`
   * `binary_sensor.evlink_is_charging`
   * etc.

Ensure they update every 5 minutes.

---

*For more details, see [API Specification](docs/API_SPEC.md) and [Architecture](docs/ARCHITECTURE.md).*
