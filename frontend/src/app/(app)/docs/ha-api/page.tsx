'use client';

import { CodeBlock } from '@/components/CodeBlock';

export default function HAApiPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">EVLinkHA – Home Assistant API</h1>

      <section className="space-y-6">
        <p>
          This page documents the <code>/status/{'{vehicle_id}'}</code> endpoint of the EVLinkHA API,
          intended for use with REST sensors in Home Assistant.
        </p>

        <h2 className="text-2xl font-semibold mt-6">Endpoint</h2>
        <CodeBlock code="GET https://evlinkha.se/api/status/{vehicle_id}" language="http" />

        <h2 className="text-2xl font-semibold mt-6">Authentication</h2>
        <p>
          Requires a valid API key. Provide it in the <code>Authorization</code> header as:
        </p>
        <CodeBlock code={`Authorization: Bearer <your-api-key>`} language="http" />

        <h2 className="text-2xl font-semibold mt-6">Response Format</h2>
        <p>The response contains basic vehicle status along with a detailed <code>chargeState</code> object.</p>

        <details className="bg-gray-100 p-4 rounded border border-gray-300 text-sm leading-relaxed">
  <summary className="cursor-pointer font-medium mb-2">Example JSON response</summary>
  <pre className="mt-2 overflow-auto">
    <code>
{`{
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
}`}
    </code>
  </pre>
</details>


        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded">
          ⚠️ <strong>Note:</strong> The top-level keys like <code>batteryLevel</code>, <code>isCharging</code>,
          and <code>chargingState</code> are <strong>legacy</strong> and will be removed in a future version.
          Use the values inside <code>chargeState</code> instead.
        </div>

        <h2 className="text-2xl font-semibold mt-6">Field Reference</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><code>batteryLevel</code>: Battery percentage (0–100). [Legacy]</li>
          <li><code>range</code>: Estimated range in kilometers. [Legacy]</li>
          <li><code>isCharging</code>: Whether the vehicle is charging. [Legacy]</li>
          <li><code>isPluggedIn</code>: Whether the vehicle is plugged in. [Legacy]</li>
          <li><code>chargingState</code>: Charging state enum string. [Legacy]</li>
          <li><code>vehicleName</code>: Formatted name like &quotXPENG G6&quot.</li>
          <li><code>latitude</code> / <code>longitude</code>: Last known location coordinates.</li>
          <li><code>lastSeen</code>: ISO timestamp of last contact.</li>
          <li><code>isReachable</code>: Whether the vehicle is reachable.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6">chargeState object</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><code>batteryLevel</code>: Current battery percentage.</li>
          <li><code>range</code>: Estimated driving range in kilometers.</li>
          <li><code>isCharging</code>: Whether the vehicle is actively charging.</li>
          <li><code>isPluggedIn</code>: Whether the vehicle is physically connected to a charger.</li>
          <li><code>isFullyCharged</code>: Whether the battery is fully charged.</li>
          <li><code>batteryCapacity</code>: Total battery capacity in kWh.</li>
          <li><code>chargeRate</code>: Current charging rate in kW (may be null).</li>
          <li><code>chargeLimit</code>: Configured charge limit (%) (may be null).</li>
          <li><code>chargeTimeRemaining</code>: Minutes remaining to full charge (may be null).</li>
          <li><code>maxCurrent</code>: Max current in amps (may be null).</li>
          <li><code>lastUpdated</code>: Timestamp when this data block was last updated.</li>
          <li><code>powerDeliveryState</code>: See detailed description below.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6">chargeState.powerDeliveryState</h3>
        <p>The current state of power delivery between the vehicle and charger:</p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><code>UNKNOWN</code>: The state of power delivery is currently unknown.</li>
          <li><code>UNPLUGGED</code>: The vehicle is not connected to the charger.</li>
          <li><code>PLUGGED_IN:INITIALIZING</code>: The charging station is preparing to deliver power to the vehicle.</li>
          <li><code>PLUGGED_IN:CHARGING</code>: The vehicle is actively receiving power, increasing the battery level.</li>
          <li><code>PLUGGED_IN:COMPLETE</code>: Charging has finished and the battery has reached the target limit.</li>
          <li><code>PLUGGED_IN:STOPPED</code>: Charging was intentionally stopped. The vehicle remains plugged in.</li>
          <li><code>PLUGGED_IN:NO_POWER</code>: Charging failed due to unavailable power. User intervention is required.</li>
          <li><code>PLUGGED_IN:FAULT</code>: A malfunction is preventing charging (e.g., cable issue, temperature, system error).</li>
          <li><code>PLUGGED_IN:DISCHARGING</code>: The vehicle is discharging energy to the grid or home (V2G/V2H).</li>
        </ul>
      </section>
    </main>
  );
}
