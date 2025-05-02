// src/components/VehicleTable.tsx

import VehicleName from "@/components/VehicleName";
import BatteryIndicator from "@/components/BatteryIndicator";
import ChargingStatus from "@/components/ChargingStatus";

export interface Vehicle {
  id: string;
  information?: {
    displayName?: string;
    brand?: string;
    model?: string;
    year?: string;
    vin?: string;
  };
  chargeState?: {
    batteryLevel?: number;
    isCharging?: boolean;
  };
}


interface VehicleTableProps {
  vehicles: Vehicle[];
}

export default function VehicleTable({ vehicles }: VehicleTableProps) {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-indigo-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Vehicle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Battery Level
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {vehicles.map((vehicle) => (
          <tr key={vehicle.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
            <VehicleName
              name={
                vehicle.information?.displayName ||
                `${vehicle.information?.brand || "Unknown"} ${vehicle.information?.model || ""} ${vehicle.information?.year || ""} (${vehicle.information?.vin || "N/A"})`
              }
            />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <BatteryIndicator level={vehicle.chargeState?.batteryLevel ?? 0} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <ChargingStatus charging={vehicle.chargeState?.isCharging ?? false} />
            </td>
          </tr>
        ))}

        </tbody>
      </table>
    </div>
  );
}
