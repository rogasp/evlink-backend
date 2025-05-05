'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
<<<<<<< HEAD
import { authFetch } from '@/lib/authFetch';
=======
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { authFetch } from '@/lib/authFetch';
import VendorSelect from '@/components/VendorSelect';
>>>>>>> origin/dev
import VehicleTable from '@/components/VehicleTable';
import type { Vehicle } from '@/components/VehicleTable';
import { useAuth } from '@/hooks/useAuth';
import LinkVehicleDialog from '@/components/dashboard/LinkVehicleDialog';

export default function DashboardPage() {
  const { user, accessToken, loading } = useAuth();
<<<<<<< HEAD
=======
  const [open, setOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState('');
>>>>>>> origin/dev
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!accessToken) return;
<<<<<<< HEAD
=======
      console.log(accessToken)
>>>>>>> origin/dev
      const { data, error } = await authFetch('/user/vehicles', {
        method: 'GET',
        accessToken,
      });

      if (error) {
        toast.error('Failed to fetch vehicles');
        console.error('Vehicle fetch error:', error);
      } else {
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
      }
    };

    fetchVehicles();
  }, [accessToken]);

<<<<<<< HEAD
  if (loading) return <p className="p-4">Loading session...</p>;
  if (!user || !accessToken) return null;
=======
  const handleLinkVehicle = async () => {
    if (!selectedVendor || !accessToken) {
      toast.error('Missing vendor selection or session.');
      return;
    }

    try {
      const { data, error } = await authFetch('/user/link-vehicle', {
        method: 'POST',
        accessToken,
        body: JSON.stringify({ vendor: selectedVendor }),
      });

      if (error || !data?.url || !data?.linkToken) {
        toast.error('Failed to initiate vehicle linking.');
        return;
      }

      localStorage.setItem('linkToken', data.linkToken);
      window.location.href = data.url;
    } catch (error) {
      console.error('Link vehicle error:', error);
      toast.error('Unexpected error during vehicle linking.');
    }
  };
>>>>>>> origin/dev

  if (loading) return <p className="p-4">Loading session...</p>;
  if (loading || !user || !accessToken) return null;

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">
        Welcome, {user.user_metadata?.name || 'User'}
      </h1>

      <div className="mb-8">
        <LinkVehicleDialog accessToken={accessToken} />
      </div>

      {/* 🚗 Vehicle Table */}
      <VehicleTable vehicles={vehicles} />
    </main>
  );
}

