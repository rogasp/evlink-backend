export type Vehicle = {
  id: string;
  vendor: string;
  isReachable: boolean;
  lastSeen: string | null;
  information: {
    displayName?: string;
    brand: string;
    model: string;
    vin: string;
    year?: number;
  };
  chargeState?: {
    batteryLevel?: number | null;
    isCharging?: boolean;
    isPluggedIn?: boolean;
  };
};
