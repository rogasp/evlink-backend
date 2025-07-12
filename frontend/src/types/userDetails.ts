export type UserDetails = {
  id: string;
  name: string | null;
  email: string;
  is_approved: boolean;
  accepted_terms: boolean | null;
  notify_offline: boolean;
  is_subscribed?: boolean;
  role: string | null;
  created_at: string | null;
  stripe_customer_id?: string | null;
  tier?: 'free' | 'pro' | 'basic';
  subscription_status?: string | null;
  // ...add more fields you want to display/update!
};