// src/app/link-callback/page.tsx
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LinkCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Vänta 3 sekunder innan redirect
    const timeout = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded shadow-md text-center space-y-6">
        <h1 className="text-3xl font-bold text-green-600">Linking Completed!</h1>
        <p className="text-gray-700">Thank you for linking your vehicle.</p>
        <p className="text-gray-400 text-sm">Redirecting to your dashboard...</p>
      </div>
    </main>
  );
}
