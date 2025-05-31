// src/app/(app)/docs/ha-api/page.tsx

'use client';

import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';

export default function HAApiPage() {
  return (
    <main className='max-w-3xl mx-auto px-6 py-12'>
      <h1 className='text-3xl font-bold text-indigo-700 mb-6'>
        EVLinkHA – Home Assistant API
      </h1>

      <section className='space-y-6'>
        <p>
          This page documents the <code>/status/{'{vehicle_id}'}</code> endpoint of the
          EVLinkHA API, intended for use with REST sensors in Home Assistant.
        </p>

        <h2 className='text-2xl font-semibold mt-6'>Endpoint</h2>
        <CodeBlock code='GET https://evlinkha.se/api/status/{vehicle_id}' language='http' />

        <h2 className='text-2xl font-semibold mt-6'>Authentication</h2>
        <p>
          Requires a valid API key. Provide it in the <code>Authorization</code> header as:
        </p>
        <CodeBlock code={'Authorization: Bearer <your-api-key>'} language='http' />

        <h2 className='text-2xl font-semibold mt-6'>Response Format</h2>
        <p>
          The response contains basic vehicle status along with a detailed{' '}
          <code>chargeState</code> object.
        </p>

        <details className='bg-gray-100 p-4 rounded border border-gray-300 text-sm leading-relaxed'>
          <summary className='cursor-pointer font-medium mb-2'>
            Example JSON response
          </summary>
          <pre className='mt-2 overflow-auto'>
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

        <div className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded'>
          ⚠️ <strong>Note:</strong> The top-level keys like <code>batteryLevel</code>,{' '}
          <code>isCharging</code>, and <code>chargingState</code> are{' '}
          <strong>legacy</strong> and will be removed in a future version. Use the values
          inside <code>chargeState</code> instead.
        </div>

        <h2 className='text-2xl font-semibold mt-6'>Field Reference</h2>
        <ul className='list-disc ml-6 space-y-2'>
          <li>
            <code>batteryLevel</code>: Battery percentage (0–100). [Legacy]
          </li>
          <li>
            <code>range</code>: Estimated range in kilometers. [Legacy]
          </li>
          <li>
            <code>isCharging</code>: Whether the vehicle is charging. [Legacy]
          </li>
          <li>
            <code>isPluggedIn</code>: Whether the vehicle is plugged in. [Legacy]
          </li>
          <li>
            <code>chargingState</code>: Charging state enum string. [Legacy]
          </li>
          <li>
            <code>vehicleName</code>: Formatted name like &quot;XPENG G6&quot;.
          </li>
          <li>
            <code>latitude</code> / <code>longitude</code>: Last known location coordinates. [Legacy]
          </li>
          <li>
            <code>lastSeen</code>: ISO timestamp of last contact.
          </li>
          <li>
            <code>isReachable</code>: Whether the vehicle is reachable.
          </li>
        </ul>

        <h3 className='text-xl font-semibold mt-6'>chargeState object</h3>
        <ul className='list-disc ml-6 space-y-2'>
          <li>
            <code>batteryLevel</code>: Current battery percentage.
          </li>
          <li>
            <code>range</code>: Estimated driving range in kilometers.
          </li>
          <li>
            <code>isCharging</code>: Whether the vehicle is actively charging.
          </li>
          <li>
            <code>isPluggedIn</code>: Whether the vehicle is physically connected to a charger.
          </li>
          <li>
            <code>isFullyCharged</code>: Whether the battery is fully charged.
          </li>
          <li>
            <code>batteryCapacity</code>: Total battery capacity in kWh.
          </li>
          <li>
            <code>chargeRate</code>: Current charging rate in kW (may be null).
          </li>
          <li>
            <code>chargeLimit</code>: Configured charge limit (%) (may be null).
          </li>
          <li>
            <code>chargeTimeRemaining</code>: Minutes remaining to full charge (may be null).
          </li>
          <li>
            <code>maxCurrent</code>: Max current in amps (may be null).
          </li>
          <li>
            <code>lastUpdated</code>: Timestamp when this data block was last updated.
          </li>
          <li>
            <code>powerDeliveryState</code>: See detailed description below.
          </li>
        </ul>

        <h3 className='text-xl font-semibold mt-6'>chargeState.powerDeliveryState</h3>
        <p>
          The current state of power delivery between the vehicle and charger:
        </p>
        <ul className='list-disc ml-6 space-y-2 mt-4'>
          <li>
            <code>UNKNOWN</code>: The state of power delivery is currently unknown.
          </li>
          <li>
            <code>UNPLUGGED</code>: The vehicle is not connected to the charger.
          </li>
          <li>
            <code>PLUGGED_IN:INITIALIZING</code>: The charging station is preparing to
            deliver power to the vehicle.
          </li>
          <li>
            <code>PLUGGED_IN:CHARGING</code>: The vehicle is actively receiving power,
            increasing the battery level.
          </li>
          <li>
            <code>PLUGGED_IN:COMPLETE</code>: Charging has finished and the battery has
            reached the target limit.
          </li>
          <li>
            <code>PLUGGED_IN:STOPPED</code>: Charging was intentionally stopped. The vehicle
            remains plugged in.
          </li>
          <li>
            <code>PLUGGED_IN:NO_POWER</code>: Charging failed due to unavailable power.
            User intervention is required.
          </li>
          <li>
            <code>PLUGGED_IN:FAULT</code>: A malfunction is preventing charging (e.g., cable
            issue, temperature, system error).
          </li>
          <li>
            <code>PLUGGED_IN:DISCHARGING</code>: The vehicle is discharging energy to the grid
            or home (V2G/V2H).
          </li>
        </ul>

        {/* ------------------------------------------------------------------ */}
        {/* Additional fields added as of May 2025 – ALL BELOW ARE NON‐LEGACY  */}
        {/* ------------------------------------------------------------------ */}

        <div className='mt-12 border-t pt-6'>
          <h2 className='text-2xl font-semibold'>New/Expanded Fields (Non-Legacy)</h2>
          <p>
            In addition to <code>chargeState</code> and the other keys above, the following
            objects and fields are now returned. The <code>latitude</code> and{' '}
            <code>longitude</code> fields are considered <strong>legacy</strong> and will be
            removed on <strong>June 15, 2025</strong>. Please use the new objects below instead.
          </p>

          <h3 className='text-xl font-semibold mt-6'>information object</h3>
          <p>Descriptive information about the vehicle:</p>
          <ul className='list-disc ml-6 space-y-2'>
            <li>
              <code>information.vin</code> (string or null): Vehicle VIN.
            </li>
            <li>
              <code>information.brand</code> (string or null): A formatted, properly cased OEM
              brand name, suitable for display.
            </li>
            <li>
              <code>information.model</code> (string or null): Vehicle model name.
            </li>
            <li>
              <code>information.year</code> (number or null): Vehicle production year.
            </li>
            <li>
              <code>information.displayName</code> (string or null): User-defined vehicle
              nickname.
            </li>
          </ul>

          <h3 className='text-xl font-semibold mt-6'>location object</h3>
          <p>Last known location data, including coordinates and timestamp:</p>
          <ul className='list-disc ml-6 space-y-2'>
            <li>
              <code>location.latitude</code> (number or null): GPS latitude. (Legacy; remove by
              15/6/2025.)
            </li>
            <li>
              <code>location.longitude</code> (number or null): GPS longitude. (Legacy; remove by
              15/6/2025.)
            </li>
            <li>
              <code>location.timestamp</code> (string&lt;date-time&gt; or null): ISO timestamp when
              this location was recorded.
            </li>
          </ul>

          <h3 className='text-xl font-semibold mt-6'>odometer object</h3>
          <p>Vehicle’s odometer reading:</p>
          <ul className='list-disc ml-6 space-y-2'>
            <li>
              <code>odometer.distance</code> (number or null): Odometer in kilometers.
            </li>
            <li>
              <code>odometer.lastUpdated</code> (string&lt;date-time&gt; or null): Timestamp of
              the last odometer update.
            </li>
          </ul>

          <h3 className='text-xl font-semibold mt-6'>smartChargingPolicy object</h3>
          <p>
            Smart Charging configuration properties (configured via the Update Vehicle Smart
            Charging Policy API):
          </p>
          <ul className='list-disc ml-6 space-y-2'>
            <li>
              <code>smartChargingPolicy.isEnabled</code> (boolean): If true, Enode may manage
              charging based on policy.
            </li>
            <li>
              <code>smartChargingPolicy.deadline</code> (string or null): Hour‐minute deadline for
              charging to complete. Interpreted in the vehicle’s timezone if set, otherwise UTC.
            </li>
            <li>
              <code>smartChargingPolicy.minimumChargeLimit</code> (number): A percentage value
              (0–100). If the battery falls below this, charging proceeds immediately regardless
              of price. Cannot exceed the vehicle’s maximum charge limit. Defaults to 0.
            </li>
          </ul>

          <h3 className='text-xl font-semibold mt-6'>vendor field</h3>
          <p>
            <code>vendor</code> (string): Machine-friendly name of the vehicle vendor. Use this
            value in other API requests. Possible enum values:
          </p>
          <ul className='list-disc ml-6 space-y-2'>
            <li>ACURA</li>
            <li>AUDI</li>
            <li>BMW</li>
            <li>HONDA</li>
            <li>HYUNDAI</li>
            <li>JAGUAR</li>
            <li>LANDROVER</li>
            <li>KIA</li>
            <li>MERCEDES</li>
            <li>MINI</li>
            <li>NISSAN</li>
            <li>PEUGEOT</li>
            <li>PORSCHE</li>
            <li>RENAULT</li>
            <li>SEAT</li>
            <li>SKODA</li>
            <li>TESLA</li>
            <li>VOLKSWAGEN</li>
            <li>VOLVO</li>
            <li>FORD</li>
            <li>OPEL</li>
            <li>DS</li>
            <li>TOYOTA</li>
            <li>LEXUS</li>
            <li>CITROEN</li>
            <li>CUPRA</li>
            <li>VAUXHALL</li>
            <li>FIAT</li>
            <li>RIVIAN</li>
            <li>NIO</li>
            <li>CHEVROLET</li>
            <li>GMC</li>
            <li>CADILLAC</li>
            <li>XPENG</li>
            <li>POLESTAR</li>
            <li>SUBARU</li>
            <li>JEEP</li>
            <li>MAZDA</li>
            <li>MG</li>
            <li>CHRYSLER</li>
            <li>DODGE</li>
            <li>RAM</li>
            <li>ALFAROMEO</li>
            <li>LANCIA</li>
            <li>LUCID</li>
            <li>BYD</li>
          </ul>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* New Charging Control Endpoint Documentation */}
        {/* ------------------------------------------------------------------ */}

        <div className='mt-16 border-t pt-6'>
          <h2 className='text-2xl font-semibold'>Control Charging Endpoint</h2>
          <p>
            This endpoint allows you to request that a vehicle start or stop charging. The request
            creates an Action that will retry until the vehicle’s <code>powerDeliveryState</code> matches
            the expected value. Any existing PENDING action of the same target and type will be reused;
            if the new action differs, the existing one will automatically transition to the CANCELLED
            state and a new Action is created.
          </p>
          <p className='mt-4'>
            <strong>Note:</strong> If the vehicle is controlled by a schedule or has an active smart
            charging plan, this endpoint returns <code>422 Unprocessable Entity</code>. To regain user
            control, disable the schedule, disable smart charging, or use the Create Smart Override API
            to temporarily allow charging.
          </p>

          <h3 className='text-xl font-semibold mt-6'>Endpoint</h3>
          <CodeBlock code='POST https://evlinkha.se/api/charging/{vehicle_id}' language='http' />

          <h3 className='text-xl font-semibold mt-6'>Request Body</h3>
          <p>JSON payload specifying the desired action:</p>
          <CodeBlock
            code={`{
  "action": "START"  // or "STOP"
}`}
            language='json'
          />

          <details className='bg-gray-100 p-4 rounded border border-gray-300 text-sm leading-relaxed'>
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
      "enode_response":{
        "id":"4c14934a-7013-4996-87e3-06067152e89d",
        "userId":"671043ea-955c-4f57-aba5-4c71a0348412",
        "state":"PENDING",
        "createdAt":"2025-05-31T21:45:33.534Z",
        "updatedAt":"2025-05-31T21:45:33.534Z",
        "completedAt":null,
        "targetId":"9801efc6-2d23-4fc5-bdc6-ba40b4e25e55",
        "targetType":"vehicle",
        "kind":"START",
        "failureReason":null
      }
    }
  `}
            </code>
          </pre>
        </details>

          <h3 className='text-xl font-semibold mt-6'>Response</h3>
          <p>
            On success, returns a JSON object containing:
          </p>
          <ul className='list-disc ml-6 space-y-2'>
            <li><code>status</code> (string): Always &apos;success&apos; if the request was accepted.</li>
            <li><code>vehicle_id</code> (string): The internal EVLinkHA vehicle UUID.</li>
            <li><code>enode_vehicle_id</code> (string): The Enode-specific vehicle UUID used in the request.</li>
            <li><code>action</code> (string): The requested action (&apos;START&apos; or &apos;STOP&apos;).</li>
            <li><code>enode_response</code> (object): The raw JSON response from Enode’s API.</li>
          </ul>

          <h3 className='text-xl font-semibold mt-6'>Error Handling</h3>
          <ul className='list-disc ml-6 space-y-2'>
            <li><code>401 Unauthorized</code>: Missing or invalid API key.</li>
            <li><code>403 Forbidden</code>: Authenticated user does not own the specified vehicle.</li>
            <li><code>404 Not Found</code>: Vehicle not found in EVLinkHA.</li>
            <li>
              <code>422 Unprocessable Entity</code>: Vehicle is under scheduled or smart charging
              control. Check Enode’s error message for details (e.g., &apos;Vehicle controlled by schedule&apos;).
            </li>
            <li><code>500 Internal Server Error</code>: Vehicle record missing Enode ID or unexpected server error.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
