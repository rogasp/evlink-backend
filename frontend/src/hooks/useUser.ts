// src/hooks/useUser.ts
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { apiFetchSafe } from '@/lib/api';

export type Tier = "free" | "basic" | "pro" | "custom"; /* Hardcoded string */ /* Hardcoded string */ /* Hardcoded string */ /* Hardcoded string */

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
  const [tier, setTier] = useState<Tier>('free'); /* Hardcoded string */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        // 1. Retrieve Supabase session /* Hardcoded string */
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        // 2. If no token, user is logged out /* Hardcoded string */
        if (!session?.access_token) {
          setIsLoggedIn(false);
          return;
        }

        setIsLoggedIn(true);

        // 3. Fetch subscription status via Next.js proxy /* Hardcoded string */
        const { data, error } = await apiFetchSafe(
          '/api/user/subscription-status', /* Hardcoded string */
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!mounted) return;

        if (error) {
          console.warn('Subscription status fetch error:', error); /* Hardcoded string */
        } else if (data?.tier) {
          setTier(data.tier as Tier);
        }
      } catch (err) {
        console.error('useUser loadUser error:', err); /* Hardcoded string */
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();
    return () => { mounted = false; };
  }, []);

  return { loading, isLoggedIn, tier };
}
