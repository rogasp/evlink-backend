'use client';

import { useSession } from "next-auth/react";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function TestTokenPage() {
  const { data: session } = useSession();
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callProtectedApi = async () => {
    if (!session) {
      setError("Not logged in");
      return;
    }

    try {
      const res = await apiFetch('/protected-data', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.accessToken}`, // 👈 Här använder vi token!
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to call protected API');
      }

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong');
      } else {
        setError('Something went wrong');
      }
      setResponse(null);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-white px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg space-y-6 text-center">
        <h1 className="text-2xl font-bold text-indigo-700">
          Test Protected API
        </h1>

        <button
          onClick={callProtectedApi}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition"
        >
          Call API
        </button>

        {response && (
          <pre className="mt-4 text-green-600 bg-gray-100 p-4 rounded text-left overflow-x-auto">
            {response}
          </pre>
        )}

        {error && (
          <div className="mt-4 text-red-600">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
