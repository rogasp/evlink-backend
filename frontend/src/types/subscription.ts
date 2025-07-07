// frontend/types/subscription.ts

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  stripe_product_id: string;
  stripe_price_id: string;
  amount: number;
  currency: string;
  interval: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
