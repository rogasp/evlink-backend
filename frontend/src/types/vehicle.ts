export type Vehicle = {
  id: string;
  db_id: string;
  userId: string;
  vendor: string;
  isReachable: boolean;
  lastSeen: string | null;

  information: {
    displayName?: string | null;
    brand: string;
    model: string;
    vin: string;
    year?: number;
  };

  chargeState?: {
    batteryLevel?: number | null;
    isCharging?: boolean;
    isPluggedIn?: boolean;
    isFullyCharged?: boolean;
    batteryCapacity?: number;
    chargeLimit?: number;
    chargeRate?: number | null;
    chargeTimeRemaining?: number | null;
    lastUpdated?: string;
    maxCurrent?: number | null;
    powerDeliveryState?: string;
    range?: number | null;
  };

  smartChargingPolicy?: {
    isEnabled: boolean;
    deadline: string | null;
    minimumChargeLimit?: number;
  };

  odometer?: {
    distance: number | null;
    lastUpdated: string | null;
  };

  location?: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
    id: string | null;
  };

  capabilities?: {
    [key: string]: {
      isCapable: boolean;
      interventionIds: string[];
    };
  };

  scopes?: string[];
};
