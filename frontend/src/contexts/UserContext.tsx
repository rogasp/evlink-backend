'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { authFetch } from '@/lib/authFetch';
import type { User } from '@supabase/supabase-js';
import type { UserDetails } from '@/types/userDetails'; // Import UserDetails

interface MergedUser extends UserDetails {
  approved: boolean;
  online_status?: 'green' | 'yellow' | 'red' | 'grey'; /* Hardcoded string */ /* Hardcoded string */ /* Hardcoded string */ /* Hardcoded string */
  tier?: 'free' | 'basic' | 'pro'; /* Hardcoded string */ /* Hardcoded string */ /* Hardcoded string */
  is_on_trial?: boolean;
  trial_ends_at?: string | null; // NEW: When the trial ends
  sms_credits?: number;
  purchased_api_tokens?: number; // NEW: User's balance of purchased API tokens
}

type UserContextType = {
  user: User | null;
  mergedUser: MergedUser | null;
  accessToken: string | null;
  loading: boolean;
  refreshUser: (showSkeleton?: boolean) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mergedUser, setMergedUser] = useState<MergedUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Updated fetchUserAndMe that can handle whether skeleton should be shown or not /* Hardcoded string */
  const fetchUserAndMe = async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session || error) {
      setUser(null);
      setMergedUser(null);
      setAccessToken(null);
    } else {
      setUser(session.user);
      setAccessToken(session.access_token);
      const { data, error: meError } = await authFetch('/me', {
        method: 'GET',
        accessToken: session.access_token,
      });
      if (!meError && data) {
        setMergedUser(data as MergedUser);
      } else {
        setMergedUser(null);
      }
    }
    setLoading(false);
    setHasLoadedOnce(true);
  };

  useEffect(() => {
    // First load: show skeleton /* Hardcoded string */
    fetchUserAndMe(true);

    // Listen for Supabase auth changes (refresh or login/logout) /* Hardcoded string */
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setUser(session.user);
        // Only update, do not show skeleton /* Hardcoded string */
        fetchUserAndMe(false);
      } else {
        setUser(null);
        setMergedUser(null);
        setAccessToken(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      mergedUser,
      accessToken,
      loading: !hasLoadedOnce ? loading : false,
      refreshUser: fetchUserAndMe,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be used within a UserProvider'); /* Hardcoded string */
  return ctx;
};
