'use client';

import { Button } from '@/components/ui/button';
import type { Vehicle } from '@/types/vehicle';

export default function VehicleList({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-indigo-700">Your Vehicles</h2>
      <div className="overflow-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Battery</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const { brand, model, vin } = v.information;
              const name = `${brand} ${model} (${vin})`;
              const battery = v.chargeState?.batteryLevel ?? null;

              return (
                <tr key={v.id} className="border-t">
                  <td className="px-4 py-2">{name}</td>
                  <td className="px-4 py-2">
                    {battery !== null ? `${battery}%` : '–'}
                  </td>
                  <td className="px-4 py-2">
                    {v.isReachable ? (
                      <span className="text-green-600 font-medium">Reachable</span>
                    ) : (
                      <span className="text-red-500 font-medium">Offline</span>
                    )}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <Button size="sm" variant="outline">Details</Button>
                    <Button size="sm" variant="destructive">Unlink</Button>
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
