'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { authFetch } from '@/lib/authFetch';
import VehicleTable from '@/components/VehicleTable';
import type { Vehicle } from '@/components/VehicleTable';
import { useAuth } from '@/hooks/useAuth';
import LinkVehicleDialog from '@/components/dashboard/LinkVehicleDialog';
import VehicleList from '@/components/vehicles/VehicleList';

export default function DashboardPage() {
  const { user, accessToken, loading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

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

  if (loading) return <p className="p-4">Loading session...</p>;
  if (!user || !accessToken) return null;

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">
        Welcome, {user.user_metadata?.name || 'User'}
      </h1>

      <div className="mb-8">
        <LinkVehicleDialog accessToken={accessToken} />
      </div>

      {/* 🚗 Vehicle Table */}
      <VehicleList />
    </main>
  );
}
