'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { authFetch } from '@/lib/authFetch';
import type { User } from '@supabase/supabase-js';

interface MergedUser {
  id: string;
  email: string;
  role: string;
  approved: boolean;
  accepted_terms: boolean;
  name?: string;
  online_status?: 'green' | 'yellow' | 'red' | 'grey';
  notify_offline?: boolean;
  is_subscribed?: boolean;
  stripe_customer_id?: string;
  sms_credits?: number;
  tier?: 'free' | 'pro';
}

type UserContextType = {
  user: User | null;
  mergedUser: MergedUser | null;
  accessToken: string | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mergedUser, setMergedUser] = useState<MergedUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserAndMe = async () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchUserAndMe();
    // Listen to Supabase auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setUser(session.user);
        fetchUserAndMe();
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
    <UserContext.Provider value={{ user, mergedUser, accessToken, loading, refreshUser: fetchUserAndMe }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be used within a UserProvider');
  return ctx;
};
