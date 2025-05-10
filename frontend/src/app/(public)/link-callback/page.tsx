'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LinkCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Här kan du lägga till analytics eller loggning om du vill
    console.log('[🔗] Returned from Enode Link flow');
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded shadow-md text-center space-y-6 max-w-md">
        <h1 className="text-2xl font-bold text-green-600">Vehicle linking in progress</h1>
        <p className="text-gray-600">
          If the connection was successful, your vehicle will appear on the dashboard shortly.
        </p>

        <Button
          className="mt-4 w-full"
          onClick={() => router.push('/dashboard')}
        >
          Continue to Dashboard
        </Button>
      </div>
    </main>
  );
}
