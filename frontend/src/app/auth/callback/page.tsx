'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Initiera session (för cookie)
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error.message);
        router.replace('/login');
        return;
      }

      if (!session) {
        router.replace('/login');
        return;
      }

      // Nu hämtar vi user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const code = sessionStorage.getItem('access_code');
        if (code) {
          try {
            const res = await fetch('/api/public/access-code/use', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, user_id: user.id }),
            });

            if (res.ok) {
              console.info('✅ Access code linked to user');
              sessionStorage.removeItem('access_code');
            } else {
              console.warn('⚠️ Access code invalid or already used');
            }
          } catch (err) {
            console.error('Error using access code:', err);
          }
        }
      }

      // Till dashboard
      router.replace('/dashboard');
    };

    handleCallback();
  }, [router]);

  return <p className="text-center p-8">Logging you in...</p>;
}
