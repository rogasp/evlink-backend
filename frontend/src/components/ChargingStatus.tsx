// src/components/ChargingStatus.tsx

interface ChargingStatusProps {
    charging: boolean;
  }
  
  export default function ChargingStatus({ charging }: ChargingStatusProps) {
    return (
      <div className="flex items-center space-x-2">
        <span className={`text-lg ${charging ? "text-green-500" : "text-gray-400"}`}>
          ⚡
        </span>
        <span className={`text-sm ${charging ? "text-green-600" : "text-gray-500"}`}>
          {charging ? "Charging" : "Not charging"}
        </span>
      </div>
    );
  }
  