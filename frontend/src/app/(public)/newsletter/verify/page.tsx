'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function NewsletterVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      toast.error('Missing verification code');
      router.replace('/');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/newsletter/verify?code=${code}`);
        const data = await res.json();
        if (!res.ok) {
          const detail = data.detail || 'Verification failed';
          toast.error(detail);
        } else {
          toast.success('Newsletter subscription confirmed!');
        }
      } catch (err) {
        console.error('[NewsletterVerify]', err);
        toast.error('Verification failed');
      } finally {
        router.replace('/');
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-600 text-sm">Verifying newsletter subscription...</p>
    </main>
  );
}