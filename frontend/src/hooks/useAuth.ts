// frontend/app/hooks/useAuth.ts

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { authFetch } from '@/lib/authFetch';
import type { User } from '@supabase/supabase-js';

/**
 * Extend MergedUser to include `is_subscribed`.
 */
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
  is_subscribed?: boolean;  // NEW: whether the user is subscribed to the newsletter
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

  // 1) Sync accessToken when the Supabase session changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        setAccessToken(session.access_token);
      } else {
        setAccessToken(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 2) On initial mount, fetch the Supabase session and then GET /me to populate mergedUser
  useEffect(() => {
    const fetchUserAndMe = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!session || error) {
        // No active session or an error occurred: clear everything and optionally redirect
        setAuthUser(null);
        setMergedUser(null);
        setAccessToken(null);
        setOnlineStatus('grey');
        if (requireAuth) router.push(redirectTo);
      } else {
        // We have a valid Supabase session
        setAuthUser(session.user);
        setAccessToken(session.access_token);

        // Fetch “/me” from your backend to get roles, profile fields, etc.
        const { data, error: meError } = await authFetch('/me', {
          method: 'GET',
          accessToken: session.access_token,
        });

        if (!meError && data) {
          setMergedUser(data as MergedUser);
          setOnlineStatus((data as MergedUser).online_status ?? 'grey');
        } else {
          // If backend /me failed, clear mergedUser
          setMergedUser(null);
          setOnlineStatus('grey');
        }
      }

      setLoading(false);
    };

    fetchUserAndMe();
  }, [router, redirectTo, requireAuth]);

  // 3) Subscribe to realtime vehicle updates for “/me” refresh on change
  useEffect(() => {
    if (!mergedUser?.id || !accessToken) return;

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
          // On any vehicle change, re-fetch "/me" to refresh mergedUser (and online_status)
          const { data, error } = await authFetch('/me', {
            method: 'GET',
            accessToken,
          });
          if (!error && data) {
            setMergedUser(data as MergedUser);
            setOnlineStatus((data as MergedUser).online_status ?? 'grey');
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
