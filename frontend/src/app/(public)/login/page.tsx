'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

const allowRegister = process.env.NEXT_PUBLIC_ALLOW_REGISTER === 'true';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">Login to EVLink</h1>

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

        {allowRegister && (
          <>
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
          </>
        )}

        {allowRegister && (
          <p className="text-center text-xs text-gray-500 mt-6">
            Don’t have an account?{' '}
            <a href="/register" className="text-indigo-600 hover:underline">
              Click here to register
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
