'use client';

import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { authFetch } from "@/lib/authFetch"; // Lägg till högst upp om du inte redan har
import VendorSelect from "@/components/VendorSelect";
import VehicleName from "@/components/VehicleName";
import BatteryIndicator from "@/components/BatteryIndicator";
import ChargingStatus from "@/components/ChargingStatus";

// Mocked vehicle data
const mockVehicles = [
  { id: "low", name: "Nissan Leaf", batteryLevel: 5, charging: false },
  { id: "medium", name: "Renault Zoe", batteryLevel: 35, charging: true },
  { id: "high", name: "Tesla Model S", batteryLevel: 85, charging: false },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState('');

  const handleLinkVehicle = async () => {
    if (!selectedVendor || !session?.accessToken) {
      toast.error("Missing vendor selection or session.");
      return;
    }
  
    try {
      const { data, error } = await authFetch(`/user/link-vehicle`, {
        method: "POST",
        accessToken: session.accessToken,
        body: JSON.stringify({ vendor: selectedVendor }),
      });
  
      if (error || !data?.url) {
        const message =
          typeof error === "object" && error !== null && "detail" in error
            ? (error as any).detail
            : "Failed to initiate vehicle linking.";
        toast.error(message);
        return;
      }
  
      toast.success("Redirecting to Enode...");
      window.location.href = data.url;
    } catch (error) {
      console.error("Link vehicle error:", error);
      toast.error("Unexpected error during vehicle linking.");
    }
  };
  

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      {/* Welcome header */}
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">
        Welcome, {session?.user?.name || "User"}
      </h1>

      {/* Link vehicle button */}
      <div className="mb-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default">Link Vehicle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link a new vehicle</DialogTitle>
              <DialogDescription>
                Choose a vendor to start linking your vehicle.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <VendorSelect
                selectedVendor={selectedVendor}
                onChange={(value) => setSelectedVendor(value)}
              />
              <Button
                variant="default"
                onClick={handleLinkVehicle}
                disabled={!selectedVendor}
              >
                Link Now
              </Button>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vehicle table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-600">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Vehicle
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Battery Level
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockVehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <VehicleName name={vehicle.name} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <BatteryIndicator level={vehicle.batteryLevel} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ChargingStatus charging={vehicle.charging} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
