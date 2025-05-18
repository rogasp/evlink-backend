'use client';

import { CodeBlock } from '@/components/CodeBlock';

export default function IntegrationGuidePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">EVLinkHA Integration Guide</h1>

      <section className="space-y-6">
        <p>Follow these steps to connect your EV to EVLinkHA and Home Assistant.</p>

        <h2 className="text-2xl font-semibold">1. Create an Account</h2>
        <ul className="list-disc ml-6">
          <li>Go to <a href="https://evlinkha.se/register" className="text-blue-600 underline">evlinkha.se/register</a></li>
          <li>Log in using Magic Link or GitHub</li>
        </ul>

        <h2 className="text-2xl font-semibold">2. Create API Key</h2>
        <ul className="list-disc ml-6">
          <li>Go to your <a href="https://evlinkha.se/profile" className="text-blue-600 underline">Profile</a></li>
          <li>Click <strong>&quot;Create API Key&quot;</strong> and copy the key</li>
        </ul>

        <h2 className="text-2xl font-semibold">3. Link Your Vehicle</h2>
        <ul className="list-disc ml-6">
          <li>Go to the Dashboard</li>
          <li>Click <strong>&quot;Link Vehicle&quot;</strong> and follow the manufacturer&apos;s login</li>
          <li>Currently, only XPENG is supported. More brands will follow.</li>
          <li>After linking, click <strong>&quot;Copy ID&quot;</strong> to get the Vehicle ID</li>
        </ul>

        <h2 className="text-2xl font-semibold">4. Configure Home Assistant</h2>

        <h3 className="text-xl font-semibold">secrets.yaml</h3>
        <CodeBlock
          code={`evlink_api_key: "Bearer <API_CODE>"
evlink_status_url: "https://evlinkha.se/api/status/<VEHICLE_ID>"`}
        />

        <h3 className="text-xl font-semibold">configuration.yaml</h3>
        <CodeBlock
          code={`sensor:
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
        state: "{{ states('sensor.evlink_vehicle') }}"`}
          language="yaml"
        />

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded">
          ⚠️ <strong>Important:</strong> Do <em>not</em> change <code>scan_interval</code> – it must stay at <strong>300</strong> seconds to avoid rate limits.
        </div>

        <h2 className="text-2xl font-semibold">5. Verify in Home Assistant</h2>
        <ul className="list-disc ml-6">
          <li>Go to <strong>Developer Tools → States</strong></li>
          <li>Search for <code>sensor.evlink_battery_level</code> etc.</li>
          <li>Ensure values update every 5 minutes</li>
        </ul>
      </section>
    </main>
  );
}
