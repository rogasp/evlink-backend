'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStripe } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
 
type UserTier = "free" | "basic" | "pro";

type Plan = {
  id: string;
  name: string;
  price: string;
  description: string;
  selectable: boolean;
};

const subscriptionPlans: Plan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '€0',
    description: '1 device, 2 API calls/day, 1 day log retention. No webhooks, no priority support.',
    selectable: false,
  },
  {
    id: 'basic_monthly',
    name: 'Basic Plan',
    price: '€1.99 / month / device',
    description: 'Up to 2 devices, 10 API calls/device/day, 7 days log retention.',
    selectable: true,
  },
  {
    id: 'pro_monthly',
    name: 'Pro Plan',
    price: '€4.99 / month / device',
    description: 'Up to 5 devices, 100 API calls/device/day, webhook & priority support.',
    selectable: true,
  },
];

const smsAddOns: Plan[] = [
  {
    id: 'sms_50',
    name: '50 SMS Pack',
    price: '€10',
    description: '50 SMS notifications for offline vehicle alerts.',
    selectable: true,
  },
  {
    id: 'sms_100',
    name: '100 SMS Pack',
    price: '€18',
    description: '100 SMS notifications for offline vehicle alerts.',
    selectable: true,
  },
];

import { authFetch } from '@/lib/authFetch';

export default function BillingPage() {
  const { mergedUser, loading: authLoading, accessToken } = useAuth({
    requireAuth: true,
    redirectTo: '/login',
  });
  const stripe = useStripe();
  const tier: UserTier = (mergedUser?.tier as UserTier) || "free";

  // Bestäm default markerad plan utifrån användarens nuvarande nivå
  const defaultPlan = subscriptionPlans.find((plan) => {
    if (plan.id === 'basic_monthly' && tier === 'basic') return true;
    if (plan.id === 'pro_monthly' && tier === 'pro') return true;
    if (plan.id === 'free' && tier === 'free') return true;
    return false;
  }) || subscriptionPlans[0];

  const [selected, setSelected] = useState<string>(defaultPlan.id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (authLoading || !mergedUser) {
    return (
      <div className="p-4 text-center text-lg text-gray-600">Loading...</div>
    );
  }

  // Hjälpfunktioner
  const isCurrentPlan = (planId: string) => {
    if (planId === 'free' && tier === 'free') return true;
    if (planId === 'basic_monthly' && tier === 'basic') return true;
    if (planId === 'pro_monthly' && tier === 'pro') return true;
    return false;
  };

  // Om användaren redan har abonnemang: "change_plan", annars "subscribe"
  const currentIsPaid = tier === 'pro' || tier === 'basic';
  const selectedIsPaid = selected === 'pro_monthly' || selected === 'basic_monthly';

  const canSubscribeOrChange =
    selected.startsWith('sms_') ||
    (selectedIsPaid && !isCurrentPlan(selected)) ||
    (!currentIsPaid && selectedIsPaid);

  // Submit-funktion
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accessToken) {
      setError("Not logged in");
      return;
    }
    if (!stripe) {
      setError('Stripe has not loaded yet.');
      return;
    }
    setLoading(true);

    const action =
      selected.startsWith('sms_') ? 'purchase_sms'
      : (currentIsPaid && selectedIsPaid && !isCurrentPlan(selected)) ? 'change_plan'
      : (!currentIsPaid && selectedIsPaid) ? 'subscribe'
      : null;

    if (!action) {
      setError("Nothing to do");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await authFetch('/api/payments/checkout', {
      method: 'POST',
      accessToken,
      body: JSON.stringify({
        action,
        planId: selected,
      }),
    });

    if (fetchError) {
      setError(fetchError.message || 'Failed to initiate checkout');
      setLoading(false);
      return;
    }

    // SMS-köp/planbyte/nyteckning: olika flöden
    if (action === "subscribe" || action === "purchase_sms") {
      if (!data?.clientSecret) {
        setError("Failed to start Stripe Checkout");
        setLoading(false);
        return;
      }
      const sessionId = data.clientSecret;
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) {
        setError(stripeError.message || 'Failed to redirect to checkout');
      }
    } else if (action === "change_plan") {
      toast.success("Subscription updated! You may need to reload the page to see new features.");
      window.location.reload();
    }

    setLoading(false);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <h1 className="text-2xl font-bold mb-4">Choose Your Plan</h1>

      {/* Subscription plans */}
      <h2 className="text-xl font-bold mb-2">Subscription Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {subscriptionPlans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => plan.selectable && setSelected(plan.id)}
            disabled={!plan.selectable}
            className={`p-4 border rounded-lg text-left relative transition 
              ${selected === plan.id ? 'border-green-600 bg-green-50' : 'border-gray-200'}
              ${!plan.selectable ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ minHeight: 170 }}
          >
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="text-gray-700">{plan.price}</p>
            <p className="text-sm text-gray-500">{plan.description}</p>
            {isCurrentPlan(plan.id) && (
              <span className="absolute top-3 right-3 bg-green-200 text-green-800 px-2 py-1 text-xs rounded font-bold">
                Current plan
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SMS add-ons */}
      <h2 className="text-lg font-bold mb-2 mt-8">Add-on: SMS Notifications</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {smsAddOns.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelected(plan.id)}
            className={`p-4 border rounded-lg text-left transition 
              ${selected === plan.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
          >
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="text-gray-700">{plan.price}</p>
            <p className="text-sm text-gray-500">{plan.description}</p>
          </button>
        ))}
      </div>

      {/* Subscribe/Buy/Change Plan form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        <Button
          type="submit"
          disabled={loading || !canSubscribeOrChange}
          className="w-full"
        >
          {loading
            ? 'Processing...'
            : selected.startsWith('sms_')
            ? 'Buy SMS Pack'
            : (!currentIsPaid && selectedIsPaid)
            ? 'Subscribe'
            : 'Change Plan'}
        </Button>
      </form>

      {/* Cancel subscription */}
      {currentIsPaid && (
        <div className="mt-4 text-center">
          <Link
            href="https://billing.stripe.com/p/login/3cIeVea1X3sCeZrfcOawo00"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:underline"
          >
            Cancel Subscription
          </Link>
          <div className="text-xs text-gray-500 mt-2">
            If you cancel, your account will automatically fall back to the Free plan at the end of your billing period.
          </div>
        </div>
      )}
    </motion.main>
  );
}
