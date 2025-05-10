export type WebhookLog = {
    id: string;
    created_at: string;
    user_id?: string;
    vehicle_id?: string;
    event: string;
    version?: string;
    payload: string | Record<string, unknown> | Record<string, unknown>[];
  };
  