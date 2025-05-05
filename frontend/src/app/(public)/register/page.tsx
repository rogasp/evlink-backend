'use client';

import { useState, FormEvent } from 'react';
<<<<<<< HEAD
=======
import { useRouter } from 'next/navigation';
>>>>>>> origin/dev
import { toast } from 'sonner';
import { apiFetchSafe } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

const allowRegister = process.env.NEXT_PUBLIC_ALLOW_REGISTER === 'true';

interface ApiResponse<T> {
  data: T | null;
  error: { message?: string } | null;
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleMagicLinkRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { name },
          emailRedirectTo: `${location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      toast.success('Magic link sent! Check your email.');
      setMagicLinkSent(true);
    } catch (err) {
      console.error('Magic link error:', err);
      toast.error('Failed to send magic link.');
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
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw new Error(error.message || 'Submission failed');
      toast.success(data?.message || 'Thank you for your interest!');
      setName('');
      setEmail('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      console.error('Interest submission error:', err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-white px-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-indigo-700 mb-4 text-center">
          {allowRegister ? 'Create Account' : 'Stay Updated'}
        </h1>

        {magicLinkSent ? (
          <div className="text-center space-y-4 text-sm text-gray-700">
            <h2 className="text-lg font-semibold text-indigo-700">Almost there!</h2>
            <p>
<<<<<<< HEAD
              We&apos;ve sent a magic login link to <strong>{email}</strong>.
            </p>
            <p>Don&apos;t forget to check your spam folder.</p>
=======
              We've sent a magic login link to <strong>{email}</strong>.
            </p>
            <p>Don't forget to check your spam folder.</p>
>>>>>>> origin/dev
            <p className="text-xs text-gray-500">
              Sent from <em>Supabase Auth &lt;noreply@mail.app.supabase.io&gt;</em>
            </p>
          </div>
        ) : (
          <form onSubmit={allowRegister ? handleMagicLinkRegister : handleInterestSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-gray-700 text-sm">Name</label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-gray-700 text-sm">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-9 text-sm">
              {loading
                ? allowRegister ? 'Registering...' : 'Submitting...'
                : allowRegister ? 'Register with Magic Link' : 'Notify Me'}
            </Button>
          </form>
        )}

        {allowRegister && !magicLinkSent && (
          <>
            <div className="my-3 text-center text-sm text-gray-500">or</div>
            <Button
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'github',
                  options: {
                    redirectTo: `${location.origin}/auth/callback`,
                  },
                });

                if (error) toast.error(error.message);
              }}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 h-9 text-sm"
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

        <p className="text-center text-xs text-gray-500 mt-4">
          {allowRegister
            ? <>Already have an account? <a href="/login" className="text-indigo-600 hover:underline">Log In</a></>
            : <>EVLink is currently under development. You&apos;ll be the first to know when we launch.</>}
        </p>
      </div>
    </main>
  );
}
