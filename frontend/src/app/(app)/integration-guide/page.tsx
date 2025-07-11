'use client';

import { CodeBlock } from '@/components/CodeBlock';

export default function IntegrationGuidePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      {/* Hardcoded string */}
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">EVLinkHA Integration Guide</h1>

      <section className="space-y-6">
        {/* Hardcoded string */}
        <p>Follow these steps to connect your EV to EVLinkHA and Home Assistant.</p>

        {/* Hardcoded string */}
        <h2 className="text-2xl font-semibold">1. Create an Account</h2>
        <ul className="list-disc ml-6">
          {/* Hardcoded string */}
          <li>Go to <a href="https://evlinkha.se/register" className="text-blue-600 underline">evlinkha.se/register</a></li>
          {/* Hardcoded string */}
          <li>Log in using Magic Link or GitHub</li>
        </ul>

        {/* Hardcoded string */}
        <h2 className="text-2xl font-semibold">2. Create API Key</h2>
        <ul className="list-disc ml-6">
          {/* Hardcoded string */}
          <li>Go to your <a href="https://evlinkha.se/profile" className="text-blue-600 underline">Profile</a></li>
          {/* Hardcoded string */}
          <li>Click <strong>&quot;Create API Key&quot;</strong> and copy the key</li>
        </ul>

        {/* Hardcoded string */}
        <h2 className="text-2xl font-semibold">3. Link Your Vehicle</h2>
        <ul className="list-disc ml-6">
          {/* Hardcoded string */}
          <li>Go to the Dashboard</li>
          {/* Hardcoded string */}
          <li>Click <strong>&quot;Link Vehicle&quot;</strong> and follow the manufacturer&apos;s login</li>
          {/* Hardcoded string */}
          <li>Currently, only XPENG is supported. More brands will follow.</li>
          {/* Hardcoded string */}
          <li>After linking, click <strong>&quot;Copy ID&quot;</strong> to get the Vehicle ID</li>
        </ul>

        {/* Hardcoded string */}
        <h2 className="text-2xl font-semibold">4. Configure Home Assistant</h2>

        {/* Hardcoded string */}
        <h3 className="text-xl font-semibold">secrets.yaml</h3>
        <CodeBlock
          code={`evlink_api_key: "Bearer <API_CODE>"
evlink_status_url: "https://evlinkha.se/api/status/<VEHICLE_ID>"`}
        />

        {/* Hardcoded string */}
        <h3 className="text-xl font-semibold">configuration.yaml</h3>
        <CodeBlock
          code={`sensor:
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
        device_class: plug`}
          language="yaml"
        />

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded">
          {/* Hardcoded string */}
          ⚠️ <strong>Rate limit recommendations:</strong>
          {/* Hardcoded string */}
          <p className="mt-1">
            <strong>Free tier</strong> (3 calls per 30 min): set <code>scan_interval</code> to at least <strong>600</strong> seconds.
          </p>
          {/* Hardcoded string */}
          <p>
            <strong>Pro tier</strong> (60 calls per min; soon ~10 calls/min/vehicle): set <code>scan_interval</code> to at least <strong>60</strong> seconds.
          </p>
          {/* Hardcoded string */}
          <p className="mt-2">
            Choose the interval that matches your subscription to avoid hitting rate limits.
          </p>
          {/* Hardcoded string */}
          <p>
            If you exceed these limits, the API will return a <code>429 Too Many Requests</code> response.
          </p>
        </div>


        {/* Hardcoded string */}
        <h2 className="text-2xl font-semibold">5. Verify in Home Assistant</h2>
        <ul className="list-disc ml-6">
          {/* Hardcoded string */}
          <li>Go to <strong>Developer Tools → States</strong></li>
          {/* Hardcoded string */}
          <li>Search for <code>sensor.evlink_battery_level</code> etc.</li>
          {/* Hardcoded string */}
          <li>Ensure values update every 5 minutes</li>
        </ul>
      </section>
    </main>
  );
}
