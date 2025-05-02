'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
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

  const handleGitHubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Toaster position="top-center" richColors />
      <div className="bg-white shadow-md rounded p-6 w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">Login to EVLink</h1>

        <form onSubmit={handleEmailLogin} className="space-y-4">
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
          onClick={handleGitHubLogin}
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
      </div>
    </main>
  );
}
