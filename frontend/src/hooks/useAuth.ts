'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export function useAuth({ redirectTo = '/login' }: { redirectTo?: string } = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        setUser(null);
        setAccessToken(null);
        router.push(redirectTo);
      } else {
        setUser(session.user);
        setAccessToken(session.access_token);
      }

      setLoading(false);
    };

    fetchSession();
  }, [router, redirectTo]);

  return { user, accessToken, loading };
}
