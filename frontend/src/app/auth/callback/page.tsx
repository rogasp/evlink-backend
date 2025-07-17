'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/authFetch';

export default function AuthCallback() {
  const router = useRouter();
  const [showNotApproved, setShowNotApproved] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[📥 callback] Starting auth callback handler...');

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        console.error('[❌ callback] Session error or no user');
        router.replace('/login');
        return;
      }

      const user = session.user;
      setUserId(user.id);
      console.log('[✅ callback] User signed in:', user.id, user.email);

      // 🧪 Backup access_code logic
      const accessCode = sessionStorage.getItem('access_code');
      console.log('[📦 callback] Found access code in sessionStorage:', accessCode);

      if (accessCode) {
        try {
          const res = await fetch('/api/public/access-code/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: accessCode, user_id: user.id }),
          });

          const json = await res.json();
          console.log('[📤 callback] Access code used:', res.status, json);
        } catch (err) {
          console.error('[❌ callback] Failed to use access code:', err);
        } finally {
          sessionStorage.removeItem('access_code');
        }
      }

      // 🔍 Hämta info från /me
      const meRes = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!meRes.ok) {
        console.error('[❌ callback] Failed to fetch /me');
        router.replace('/login');
        return;
      }

      const me = await meRes.json();

      if (!me.accepted_terms) {
        setShowTermsModal(true);
        return;
      }

      router.replace('/dashboard');
    };

    handleCallback();
  }, [router]);

  const handleAcceptTerms = async () => {
    if (!userId) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const res = await authFetch(`/user/${userId}`, {
      method: 'PATCH',
      accessToken: session.access_token,
      body: JSON.stringify({ accepted_terms: true }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.error) {
      setShowTermsModal(false);
      router.replace('/dashboard');
    } else {
      console.error('[❌ callback] Failed to accept terms:', res.error);
    }
  };

  const handleDeclineTerms = async () => {
    if (!userId) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    await authFetch(`/user/${userId}`, {
      method: 'DELETE',
      accessToken: session.access_token,
    });
    await supabase.auth.signOut();
    router.replace('/');
  };

  const handleNotApprovedClose = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <>
      <p className="text-center p-8">Logging you in...</p>

      <Dialog open={showNotApproved} onOpenChange={setShowNotApproved}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Not yet approved</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Your account is not approved yet. You have been logged out.</p>
          <DialogFooter>
            <Button onClick={handleNotApprovedClose}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terms & Conditions</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-gray-600">
            <p>To continue using EVLinkHA, you must accept the terms and conditions.</p>
            <p>
              Please read our{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-500 hover:text-blue-600"
              >
                full terms and conditions here
              </a>.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleDeclineTerms}>
              Decline
            </Button>
            <Button onClick={handleAcceptTerms}>Accept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
