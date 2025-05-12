'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authFetch } from '@/lib/authFetch';
import { useAuth } from '@/hooks/useAuth';
import LinkVehicleDialog from '@/components/dashboard/LinkVehicleDialog';
import VehicleList from '@/components/vehicles/VehicleList';
import type { Vehicle } from '@/types/vehicle';
import UnlinkVendorDialog from '@/components/dashboard/UnlinkVendorDialog';

export default function DashboardPage() {
  const { user, accessToken, loading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!accessToken) return;

      const { data, error } = await authFetch('/user/vehicles', {
        method: 'GET',
        accessToken,
      });

      if (error) {
        toast.error('Failed to fetch vehicles');
        console.error('Vehicle fetch error:', error);
        return;
      }

      try {
        if (Array.isArray(data)) {
          const parsed = data.flatMap((v) =>
            typeof v === 'string' ? [JSON.parse(v)] : [v]
          );
          setVehicles(parsed);
        } else {
          toast.error('Unexpected vehicle data format');
          console.error('Vehicle fetch format error:', data);
        }
      } catch (e) {
        toast.error('Failed to parse vehicles');
        console.error('Vehicle parse error:', e);
      }
    };

    fetchVehicles();
  }, [accessToken]);

  const openUnlinkDialog = (vendor: string) => {
    setSelectedVendor(vendor);
    setUnlinkDialogOpen(true);
  };

  const handleConfirmUnlink = async () => {
    if (!accessToken || !selectedVendor) return;

    const { error } = await authFetch('/user/unlink', {
      method: 'POST',
      accessToken,
      body: JSON.stringify({ vendor: selectedVendor }),
    });

    if (error) {
      toast.error('Failed to unlink vendor');
      console.error('Unlink error:', error);
    } else {
      toast.success(`Vendor ${selectedVendor} unlinked`);
      setVehicles((prev) => prev.filter((v) => v.vendor !== selectedVendor));
    }

    setUnlinkDialogOpen(false);
  };

  const vendorVehicles = selectedVendor
    ? vehicles.filter((v) => v.vendor === selectedVendor)
    : [];

  if (loading) return <p className="p-4">Loading session...</p>;
  if (!user || !accessToken) return null;

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <h1 className="mb-8 text-3xl font-bold text-indigo-700">
        Welcome, {user.user_metadata?.name ?? 'User'}
      </h1>

      <div className="mb-8">
        <LinkVehicleDialog accessToken={accessToken} />
      </div>

      <VehicleList vehicles={vehicles} onUnlinkVendor={openUnlinkDialog} />

      <UnlinkVendorDialog
        open={unlinkDialogOpen}
        onOpenChange={setUnlinkDialogOpen}
        vendor={selectedVendor ?? ''}
        vehicles={vendorVehicles}
        onConfirm={handleConfirmUnlink}
      />
    </main>
  );
}
