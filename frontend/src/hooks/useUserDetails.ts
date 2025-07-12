// src/hooks/useUserDetails.ts
import { useSupabase } from '@/lib/supabaseContext';
import { useEffect, useState } from 'react';
import type { UserDetails } from '@/types/userDetails'; // Import from central types

export function useUserDetails(userId: string) {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      setError("No user ID provided."); /* Hardcoded string */
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
          setError("User not found."); /* Hardcoded string */
        }
        setLoading(false);
      });
  }, [userId, supabase]);

  // In your useUserDetails hook /* Hardcoded string */
const updateUserField = async <K extends keyof UserDetails>(field: K, value: UserDetails[K]) => {
  // Optimistic update /* Hardcoded string */
  setUser(prev => prev ? { ...prev, [field]: value } : prev);
  const { error } = await supabase.from('users').update({ [field]: value }).eq('id', userId);
  if (error) {
    // If error: Rollback! /* Hardcoded string */
    setUser(prev => prev ? { ...prev, [field]: !value } : prev);
    setError(error.message);
    return false;
  }
  return true;
};


  return {
    loading,
    user,
    error,
    setUser,
    updateUserField,
  };
}

