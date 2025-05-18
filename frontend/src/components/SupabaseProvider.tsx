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

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[🟢 AuthStateChange]', event, session);

      if (event === 'TOKEN_REFRESHED') {
        console.log('[✅ Access token refreshed]');
      }

      if (event === 'SIGNED_OUT') {
        console.log('[👋 Signed out]');
      }

      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id;
        const accessCode = sessionStorage.getItem('access_code');

        console.log('[🔐 SIGNED_IN]', userId);
        console.log('[📦 AccessCode]', accessCode);

        if (accessCode) {
          try {
            const res = await fetch('/api/public/access-code/use', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: accessCode, user_id: userId }),
            });

            const json = await res.json();
            console.log('[📤 Access code sent]', res.status, json);
          } catch (err) {
            console.error('[❌ Failed to send access code]', err);
          } finally {
            sessionStorage.removeItem('access_code');
          }
        }
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
