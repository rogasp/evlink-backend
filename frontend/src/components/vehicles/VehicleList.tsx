'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  vin: string;
  batteryLevel: number | null;
  isReachable: boolean;
};

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    brand: 'XPENG',
    model: 'G6',
    vin: 'X1234567890',
    batteryLevel: 76,
    isReachable: true,
  },
  {
    id: '2',
    brand: 'Kia',
    model: 'EV6',
    vin: 'K9988776655',
    batteryLevel: 54,
    isReachable: false,
  },
  {
    id: '3',
    brand: 'Volkswagen',
    model: 'ID.4',
    vin: 'VW1122334455',
    batteryLevel: null,
    isReachable: false,
  },
];

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    // Simulera API-anrop
    setVehicles(mockVehicles);
  }, []);

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
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="px-4 py-2">
                  {v.brand} / {v.model} / {v.vin}
                </td>
                <td className="px-4 py-2">
                  {v.batteryLevel !== null ? `${v.batteryLevel}%` : '–'}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
