'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">Welcome to your Dashboard</h1>
        <p className="text-gray-700 mb-6">You are successfully logged in!</p>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Log Out
        </button>
      </div>
    </main>
  );
}
