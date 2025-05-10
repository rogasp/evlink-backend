// src/app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession(); // hämtar + initierar cookies

      if (error) {
        console.error('Auth callback error:', error.message);
      }

      if (session) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    };

    handleCallback();
  }, [router]);

  return <p className="text-center p-8">Logging you in...</p>;
}
