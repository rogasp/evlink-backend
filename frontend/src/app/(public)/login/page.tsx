'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import RegisterInterestForm from '@/components/register/RegisterInterestForm';
import Link from 'next/link';

export default function LoginPage() {
  const [allowRegister, setAllowRegister] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const res = await fetch('/api/public/registration-allowed');
        const json = await res.json();
        setAllowRegister(json.allowed === true);
      } catch (err) {
        console.error('❌ Failed to check registration status:', err);
        setAllowRegister(false);
      }
    };
    checkRegistration();
  }, []);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Magic link sent! Check your email.');
    }

    setLoading(false);
  };

  const handleGithubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  if (allowRegister === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-sm">Checking login status...</p>
      </main>
    );
  }

  // ❌ Block login and show interest form
  if (!allowRegister) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white shadow-md rounded p-6 w-full max-w-md">
          <h1 className="text-xl font-bold mb-4 text-center">Login Disabled</h1>
          <p className="text-sm text-gray-500 mb-4 text-center">
            EVLinkHA is currently in closed beta. Sign up to stay informed!
          </p>
          <RegisterInterestForm />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">Login to EVLinkHA</h1>

        <form onSubmit={handleMagicLinkLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Send magic link'}
          </Button>
        </form>

        <div className="my-4 text-center text-sm text-gray-500">or</div>

        <Button
          onClick={handleGithubLogin}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
        >
          <Image
            src="/github-icon.png"
            alt="GitHub"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          <span>Continue with GitHub</span>
        </Button>

        <p className="text-center text-xs text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline">
            Click here to register
          </Link>
        </p>
      </div>
    </main>
  );
}
