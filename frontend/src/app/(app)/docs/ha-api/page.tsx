// src/app/(app)/docs/ha-api/page.tsx
'use client';

import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { Badge } from '@/components/ui/badge';

export default function HAApiPage() {
  return (
    <main className='max-w-3xl mx-auto px-6 py-12'>
      {/* Hardcoded string */}
      <h1 className='text-3xl font-bold text-indigo-700 mb-6'>
        EVLinkHA – Home Assistant API
      </h1>

      <section className='space-y-6'>
        {/* Hardcoded string */}
        <p>
          This page documents the <code>/status/{'{vehicle_id}'}</code> endpoint of the
          EVLinkHA API, intended for use with REST sensors in Home Assistant.
        </p>

        {/* Hardcoded string */}
        <div className='bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded mb-4'>
          <strong>⚠️ Migration Notice:</strong> The old API endpoint <code>api.evlinkha.se</code> will stop working on <strong>August 1st, 2025</strong>. Please migrate to <code>api.evlinkha.cloud</code> immediately.
        </div>

        <h2 className='text-2xl font-semibold mt-6'>Endpoint</h2>
        <CodeBlock code='GET https://api.evlinkha.cloud/api/v1/ha/status/{vehicle_id}' language='http' />

        {/* Hardcoded string */}
        <h2 className='text-2xl font-semibold mt-6'>Authentication</h2>
        {/* Hardcoded string */}
        <p>
          Requires a valid API key. Provide it in the <code>X-API-Key</code> header as:
        </p>
        <CodeBlock code={'X-API-Key: <your-api-key>'} language='http' />

        {/* Hardcoded string */}
        <h2 className='text-2xl font-semibold mt-6'>Response Format</h2>
        {/* Hardcoded string */}
        <p>
          The response contains comprehensive vehicle status with real-time data from your EV.
        </p>

        <details className='bg-gray-100 p-4 rounded border border-gray-300 text-sm leading-relaxed'>
          {/* Hardcoded string */}
          <summary className='cursor-pointer font-medium mb-2'>
            Example JSON response
          </summary>
          <pre className='mt-2 overflow-auto'>
            <code>
{`{
  "vehicleId": "331c054f-b583-4284-b7b0-ce348c0a66fc",
  "enodeVehicleId": "9801efc6-2d23-4fc5-bdc6-ba40b4e25e55",
  "latitude": null,
  "longitude": null,
  "lastSeen": "2025-07-25T08:16:52.043000Z",
  "isReachable": true,
  "chargeState": {
    "chargeRate": null,
    "chargeTimeRemaining": null,
    "isFullyCharged": false,
    "isPluggedIn": false,
    "isCharging": false,
    "batteryLevel": 25,
    "range": 136.5,
    "batteryCapacity": 91.0,
    "chargeLimit": 90,
    "lastUpdated": "2025-07-21T20:58:02.419000Z",
    "powerDeliveryState": "UNPLUGGED",
    "maxCurrent": null
  },
  "information": {
    "displayName": null,
    "vin": "6X3AJP0L7TVE11501",
    "brand": "XPENG",
    "model": "G6",
    "year": 2025
  },
  "location": {
    "id": null,
    "latitude": 59.1438402,
    "longitude": 18.1394997,
    "lastUpdated": "2025-05-13T14:48:17.812000Z"
  },
  "odometer": {
    "distance": 897.0,
    "lastUpdated": "2025-06-13T16:13:34.068000Z"
  },
  "vendor": "XPENG",
  "smartChargingPolicy": {
    "deadline": null,
    "isEnabled": false,
    "minimumChargeLimit": 0
  },
  "capabilities": {
    "information": {
      "interventionIds": [],
      "isCapable": true
    },
    "chargeState": {
      "interventionIds": [],
      "isCapable": true
    },
    "location": {
      "interventionIds": [],
      "isCapable": true
    },
    "odometer": {
      "interventionIds": [],
      "isCapable": false
    },
    "setMaxCurrent": {
      "interventionIds": [],
      "isCapable": true
    },
    "startCharging": {
      "interventionIds": [],
      "isCapable": true
    },
    "stopCharging": {
      "interventionIds": [],
      "isCapable": true
    },
    "smartCharging": {
      "isCapable": true,
      "interventionIds": []
    }
  }
}`}
            </code>
          </pre>
        </details>

        <div className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded'>
          {/* Hardcoded string */}
          ⚠️ <strong>Note:</strong> The top-level keys like <code>batteryLevel</code>,{' '}
          <code>isCharging</code>, and <code>chargingState</code> are <strong>legacy</strong> and
          {/* Hardcoded string */}
          will be removed in a future version. Use the values inside <code>chargeState</code>{' '}
          {/* Hardcoded string */}
          instead.
        </div>

        {/* Hardcoded string */}
        <h2 className='text-2xl font-semibold mt-6'>Field Reference</h2>
        <ul className='list-disc ml-6 space-y-2'>
          {/* Hardcoded string */}
          <li>
            <code>batteryLevel</code>: Battery percentage (0–100). [Legacy]
          </li>
          {/* Hardcoded string */}
          <li>
            <code>range</code>: Estimated range in kilometers. [Legacy]
          </li>
          {/* Hardcoded string */}
          <li>
            <code>isCharging</code>: Whether the vehicle is charging. [Legacy]
          </li>
          {/* Hardcoded string */}
          <li>
            <code>isPluggedIn</code>: Whether the vehicle is plugged in. [Legacy]
          </li>
          {/* Hardcoded string */}
          <li>
            <code>chargingState</code>: Charging state enum string. [Legacy]
          </li>
          {/* Hardcoded string */}
          <li>
            <code>vehicleName</code>: Formatted name like &quot;XPENG G6&quot;.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>latitude</code> / <code>longitude</code>: Last known location coordinates.
            [Legacy]
          </li>
          {/* Hardcoded string */}
          <li>
            <code>lastSeen</code>: ISO timestamp of last contact.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>isReachable</code>: Whether the vehicle is reachable.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>capabilities</code>: A collection of descriptors that describe the capabilities of this specific vehicle.
          </li>
        </ul>

        {/* Hardcoded string */}
        <h3 className='text-xl font-semibold mt-6'>chargeState object</h3>
        <ul className='list-disc ml-6 space-y-2'>
          {/* Hardcoded string */}
          <li>
            <code>batteryLevel</code>: Current battery percentage.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>range</code>: Estimated driving range in kilometers.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>isCharging</code>: Whether the vehicle is actively charging.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>isPluggedIn</code>: Whether the vehicle is physically connected to a charger.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>isFullyCharged</code>: Whether the battery is fully charged.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>batteryCapacity</code>: Total battery capacity in kWh.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>chargeRate</code>: Current charging rate in kW (may be null).
          </li>
          {/* Hardcoded string */}
          <li>
            <code>chargeLimit</code>: Configured charge limit (%) (may be null).
          </li>
          {/* Hardcoded string */}
          <li>
            <code>chargeTimeRemaining</code>: Minutes remaining to full charge (may be null).
          </li>
          {/* Hardcoded string */}
          <li>
            <code>maxCurrent</code>: Max current in amps (may be null).
          </li>
          {/* Hardcoded string */}
          <li>
            <code>lastUpdated</code>: Timestamp when this data block was last updated.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>powerDeliveryState</code>: See detailed description below.
          </li>
        </ul>

        {/* Hardcoded string */}
        <h3 className='text-xl font-semibold mt-6'>chargeState.powerDeliveryState</h3>
        {/* Hardcoded string */}
        <p>The current state of power delivery between the vehicle and charger:</p>
        <ul className='list-disc ml-6 space-y-2 mt-4'>
          {/* Hardcoded string */}
          <li><code>UNKNOWN</code>: The state of power delivery is currently unknown.</li>
          {/* Hardcoded string */}
          <li><code>UNPLUGGED</code>: The vehicle is not connected to the charger.</li>
          {/* Hardcoded string */}
          <li>
            <code>PLUGGED_IN:INITIALIZING</code>: The charging station is preparing to deliver power to the vehicle.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>PLUGGED_IN:CHARGING</code>: The vehicle is actively receiving power, increasing the battery level.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>PLUGGED_IN:COMPLETE</code>: Charging has finished and the battery has reached the target limit.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>PLUGGED_IN:STOPPED</code>: Charging was intentionally stopped. The vehicle remains plugged in.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>PLUGGED_IN:NO_POWER</code>: Charging failed due to unavailable power. User intervention is required.
          </li>
          {/* Hardcoded string */}
          <li>
            <code>PLUGGED_IN:FAULT</code>: A malfunction is preventing charging (e.g., cable issue, temperature, system error).
          </li>
          {/* Hardcoded string */}
          <li>
            <code>PLUGGED_IN:DISCHARGING</code>: The vehicle is discharging energy to the grid or home (V2G/V2H).
          </li>
        </ul>

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

        {/* ------------------------------------------------------------------ */}
        {/* New Charging Control Endpoint Documentation */}
        {/* ------------------------------------------------------------------ */}

        <div className='mt-16 border-t pt-6'>
          {/* Hardcoded string */}
          <h2 className='text-2xl font-semibold flex items-center space-x-2'>
            <span>Control Charging Endpoint</span>
            <Badge variant='destructive'>PRO</Badge>
          </h2>
          {/* Hardcoded string */}
          <p>
            This endpoint allows you to request that a vehicle start or stop charging. Only users on the <strong>Pro tier</strong> can use this endpoint.
            {/* Hardcoded string */}
            The request creates an Action that will retry until the vehicle’s <code>powerDeliveryState</code> matches the expected value.
            {/* Hardcoded string */}
            Any existing PENDING action of the same target and type will be reused; if the new action differs, the existing one will automatically transition to CANCELLED.
            {/* Hardcoded string */}
            Note that it can take a few seconds before the vehicle’s status updates, and the backend will keep retrying until the desired state is reached.
          </p>

          {/* Hardcoded string */}
          <h3 className='text-xl font-semibold mt-6'>Endpoint</h3>
          <CodeBlock code='POST https://api.evlinkha.cloud/api/v1/ha/charging/{vehicle_id}' language='http' />

          {/* Hardcoded string */}
          <h3 className='text-xl font-semibold mt-6'>Request Body</h3>
          {/* Hardcoded string */}
          <p>JSON payload specifying the desired action:</p>
          <CodeBlock
            code={`{
  "action": "START"  // or "STOP"
}`}
            language='json'
          />

          <details className='bg-gray-100 p-4 rounded border border-gray-300 text-sm leading-relaxed'>
            {/* Hardcoded string */}
            <summary className='cursor-pointer font-medium mb-2'>
              Example JSON response
            </summary>
            <pre className='mt-2 overflow-auto'>
              <code>
{`{
  "status":"success",
  "vehicle_id":"331c054f-b583-4284-b7b0-ce348c0a66fc",
  "enode_vehicle_id":"9801efc6-2d23-4fc5-bdc6-ba40b4e25e55",
  "action":"START",
  "enode_response": { /* ... */ }
}`}
              </code>
            </pre>
          </details>

          {/* Hardcoded string */}
          <h3 className='text-xl font-semibold mt-6'>Error Handling</h3>
          <ul className='list-disc ml-6 space-y-2'>
            {/* Hardcoded string */}
            <li><code>401 Unauthorized</code>: Missing or invalid API key.</li>
            {/* Hardcoded string */}
            <li><code>403 Forbidden</code>: User not on Pro tier or does not own the specified vehicle.</li>
            {/* Hardcoded string */}
            <li><code>404 Not Found</code>: Vehicle not found in EVLinkHA.</li>
            {/* Hardcoded string */}
            <li>
              <code>400 Bad Request</code>: Attempt to <code>START</code> while vehicle is unplugged or already charging,
              {/* Hardcoded string */}
              or to <code>STOP</code> while vehicle is not charging. The response will include a message indicating the required state.
            </li>
            {/* Hardcoded string */}
            <li>
              <code>422 Unprocessable Entity</code>: Vehicle is under scheduled or smart charging control.
              {/* Hardcoded string */}
              Check Enode’s error message for details (e.g., “Vehicle controlled by schedule”).
            </li>
            {/* Hardcoded string */}
            <li><code>429 Too Many Requests</code>: Rate limit exceeded. Free tier: 300 calls per 30 days, Pro tier: 60 calls per minute.</li>
            {/* Hardcoded string */}
            <li><code>500 Internal Server Error</code>: Vehicle record missing Enode ID or unexpected server error.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}