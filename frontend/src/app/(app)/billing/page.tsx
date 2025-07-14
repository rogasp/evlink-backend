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
    name: 'Free Plan', /* Hardcoded string */
    price: '€0', /* Hardcoded string */
    description: '1 device, 2 API calls/day, 1 day log retention. No webhooks, no priority support.', /* Hardcoded string */
    selectable: false,
  },
  {
    id: 'basic_monthly',
    name: 'Basic Plan', /* Hardcoded string */
    price: '€1.99 / month / device', /* Hardcoded string */
    description: 'Up to 2 devices, 10 API calls/device/day, 7 days log retention.', /* Hardcoded string */
    selectable: true,
  },
  {
    id: 'pro_monthly',
    name: 'Pro Plan', /* Hardcoded string */
    price: '€4.99 / month / device', /* Hardcoded string */
    description: 'Up to 5 devices, 100 API calls/device/day, webhook & priority support.', /* Hardcoded string */
    selectable: true,
  },
];

const smsAddOns: Plan[] = [
  {
    id: 'sms_50',
    name: '50 SMS Pack', /* Hardcoded string */
    price: '€10', /* Hardcoded string */
    description: '50 SMS notifications for offline vehicle alerts.', /* Hardcoded string */
    selectable: true,
  },
  {
    id: 'sms_100',
    name: '100 SMS Pack', /* Hardcoded string */
    price: '€18', /* Hardcoded string */
    description: '100 SMS notifications for offline vehicle alerts.', /* Hardcoded string */
    selectable: true,
  },
];

const apiTokenAddOns: Plan[] = [
  {
    id: 'token_2500',
    name: '2,500 API Tokens', /* Hardcoded string */
    price: '€4.99', /* Hardcoded string */
    description: '2,500 API calls, used after monthly allowance is exhausted.', /* Hardcoded string */
    selectable: true,
  },
  {
    id: 'token_10000',
    name: '10,000 API Tokens', /* Hardcoded string */
    price: '€14.99', /* Hardcoded string */
    description: '10,000 API calls, used after monthly allowance is exhausted.', /* Hardcoded string */
    selectable: true,
  },
  {
    id: 'token_50000',
    name: '50,000 API Tokens', /* Hardcoded string */
    price: '€49.99', /* Hardcoded string */
    description: '50,000 API calls, used after monthly allowance is exhausted.', /* Hardcoded string */
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
  // Hardcoded string: "Bestäm default markerad plan utifrån användarens nuvarande nivå"
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
      // Hardcoded string: "Loading..."
      <div className="p-4 text-center text-lg text-gray-600">Loading...</div>
    );
  }

  // Hjälpfunktioner
  // Hardcoded string: "Hjälpfunktioner"
  const isCurrentPlan = (planId: string) => {
    if (planId === 'free' && tier === 'free') return true;
    if (planId === 'basic_monthly' && tier === 'basic') return true;
    if (planId === 'pro_monthly' && tier === 'pro') return true;
    return false;
  };

  // Om användaren redan har abonnemang: "change_plan", annars "subscribe"
  // Hardcoded string: "Om användaren redan har abonnemang: "change_plan", annars "subscribe""
  const currentIsPaid = tier === 'pro' || tier === 'basic';
  const selectedIsPaid = selected === 'pro_monthly' || selected === 'basic_monthly';

  const canSubscribeOrChange =
    selected.startsWith('sms_') || selected.startsWith('token_') ||
    (selectedIsPaid && !isCurrentPlan(selected)) ||
    (!currentIsPaid && selectedIsPaid);

  // Submit-funktion
  // Hardcoded string: "Submit-funktion"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accessToken) {
      setError("Not logged in"); /* Hardcoded string */
      return;
    }
    if (!stripe) {
      setError('Stripe has not loaded yet.'); /* Hardcoded string */
      return;
    }
    setLoading(true);

    const action =
      selected.startsWith('sms_') || selected.startsWith('token_') ? 'purchase_add_on'
      : (currentIsPaid && selectedIsPaid && !isCurrentPlan(selected)) ? 'change_plan'
      : (!currentIsPaid && selectedIsPaid) ? 'subscribe'
      : null;

    if (!action) {
      setError("Nothing to do"); /* Hardcoded string */
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
      setError(fetchError.message || 'Failed to initiate checkout'); /* Hardcoded string */
      setLoading(false);
      return;
    }

    // SMS-köp/planbyte/nyteckning: olika flöden
    // Hardcoded string: "SMS-köp/planbyte/nyteckning: olika flöden"
    if (action === "subscribe" || action === "purchase_sms" || action === "purchase_add_on") {
      if (!data?.clientSecret) {
        setError("Failed to start Stripe Checkout"); /* Hardcoded string */
        setLoading(false);
        return;
      }
      const sessionId = data.clientSecret;
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) {
        setError(stripeError.message || 'Failed to redirect to checkout'); /* Hardcoded string */
      }
    } else if (action === "change_plan") {
      toast.success("Subscription updated! You may need to reload the page to see new features."); /* Hardcoded string */
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
      {/* Hardcoded string */}
      <h1 className="text-2xl font-bold mb-4">Choose Your Plan</h1>

      {/* Subscription plans */}
      {/* Hardcoded string */}
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
                Current plan {/* Hardcoded string */}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* API Token add-ons */}
      <h2 className="text-lg font-bold mb-2 mt-8">Add-on: API Tokens</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {apiTokenAddOns.map((plan) => (
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

      {/* SMS add-ons */}
      {/* Hardcoded string */}
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
            ? 'Processing...' /* Hardcoded string */
            : selected.startsWith('sms_') || selected.startsWith('token_')
            ? 'Buy Add-on' /* Hardcoded string */
            : (!currentIsPaid && selectedIsPaid)
            ? 'Subscribe' /* Hardcoded string */
            : 'Change Plan' /* Hardcoded string */}
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
            Cancel Subscription {/* Hardcoded string */}
          </Link>
          <div className="text-xs text-gray-500 mt-2">
            If you cancel, your account will automatically fall back to the Free plan at the end of your billing period. {/* Hardcoded string */}
          </div>
        </div>
      )}
    </motion.main>
  );
}
