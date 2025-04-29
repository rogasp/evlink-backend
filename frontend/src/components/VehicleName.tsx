type Props = {
  name?: string;
};

export default function VehicleName({ name }: Props) {
  return (
    <span className="font-medium text-gray-800">
      {name || "Unnamed vehicle"}
    </span>
  );
}
