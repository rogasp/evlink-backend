'use client';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { apiFetchSafe } from "@/lib/api";

const allowRegister = process.env.NEXT_PUBLIC_ALLOW_REGISTER === 'true';

interface ApiResponse<T> {
  data: T | null;
  error: { message?: string } | null;
}

interface RegisterResponse {
  message?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error }: ApiResponse<RegisterResponse> = await apiFetchSafe('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) throw new Error(error.message || "Registration failed");
      toast.success(data?.message || "Registration successful");

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) throw new Error(result.error);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      console.error("Registration error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error }: ApiResponse<{ message?: string }> = await apiFetchSafe('/interest', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) throw new Error(error.message || "Submission failed");
      toast.success(data?.message || "Thank you for your interest!");
      setName('');
      setEmail('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      console.error("Interest submission error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-white px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">
          {allowRegister ? 'Create Account' : 'Stay Updated'}
        </h1>

        <form onSubmit={allowRegister ? handleRegister : handleInterestSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-1">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {allowRegister && (
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading
              ? allowRegister ? 'Registering...' : 'Submitting...'
              : allowRegister ? 'Register' : 'Notify Me'}
          </button>
        </form>

        {allowRegister ? (
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-600 hover:underline">
              Log In
            </a>
          </p>
        ) : (
          <p className="text-center text-sm text-gray-500 mt-6">
            EVLink is currently under development. You&apos;ll be the first to know when we launch.
          </p>
        )}
      </div>
    </main>
  );
}
