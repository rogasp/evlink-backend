'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { authFetch } from '@/lib/authFetch';

type Vehicle = {
  id: string;
  userId: string;
  vendor: string;
  lastSeen: string;
  isReachable: boolean;
  information: {
    vin: string;
    brand: string;
    model: string;
    year: number;
    displayName: string;
  };
  chargeState?: {
    batteryLevel: number;
    isPluggedIn: boolean;
  };
};

export default function VehicleAdminPage() {
  const { user, accessToken } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Vehicle | null>(null);

  const fetchVehicles = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await authFetch('/admin/vehicles', {
        method: 'GET',
        accessToken,
      });

      if (res.error) {
        toast.error('Failed to fetch vehicles');
      } else {
        setVehicles(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
      toast.error('Could not load vehicles');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user, fetchVehicles]);

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-700">Vehicle Admin</h1>
        <Button onClick={fetchVehicles} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" /> Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden mt-4">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-2">Display Name</th>
              <th className="px-4 py-2">Vendor</th>
              <th className="px-4 py-2">Model</th>
              <th className="px-4 py-2">Battery</th>
              <th className="px-4 py-2">Plugged In</th>
              <th className="px-4 py-2">Last Seen</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="px-4 py-2">{v.information.displayName}</td>
                <td className="px-4 py-2">{v.vendor}</td>
                <td className="px-4 py-2">{v.information.model}</td>
                <td className="px-4 py-2">
                  {v.chargeState?.batteryLevel ?? '–'}%
                </td>
                <td className="px-4 py-2">
                  {v.chargeState?.isPluggedIn ? 'Yes' : 'No'}
                </td>
                <td className="px-4 py-2">
                  {v.lastSeen ? new Date(v.lastSeen).toLocaleString() : '–'}
                </td>
                <td className="px-4 py-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => setSelected(v)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Vehicle Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 text-sm">
                        <div><strong>ID:</strong> {selected?.id}</div>
                        <div><strong>User ID:</strong> {selected?.userId}</div>
                        <div><strong>Vendor:</strong> {selected?.vendor}</div>
                        <div><strong>Model:</strong> {selected?.information.model}</div>
                        <div><strong>VIN:</strong> {selected?.information.vin}</div>
                        <div><strong>Battery:</strong> {selected?.chargeState?.batteryLevel ?? '–'}%</div>
                        <div><strong>Plugged In:</strong> {selected?.chargeState?.isPluggedIn ? 'Yes' : 'No'}</div>
                        <div><strong>Last Seen:</strong> {selected?.lastSeen ? new Date(selected.lastSeen).toLocaleString() : '–'}</div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
            {!loading && vehicles.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center px-4 py-4 text-gray-500">
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
