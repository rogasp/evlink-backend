'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authFetch } from '@/lib/authFetch';
import { useAuth } from '@/hooks/useAuth';

export default function LinkCallbackPage() {
  const router = useRouter();
  const { accessToken, loading } = useAuth();

  useEffect(() => {
    if (loading || !accessToken) return;

    const linkToken =
      typeof window !== 'undefined' ? localStorage.getItem('linkToken') : null;

    if (!linkToken || !accessToken) {
      toast.error('Missing link token or session');
      router.push('/dashboard');
      return;
    }

    const sendResult = async () => {
      const { data, error } = await authFetch('/user/link-result', {
        method: 'POST',
        accessToken,
        body: JSON.stringify({ linkToken }),
      });

      localStorage.removeItem('linkToken');

      if (error) {
        toast.error('Link result failed');
      } else {
        toast.success(`Vehicle linked: ${data.vendor || 'Success'}`);
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 2500);
    };

    sendResult();
  }, [loading, accessToken, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded shadow-md text-center space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">Processing link...</h1>
        <p className="text-gray-600">Please wait while we finalize your connection.</p>
      </div>
    </main>
  );
}
