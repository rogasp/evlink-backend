// src/components/BatteryIndicator.tsx

interface BatteryIndicatorProps {
    level: number;
  }
  
  function getBatteryColor(level: number) {
    if (level < 10) return "bg-red-500";
    if (level < 50) return "bg-yellow-400";
    return "bg-green-500";
  }
  
  export default function BatteryIndicator({ level }: BatteryIndicatorProps) {
    return (
      <div className="w-full">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${getBatteryColor(level)}`}
            style={{ width: `${level}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1 text-center">{level}%</p>
      </div>
    );
  }
  