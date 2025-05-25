'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { authFetch } from '@/lib/authFetch';
import type { User } from '@supabase/supabase-js';

interface MergedUser {
  id: string;
  email: string;
  role: string;
  approved: boolean;
  accepted_terms: boolean;
  vendor?: string;
  full_name?: string;
  name?: string;
  created_at?: string;
  online_status?: 'green' | 'yellow' | 'red' | 'grey';
  notify_offline?: boolean;
}

export function useAuth({
  redirectTo = '/login',
  requireAuth = true,
}: {
  redirectTo?: string;
  requireAuth?: boolean;
} = {}) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [mergedUser, setMergedUser] = useState<MergedUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<'green' | 'yellow' | 'red' | 'grey'>('grey');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initial fetch of auth + /me
  useEffect(() => {
    const fetchUserAndMe = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!session || error) {
        setAuthUser(null);
        setMergedUser(null);
        setAccessToken(null);
        setOnlineStatus('grey');

        if (requireAuth) {
          router.push(redirectTo);
        }
      } else {
        setAuthUser(session.user);
        setAccessToken(session.access_token);

        const { data, error } = await authFetch('/me', {
          method: 'GET',
          accessToken: session.access_token,
        });

        if (!error && data) {
          setMergedUser(data);
          setOnlineStatus(data.online_status ?? 'grey');
        } else {
          setMergedUser(null);
          setOnlineStatus('grey');
        }
      }

      setLoading(false);
    };

    fetchUserAndMe();
  }, [router, redirectTo, requireAuth]);

  // Realtime subscription for vehicle updates
  useEffect(() => {
    if (!mergedUser || !accessToken) return;

    const channel = supabase
      .channel('user-vehicle-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles',
          filter: `user_id=eq.${mergedUser.id}`,
        },
        async () => {
          const { data, error } = await authFetch('/me', {
            method: 'GET',
            accessToken,
          });

          if (!error && data) {
            setMergedUser(data);
            setOnlineStatus(data.online_status ?? 'grey');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mergedUser, accessToken]);

  return {
    user: authUser,
    mergedUser,
    accessToken,
    loading,
    isAdmin: mergedUser?.role === 'admin',
    isApproved: mergedUser?.approved === true,
    hasAcceptedTerms: mergedUser?.accepted_terms === true,
    onlineStatus,
  };
}
