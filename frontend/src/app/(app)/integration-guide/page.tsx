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
          <li>We support most major EV brands including: Tesla, BMW, Mercedes, Audi, VW, Skoda, Seat, Cupra, Polestar, Volvo, Hyundai, Kia, Nissan, Renault, Peugeot, Citroën, Opel, Ford, GM, and more</li>
          {/* Hardcoded string */}
          <li>After linking, click <strong>&quot;Copy ID&quot;</strong> to get the Vehicle ID (Not needed for HACS integration)</li>
        </ul>

        {/* Hardcoded string */}
        <h2 className="text-2xl font-semibold">4. Configure Home Assistant</h2>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded mb-4">
          <strong>⚠️ Migration Notice:</strong> The old API endpoint <code>api.evlinkha.se</code> will stop working on <strong>August 1st, 2025</strong>. Please migrate to <code>api.evlinkha.cloud</code> immediately.
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* HACS Installation Guide */}
        {/* ------------------------------------------------------------------ */}
        <div className='mt-16 border-t pt-6'>
          <h2 className='text-2xl font-semibold'>HACS Installation (Recommended)</h2>
          <p className='mt-2'>
            For the easiest integration, install EVLinkHA directly through Home Assistant Community Store (HACS):
          </p>          
          <ol className='list-decimal ml-6 space-y-2 mt-4'>
            <li>Open Home Assistant</li>
            <li>Go to <strong>HACS → Integrations</strong></li>
            <li>Search for <strong>&quot;EVLinkHA&quot;</strong></li>
            <li>If not found, add custom repository:</li>
            <ul className='list-disc ml-6'>
              <li>Click the three dots in top right of HACS</li>
              <li>Select <strong>&quot;Custom repositories&quot;</strong></li>
              <li>Enter: <code>https://github.com/rogasp/evlinkha-homeassistant</code></li>
              <li>Category: <strong>Integration</strong></li>
            </ul>
            <li>Install the integration</li>
            <li>Restart Home Assistant</li>
            <li>Go to <strong>Settings → Devices & Services</strong></li>
            <li>Add integration & search for <strong>&quot;EVLinkHA&quot;</strong></li>
            <li>Enter your API key and Vehicle ID</li>
          </ol>

          <div className='bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded mt-4'>
            <strong>✅ Benefits of HACS Installation:</strong>
            <ul className='list-disc ml-6 mt-2'>
              <li>No manual YAML configuration required</li>
              <li>Easy setup through UI</li>
              <li>Automatic updates</li>
              <li>Built-in error handling</li>
              <li>Webhook support for real-time updates (Pro tier)</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded">
          {/* Hardcoded string */}
          ⚠️ <strong>Rate limit recommendations:</strong>
          {/* Hardcoded string */}
          <p className="mt-1">
            <strong>Free tier</strong> (300 calls per 30 days): set <code>scan_interval</code> to at least <strong>9000</strong> seconds (2.5 hours).
          </p>
          {/* Hardcoded string */}
          <p>
            <strong>Pro tier</strong> (10,000 calls per 30 days): set <code>scan_interval</code> to at least <strong>300</strong> seconds (5 minutes).
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
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded mb-6">
          <strong>🚀 Pro Tier Webhook Feature:</strong>
          <p className="mt-1">
            Pro tier users can receive real-time webhook notifications directly to their Home Assistant instance. This eliminates the need for polling and provides instant updates when your vehicle&apos;s state changes.
          </p>
          <p className="mt-2">
            <strong>Setup:</strong> Configure webhook URL in your EVLinkHA profile settings. The HACS integration handles this automatically.
          </p>
        </div>
        {/* Hardcoded string */}
        <h2 className="text-xl font-semibold">Alternative to HACS component</h2>
        <h3 className="text-xl font-semibold">secrets.yaml</h3>
        <CodeBlock
          code={`evlink_api_key: "<API_CODE>"
evlink_status_url: "https://api.evlinkha.cloud/api/v1/ha/status/<VEHICLE_ID>"`}
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
      X-API-Key: !secret evlink_api_key
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
      X-API-Key: !secret evlink_api_key
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

        <h2 className="text-2xl font-semibold">6. Verify in Home Assistant</h2>
        <ul className="list-disc ml-6">
          {/* Hardcoded string */}
          <li>Go to <strong>Developer Tools → States</strong></li>
          {/* Hardcoded string */}
          <li>Search for <code>sensor.evlink_battery_level</code> etc.</li>
          {/* Hardcoded string */}
          <li>Ensure values update according to your tier allowance</li>
        </ul>
      </section>
    </main>
  );
}
