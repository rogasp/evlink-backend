// src/components/VehicleName.tsx

interface VehicleNameProps {
    name: string;
  }
  
  export default function VehicleName({ name }: VehicleNameProps) {
    return (
      <div className="font-semibold text-gray-800">
        {name}
      </div>
    );
  }
  