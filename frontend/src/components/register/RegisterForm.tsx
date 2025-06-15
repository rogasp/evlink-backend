'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TermsContent from '@/components/legal/TermsContent';
import PrivacyContent from '@/components/legal/PrivacyContent';
import OAuthGithubButton from './OAuthGithubButton';
import OAuthGoogleButton from './OAuthGoogleButton';

interface Props {
  setMagicLinkSent: (v: boolean) => void;
  setEmail: (email: string) => void;
  prefillEmail?: string;
  prefillName?: string;
}

export default function RegisterForm({ setMagicLinkSent, setEmail, prefillEmail, prefillName }: Props) {
  const [name, setName] = useState(prefillName || '');
  const [email, setEmailValue] = useState(prefillEmail || '');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast.warning('You must accept the Terms of Use and Privacy Policy.');
      return;
    }

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
      setEmail(email);
    } catch {
      toast.error('Failed to send magic link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="block text-gray-700 text-sm">
          Name
        </label>
        <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="block text-gray-700 text-sm">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmailValue(e.target.value)}
          required
        />
      </div>

      <div className="flex items-start gap-2 text-sm text-gray-700">
        <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(v) => setAcceptedTerms(!!v)} />
        <Label htmlFor="terms">
          I agree to the{' '}
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="underline text-indigo-600 hover:text-indigo-800">
                Terms of Use
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Terms of Use</DialogTitle>
              </DialogHeader>
              <TermsContent />
            </DialogContent>
          </Dialog>
          {' and '}
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="underline text-indigo-600 hover:text-indigo-800">
                Privacy Policy
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Privacy Policy</DialogTitle>
              </DialogHeader>
              <PrivacyContent />
            </DialogContent>
          </Dialog>
        </Label>
      </div>

      <Button type="submit" disabled={!acceptedTerms || loading} className="w-full h-9 text-sm">
        {loading ? 'Registering...' : 'Register with Magic Link'}
      </Button>

      <OAuthGithubButton disabled={!acceptedTerms || loading} />
      <OAuthGoogleButton disabled={!acceptedTerms || loading} />
    </form>
  );
}
