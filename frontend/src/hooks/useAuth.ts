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
  vendor?: string;
  full_name?: string;
  created_at?: string;
}

export function useAuth({
  redirectTo = '/login',
  requireAuth = true,
}: {
  redirectTo?: string;
  requireAuth?: boolean;
} = {}) {
  const [authUser, setAuthUser] = useState<User | null>(null); // raw Supabase user
  const [mergedUser, setMergedUser] = useState<MergedUser | null>(null); // enriched from /api/me
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
          setMergedUser(data); // contains approved, role, vendor etc
        } else {
          setMergedUser(null);
        }
      }

      setLoading(false);
    };

    fetchUserAndMe();
  }, [router, redirectTo, requireAuth]);

  return {
    user: authUser,
    mergedUser,
    accessToken,
    loading,
    isAdmin: mergedUser?.role === 'admin',
    isApproved: mergedUser?.approved === true,
  };
}
