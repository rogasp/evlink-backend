export type UserDetails = {
  id: string;
  name: string | null;
  email: string;
  is_approved: boolean;
  accepted_terms: boolean | null;
  notify_offline: boolean;
  is_subscribed: boolean;
  role: string | null;
  created_at: string | null;
  // ...lägg till fler fields du vill visa/uppdatera!
};