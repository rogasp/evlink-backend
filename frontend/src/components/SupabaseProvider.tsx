'use client';

import { useState, useEffect } from 'react';
import { PropsWithChildren } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { SupabaseContext } from '@/lib/supabaseContext';

export const SupabaseProvider = ({ children }: PropsWithChildren) => {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  // 🔁 Add refresh listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[🟢 AuthStateChange]', event);

      if (event === 'TOKEN_REFRESHED') {
        console.log('[✅ Access token refreshed]');
      }

      if (event === 'SIGNED_OUT') {
        console.log('[👋 Signed out]');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};
