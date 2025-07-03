// src/hooks/useUser.ts
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { apiFetchSafe } from '@/lib/api';

export type Tier = "free" | "basic" | "pro" | "custom";

/**
 * Custom React hook to fetch and track user authentication and subscription status.
 * - Uses Supabase JS client to get session.
 * - Fetches subscription tier from FastAPI backend with explicit Bearer token.
 * - Manages loading, isLoggedIn, and tier state.
 *
 * Ensures the fetch to /api/user/subscription-status (Next.js proxy) is used
 * to avoid Next.js auth middleware redirecting.
 */
export function useUser() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tier, setTier] = useState<Tier>('free');

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        // 1. Retrieve Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        // 2. If no token, user is logged out
        if (!session?.access_token) {
          setIsLoggedIn(false);
          return;
        }

        setIsLoggedIn(true);

        // 3. Fetch subscription status via Next.js proxy
        const { data, error } = await apiFetchSafe(
          '/api/user/subscription-status', // ensure /api prefix
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!mounted) return;

        if (error) {
          console.warn('Subscription status fetch error:', error);
        } else if (data?.tier) {
          setTier(data.tier as Tier);
        }
      } catch (err) {
        console.error('useUser loadUser error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();
    return () => { mounted = false; };
  }, []);

  return { loading, isLoggedIn, tier };
}
