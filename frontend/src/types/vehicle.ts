export interface Vehicle {
    id: string;
    information?: {
      displayName?: string;
    };
    chargeState?: {
      batteryLevel?: number;
      isCharging?: boolean;
    };
  }
  