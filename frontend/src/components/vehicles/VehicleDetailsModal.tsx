'use client';

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
              {chargeState?.isPluggedIn ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Charging:</strong>{' '}
              {chargeState?.isCharging ? 'Yes' : 'No'}
            </div>
          </div>

          <div>
            <strong>Smart charging:</strong>{' '}
            {smartChargingPolicy?.isEnabled ? (
              <>
                Enabled (Deadline: {smartChargingPolicy.deadline ?? '–'})
              </>
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

        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
