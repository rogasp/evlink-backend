// src/components/VendorSelect.tsx

import { vendors } from "@/constants/vendors";

interface VendorSelectProps {
  selectedVendor: string;
  onChange: (value: string) => void;
}

export default function VendorSelect({ selectedVendor, onChange }: VendorSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-gray-700 font-semibold text-sm">
        Select vehicle vendor
      </label>
      <select
        className="w-full border rounded p-2"
        value={selectedVendor}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {vendors.map((vendor) => (
          <option key={vendor} value={vendor}>
            {vendor}
          </option>
        ))}
      </select>
    </div>
  );
}
