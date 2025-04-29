import React from "react";
import { CheckCircle2, AlertCircle, Zap } from "lucide-react";
import BatteryIndicator from "./BatteryIndicator";

export type Vehicle = {
  id: string;
  name: string;
  model: string;
  batteryLevel: number;
  status: "online" | "offline" | "charging";
};

interface VehicleTableProps {
  vehicles: Vehicle[];
}

export default function VehicleTable({ vehicles }: VehicleTableProps) {
  if (!vehicles.length) {
    return (
      <div className="text-gray-600 italic">
        No vehicles linked to your account.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full text-sm text-left text-gray-600">
        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Model</th>
            <th className="px-6 py-3">Battery</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr
              key={vehicle.id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 font-medium">{vehicle.name}</td>
              <td className="px-6 py-4">{vehicle.model}</td>
              <td className="px-6 py-4">
                <BatteryIndicator level={vehicle.batteryLevel} />
              </td>
              <td className="px-6 py-4">
                <VehicleStatus status={vehicle.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 🔌 Status-komponent
function VehicleStatus({ status }: { status: Vehicle["status"] }) {
  if (status === "online") {
    return (
      <span className="inline-flex items-center text-green-600">
        <CheckCircle2 className="w-4 h-4 mr-1" /> Online
      </span>
    );
  } else if (status === "charging") {
    return (
      <span className="inline-flex items-center text-blue-600">
        <Zap className="w-4 h-4 mr-1" /> Charging
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center text-red-500">
        <AlertCircle className="w-4 h-4 mr-1" /> Offline
      </span>
    );
  }
}
