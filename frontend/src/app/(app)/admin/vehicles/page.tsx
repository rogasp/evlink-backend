// app/dashboard/VehicleAdminPage.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { authFetch } from '@/lib/authFetch';

// Render vehicles in a table on larger screens and card list on mobile

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
      const res = await authFetch('/admin/vehicles', { method: 'GET', accessToken });
      if (res.error) {
        toast.error('Failed to fetch vehicles');
        return;
      }
      setVehicles(res.data || []);
    } catch {
      toast.error('Could not load vehicles');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { if (user) fetchVehicles(); }, [user, fetchVehicles]);
  if (!user) return null;

  return (
    <div className="p-4 space-y-4">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-indigo-700">Vehicle Admin</h1>
        <Button onClick={fetchVehicles} disabled={loading} className="mt-2 sm:mt-0">
          {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" />Refreshing...</> : 'Refresh'}
        </Button>
      </header>

      {/* Table for desktop */}
      <Card className="hidden lg:block overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Display Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Battery</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Plugged In</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{v.information.displayName}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{v.vendor}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{v.information.model}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{v.chargeState?.batteryLevel ?? '–'}%</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{v.chargeState?.isPluggedIn ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{v.lastSeen ? new Date(v.lastSeen).toLocaleString() : '–'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="secondary" onClick={() => setSelected(v)} title="View details">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Vehicle Details</DialogTitle></DialogHeader>
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
                <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500">No vehicles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Card list for mobile */}
      <div className="space-y-4 lg:hidden">
        {vehicles.map((v) => (
          <Card key={v.id} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-gray-900">{v.information.displayName}</div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="secondary" onClick={() => setSelected(v)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Vehicle Details</DialogTitle></DialogHeader>
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
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <div><strong>Vendor:</strong> {v.vendor}</div>
              <div><strong>Model:</strong> {v.information.model}</div>
              <div><strong>Battery:</strong> {v.chargeState?.batteryLevel ?? '–'}%</div>
              <div><strong>Last Seen:</strong> {v.lastSeen ? new Date(v.lastSeen).toLocaleString() : '–'}</div>
            </div>
          </Card>
        ))}
        {!loading && vehicles.length === 0 && (
          <div className="text-center text-gray-500 text-sm">No vehicles found.</div>
        )}
      </div>
    </div>
  );
}
