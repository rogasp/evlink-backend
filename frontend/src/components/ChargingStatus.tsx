type Props = {
  charging?: boolean;
};

export default function ChargingStatus({ charging }: Props) {
  return (
    <span className={`font-medium ${charging ? "text-green-700" : "text-gray-500"}`}>
      {charging ? "Charging ⚡" : "Not charging"}
    </span>
  );
}
