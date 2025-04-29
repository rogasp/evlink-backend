'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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
import { authFetch } from "@/lib/authFetch";
import VendorSelect from "@/components/VendorSelect";
import VehicleTable from "@/components/VehicleTable";
import type { Vehicle } from "@/components/VehicleTable";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!session?.accessToken) return;

      const { data, error } = await authFetch("/user/vehicles", {
        method: "GET",
        accessToken: session.accessToken,
      });

      if (error) {
        toast.error("Failed to fetch vehicles");
        console.error("Vehicle fetch error:", error);
      } else {
        try {
          if (Array.isArray(data)) {
            const parsed = data.flatMap((v) =>
              typeof v === "string" ? [JSON.parse(v)] : [v]
            );
            setVehicles(parsed);
          } else {
            toast.error("Unexpected vehicle data format");
            console.error("Vehicle fetch format error:", data);
          }
        } catch (e) {
          toast.error("Failed to parse vehicles");
          console.error("Vehicle parse error:", e);
        }
      }
    };

    fetchVehicles();
  }, [session]);

  const handleLinkVehicle = async () => {
    if (!selectedVendor || !session?.accessToken) {
      toast.error("Missing vendor selection or session.");
      return;
    }

    try {
      const { data, error } = await authFetch("/user/link-vehicle", {
        method: "POST",
        accessToken: session.accessToken,
        body: JSON.stringify({ vendor: selectedVendor }),
      });

      if (error || !data?.url || !data?.linkToken) {
        toast.error("Failed to initiate vehicle linking.");
        return;
      }

      localStorage.setItem("linkToken", data.linkToken);
      window.location.href = data.url;
    } catch (error) {
      console.error("Link vehicle error:", error);
      toast.error("Unexpected error during vehicle linking.");
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">
        Welcome, {session?.user?.name || "User"}
      </h1>

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

      {/* 🚗 Vehicle Table */}
      <VehicleTable vehicles={vehicles} />
    </main>
  );
}
