// src/hooks/useUserDetails.ts
import { useSupabase } from '@/lib/supabaseContext';
import { useEffect, useState } from 'react';

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
  // ...fler fält vid behov
};

export function useUserDetails(userId: string) {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      setError("No user ID provided.");
      return;
    }
    setLoading(true);
    supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        if (data) {
          setUser(data as UserDetails);
          setError(null);
        } else {
          setUser(null);
          setError("User not found.");
        }
        setLoading(false);
      });
  }, [userId, supabase]);

  return {
    loading,
    user,
    error,
    setUser,
  };
}
