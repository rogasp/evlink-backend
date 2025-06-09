'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { authFetch } from '@/lib/authFetch';
import { useAuth } from '@/hooks/useAuth';
import type { Vehicle } from '@/types/vehicle';

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function VehicleDetailsModal({
  vehicle,
  onClose,
}: VehicleDetailsModalProps) {
  const { information, chargeState, smartChargingPolicy, odometer, isReachable } = vehicle;
  const { mergedUser, accessToken } = useAuth({ requireAuth: false });
  const isPro = mergedUser?.tier === 'pro';

  // Loading state for start/stop actions
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);

  // Determine availability of actions
  const isPlugged = Boolean(chargeState?.isPluggedIn);
  const isCharging = Boolean(chargeState?.isCharging);
  const canStart = isPro && isPlugged && !isCharging;
  const canStop = isPro && isPlugged && isCharging;

  /**
   * Handles starting or stopping charging via API
   */
  const handleCharging = async (action: 'START' | 'STOP'): Promise<void> => {
    if (!accessToken) return;

    const isStart = action === 'START';
    setStarting(isStart);
    setStopping(!isStart);

    try {
      const { error } = await authFetch(`/charging/${vehicle.db_id}`, {
        method: 'POST',
        accessToken,
        body: JSON.stringify({ action }),
      });

      if (error) {
        throw new Error(error.message || `Failed to ${action.toLowerCase()} charging`);
      }

      toast.success(
        `${isStart ? 'Started' : 'Stopped'} charging for ${information?.model} (${information?.vin})`
      );
    } catch (err: unknown) {
      console.error('Charging action failed', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(message);
    } finally {
      setStarting(false);
      setStopping(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {information?.brand} {information?.model} ({information?.vin})
          </DialogTitle>
          <DialogDescription>
            Last seen: {vehicle.lastSeen ? new Date(vehicle.lastSeen).toLocaleString() : '–'}
          </DialogDescription>
        </DialogHeader>

        {/* Vehicle details */}
        <div className="space-y-4 text-sm">
          <div>
            <strong>Status:</strong>{' '}
            {isReachable ? (
              <span className="text-green-600">Online</span>
            ) : (
              <span className="text-gray-400">Offline</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <strong>Battery level:</strong>{' '}
              {chargeState?.batteryLevel != null ? `${chargeState.batteryLevel}%` : '–'}
            </div>
            <div>
              <strong>Range:</strong>{' '}
              {chargeState?.range != null ? `${Math.round(chargeState.range)} km` : '–'}
            </div>
            <div>
              <strong>Capacity:</strong>{' '}
              {chargeState?.batteryCapacity ? `${chargeState.batteryCapacity} kWh` : '–'}
            </div>
            <div>
              <strong>Charge limit:</strong>{' '}
              {chargeState?.chargeLimit ? `${chargeState.chargeLimit}%` : '–'}
            </div>
            <div>
              <strong>Plugged in:</strong>{' '}
              {isPlugged ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Charging:</strong>{' '}
              {isCharging ? 'Yes' : 'No'}
            </div>
          </div>

          <div>
            <strong>Smart charging:</strong>{' '}
            {smartChargingPolicy?.isEnabled ? (
              <>Enabled (Deadline: {smartChargingPolicy.deadline ?? '–'})</>
            ) : (
              'Disabled'
            )}
          </div>

          {odometer?.distance != null && (
            <div>
              <strong>Odometer:</strong> {Math.round(odometer.distance)} km
            </div>
          )}
        </div>

        {/* Charging controls */}
        <div className="mt-6">
          <strong>Charging controls:</strong>
          <div className="flex space-x-2 mt-2">
            <Button
              onClick={() => handleCharging('START')}
              disabled={!canStart || starting}
            >
              {starting ? 'Starting…' : 'Start'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCharging('STOP')}
              disabled={!canStop || stopping}
            >
              {stopping ? 'Stopping…' : 'Stop'}
            </Button>
          </div>
          {!isPro && (
            <p className="text-xs text-gray-500 mt-1">Available for Pro users only</p>
          )}
        </div>

        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
