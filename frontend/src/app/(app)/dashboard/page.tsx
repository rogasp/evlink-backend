
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { authFetch } from '@/lib/authFetch';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

import LinkVehicleDialog from '@/components/dashboard/LinkVehicleDialog';
import VehicleList from '@/components/vehicles/VehicleList';
import UnlinkVendorDialog from '@/components/dashboard/UnlinkVendorDialog';
import VehicleDetailsModal from '@/components/vehicles/VehicleDetailsModal';
import type { Vehicle } from '@/types/vehicle';

export default function DashboardPage() {
  const { user, accessToken, loading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const justClosedRef = useRef(false);

  const fetchVehicles = useCallback(async () => {
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

        if (selectedVehicle && !justClosedRef.current) {
          const updated = parsed.find((v) => v.id === selectedVehicle.id);

          if (
            updated &&
            JSON.stringify(updated) !== JSON.stringify(selectedVehicle)
          ) {
            setSelectedVehicle(updated);
          }
        }

        if (justClosedRef.current) {
          justClosedRef.current = false;
        }
      } else {
        toast.error('Unexpected vehicle data format');
        console.error('Vehicle fetch format error:', data);
      }
    } catch (e) {
      toast.error('Failed to parse vehicles');
      console.error('Vehicle parse error:', e);
    }
  }, [accessToken, selectedVehicle]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('realtime:vehicles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchVehicles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchVehicles]);

  const openUnlinkDialog = (vendor: string) => {
    setSelectedVendor(vendor);
    setUnlinkDialogOpen(true);
  };

const handleCopyID = useCallback(async (vehicle: Vehicle) => {
  console.log('[🚀 handleCopyID] Triggered for vehicle:', vehicle);

  if (!accessToken || !vehicle.id) {
    toast.error('Missing access token or vehicle ID');
    return;
  }

  const endpoint = `/vehicle/by_vid?vehicle_id=${vehicle.id}`;
  console.log('[🌐 handleCopyID] Fetching from endpoint:', endpoint);

  try {
    const { data, error } = await authFetch(endpoint, {
      method: 'GET',
      accessToken,
    });

    console.log('[📦 handleCopyID] Response:', { data, error });

    const vehicleDbId = data?.id;

    if (!vehicleDbId || error) {
      console.warn('[❌ handleCopyID] Failed to get internal vehicle ID');
      toast.error('Could not fetch internal vehicle ID');
      return;
    }

    await navigator.clipboard.writeText(vehicleDbId);
    toast.success('Vehicle ID copied to clipboard!');
    console.log('[✅ handleCopyID] Copied vehicle ID:', vehicleDbId);

  } catch (err) {
    console.error('[🔥 handleCopyID] Unexpected error:', err);
    toast.error('Failed to copy vehicle ID');
  }
}, [accessToken]);


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

  const handleCloseModal = () => {
    justClosedRef.current = true;
    setSelectedVehicle(null);
  };

  const vendorVehicles = selectedVendor
    ? vehicles.filter((v) => v.vendor === selectedVendor)
    : [];

  if (loading) return <p className="p-4">Loading session...</p>;
  if (!user || !accessToken) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6">
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700">
          Welcome, {user.user_metadata?.name ?? 'User'}
        </h1>

        <div>
          <LinkVehicleDialog accessToken={accessToken} />
        </div>

        <VehicleList
          vehicles={vehicles}
          onUnlinkVendor={openUnlinkDialog}
          onDetailsClick={setSelectedVehicle}
          onCopyIdClick={handleCopyID}
        />

        <UnlinkVendorDialog
          open={unlinkDialogOpen}
          onOpenChange={setUnlinkDialogOpen}
          vendor={selectedVendor ?? ''}
          vehicles={vendorVehicles}
          onConfirm={handleConfirmUnlink}
        />

        {selectedVehicle && (
          <VehicleDetailsModal
            vehicle={selectedVehicle}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </main>
  );
}
