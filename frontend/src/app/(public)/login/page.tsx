'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
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
        console.error('❌ Failed to check registration status:', err); /* Hardcoded string */
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
      toast.success('Magic link sent! Check your email.'); /* Hardcoded string */
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

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
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
        {/* Hardcoded string */}
        <p className="text-gray-500 text-sm">Checking login status...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-md">
        {/* Hardcoded string */}
        <h1 className="text-xl font-bold mb-4 text-center">Login to EVLinkHA</h1>

        <form onSubmit={handleMagicLinkLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="you@example.com" /* Hardcoded string */
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending...' /* Hardcoded string */ : 'Send magic link' /* Hardcoded string */}
          </Button>
        </form>

        {/* Hardcoded string */}
        <div className="my-4 text-center text-sm text-gray-500">or</div>

        <Button
          onClick={handleGithubLogin}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
        >
          <Image
            src="/github-icon.png"
            alt="GitHub" /* Hardcoded string */
            width={20}
            height={20}
            className="h-5 w-5"
          />
          {/* Hardcoded string */}
          <span>Continue with GitHub</span>
        </Button>
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="mt-2 w-full flex items-center justify-center space-x-2"
        >
          <Image
            src="/google-icon.png"
            alt="Google" /* Hardcoded string */
            width={20}
            height={20}
            className="h-5 w-5"
          />
          {/* Hardcoded string */}
          <span>Continue with Google</span>
        </Button>


        {/* Hardcoded string */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline">
            Click here to register {/* Hardcoded string */}
          </Link>
        </p>
      </div>
    </main>
  );
}
