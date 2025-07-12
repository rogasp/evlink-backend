'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewsletterVerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) {
      toast.error('Missing verification code'); /* Hardcoded string */
      router.replace('/');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/newsletter/verify?code=${code}`);
        const data = await res.json();
        if (!res.ok) {
          const detail = data.detail || 'Verification failed'; /* Hardcoded string */
          toast.error(detail);
        } else {
          toast.success('Newsletter subscription confirmed!'); /* Hardcoded string */
        }
      } catch (err) {
        console.error('[NewsletterVerify]', err); /* Hardcoded string */
        toast.error('Verification failed'); /* Hardcoded string */
      } finally {
        router.replace('/');
      }
    };

    verify();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      {/* Hardcoded string */}
      <p className="text-gray-600 text-sm">Verifying newsletter subscription...</p>
    </main>
  );
}