'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[📥 callback] Starting auth callback handler...');

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('[❌ callback] Session fetch error:', error.message);
        router.replace('/login');
        return;
      }

      const user = session?.user;
      if (!user) {
        console.warn('[⚠️ callback] No user found in session');
        router.replace('/login');
        return;
      }

      console.log('[✅ callback] User signed in:', user.id, user.email);

      // 🧪 BACKUP access_code handling (should now be handled in SupabaseProvider)
      const accessCode = sessionStorage.getItem('access_code');
      console.log('[📦 callback] Found access code in sessionStorage:', accessCode);

      if (accessCode) {
        try {
          const res = await fetch('/api/public/access-code/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: accessCode, user_id: user.id }),
          });

          const json = await res.json();
          console.log('[📤 callback] Access code used:', res.status, json);
        } catch (err) {
          console.error('[❌ callback] Failed to use access code:', err);
        } finally {
          sessionStorage.removeItem('access_code');
        }
      }

      // ✅ Continue to dashboard
      router.replace('/dashboard');
    };

    handleCallback();
  }, [router]);


  return <p className="text-center p-8">Logging you in...</p>;
}
