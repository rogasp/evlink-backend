// src/components/NewsletterModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

/**
 * NewsletterModal shows a small banner at the bottom of the screen prompting
 * users (logged in or not) to subscribe to the newsletter. Once dismissed or
 * submitted, it will not show again.
 */
export default function NewsletterModal() {
  const { user, mergedUser, loading: authLoading } = useAuth({ requireAuth: false });
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>(''); // optional
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'subscribed'>('idle');

  // Check localStorage flag on the client
  const hasDismissedLocal =
    typeof window !== 'undefined' &&
    localStorage.getItem('newsletterModalDismissed') === 'true';

  // If logged-in user is already subscribed (mergedUser.is_subscribed), hide modal
  const isAlreadySubscribed = mergedUser?.is_subscribed === true;

  useEffect(() => {
    if (authLoading) return;

    // Logged-in & already subscribed → never show
    if (user && isAlreadySubscribed) {
      setVisible(false);
      return;
    }

    // Hide if it was dismissed locally
    if (hasDismissedLocal) {
      setVisible(false);
      return;
    }

    // Otherwise, show modal
    setVisible(true);

    // Prefill email & name if logged in
    if (user && user.email) {
      setEmail(user.email);
      if (mergedUser?.name) setName(mergedUser.name);
    }
  }, [user, mergedUser, authLoading, isAlreadySubscribed, hasDismissedLocal]);

  // If not visible, do not render anything
  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    // Persist dismissal so modal does not reappear
    localStorage.setItem('newsletterModalDismissed', 'true');
  };

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      // Build payload. Only include name if non-empty
      const payload: Record<string, string> = { email };
      if (name.trim()) {
        payload.name = name.trim();
      }

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        const detail = result.detail || 'Subscription failed.';
        throw new Error(detail);
      }

      if (result.status === 'pending_verification') {
        setStatus('pending');
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        // Unexpected status, but treat as pending
        setStatus('pending');
        toast.success('Please check your email for the verification link.');
      }

        // Prevent modal from showing again
      localStorage.setItem('newsletterModalDismissed', 'true');
    } catch (e) {
      console.error('[NewsletterSubscribe]', e);
      toast.error((e as Error).message || 'Could not subscribe. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-lg mx-4 sm:mx-auto flex flex-col sm:flex-row items-center">
        <div className="flex-1">
          {status === 'idle' && (
            <>
              <p className="text-gray-800 mb-2">
                Want to receive our newsletter? (GDPR‐compliant opt-in)
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="email"
                  className="border border-gray-300 rounded px-3 py-2 flex-1 focus:outline-none focus:ring focus:ring-indigo-200"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!user} // if logged in, email is locked
                />
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-2 flex-1 focus:outline-none focus:ring focus:ring-indigo-200"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!!user} // if logged in, name is locked
                />
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                  onClick={handleSubscribe}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Subscribe'}
                </button>
              </div>
            </>
          )}

          {status === 'pending' && (
            <p className="text-gray-800">
              Thanks! A verification link has been sent to your email. Please click the link to confirm subscription.
            </p>
          )}
        </div>

        <button
          className="text-gray-500 hover:text-gray-700 ml-4 mt-2 sm:mt-0"
          onClick={handleClose}
          aria-label="Close newsletter modal"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
