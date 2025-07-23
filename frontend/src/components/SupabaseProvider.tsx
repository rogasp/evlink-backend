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

      if (event === 'TOKEN_REFRESHED') {
      }

      if (event === 'SIGNED_OUT') {
      }

      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id;
        const accessCode = sessionStorage.getItem('access_code');

        if (accessCode) {
          try {
            await fetch('/api/public/access-code/use', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: accessCode, user_id: userId }),
            });

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
