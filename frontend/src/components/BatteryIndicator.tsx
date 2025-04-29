type Props = {
  level?: number;
};

export default function BatteryIndicator({ level = 0 }: Props) {
  const batteryColor =
    level >= 80 ? "text-green-600" :
    level >= 40 ? "text-yellow-600" :
    "text-red-600";

  return (
    <span className={`${batteryColor} font-semibold`}>
      🔋 {level}%
    </span>
  );
}
