'use client';

import { Button } from '@/components/ui/button';
import type { Vehicle } from '@/types/vehicle';

interface VehicleListProps {
  vehicles: Vehicle[];
  onUnlinkVendor: (vendor: string) => void;
}

export default function VehicleList({
  vehicles,
  onUnlinkVendor,
}: VehicleListProps) {
  return (
    <div className="space-y-4">
      {/* Mobilvy (kort) */}
      <div className="md:hidden flex flex-col gap-4">
        {vehicles.map((v) => {
          const info = v.information;

          return (
            <div
              key={v.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="text-sm font-semibold text-gray-700 mb-1">
                {info
                  ? `${info.brand} ${info.model} (${info.vin})`
                  : 'Unnamed Vehicle'}
              </div>

              <div className="text-sm text-gray-500 mb-2">
                Battery:{' '}
                {v.chargeState?.batteryLevel !== undefined
                  ? `${v.chargeState.batteryLevel}%`
                  : '–'}
                {'  ·  '}
                Range:{' '}
                {v.chargeState?.range !== undefined
                  ? `${Math.round(v.chargeState.range)} km`
                  : '–'}
              </div>

              <div className="mb-2 text-sm">
                Status:{' '}
                {v.isReachable ? (
                  <span className="text-green-600 font-medium">Online</span>
                ) : (
                  <span className="text-gray-400">Offline</span>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline">
                  Details
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onUnlinkVendor(v.vendor)}
                >
                  Unlink
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop-tabell */}
      <div className="hidden md:block overflow-x-auto rounded-md border bg-white shadow-sm">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
            <tr>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Battery</th>
              <th className="px-4 py-2">Range</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const info = v.information;

              return (
                <tr key={v.id} className="border-t text-sm">
                  <td className="px-4 py-2">
                    {info
                      ? `${info.brand} ${info.model} (${info.vin})`
                      : 'Unnamed Vehicle'}
                  </td>
                  <td className="px-4 py-2">
                    {v.chargeState?.batteryLevel !== undefined
                      ? `${v.chargeState.batteryLevel}%`
                      : '–'}
                  </td>
                  <td className="px-4 py-2">
                    {v.chargeState?.range !== undefined
                      ? `${Math.round(v.chargeState.range)} km`
                      : '–'}
                  </td>
                  <td className="px-4 py-2">
                    {v.isReachable ? (
                      <span className="text-green-600">Online</span>
                    ) : (
                      <span className="text-gray-400">Offline</span>
                    )}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onUnlinkVendor(v.vendor)}
                    >
                      Unlink
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
