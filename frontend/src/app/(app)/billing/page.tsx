// src/app/billing/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStripe } from '@stripe/react-stripe-js';
import { apiFetchSafe } from '@/lib/api';
import { motion } from 'framer-motion';
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
    description: '1 device, 2 API calls per day, 1 day log retention. No webhooks, no priority support.',
    selectable: false, // Kan aldrig aktivt väljas – endast fallback/nuvarande
  },
  {
    id: 'basic_monthly',
    name: 'Basic Plan',
    price: '€1.99 / month / device',
    description: 'Up to 2 devices, 10 API calls per device/day, 7 days log retention.',
    selectable: true,
  },
  {
    id: 'pro_monthly',
    name: 'Pro Plan',
    price: '€4.99 / month / device',
    description: 'Up to 5 devices, 100 API calls per device/day, webhook & priority support.',
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

export default function BillingPage() {
  const { mergedUser, loading: authLoading } = useAuth({
    requireAuth: true,
    redirectTo: '/login',
  });
  const stripe = useStripe();
  // Default markerar aktuell nivå om inte SMS
  const defaultPlan = subscriptionPlans.find((plan) => plan.id === mergedUser?.tier) || subscriptionPlans[0];
  const [selected, setSelected] = useState<string>(defaultPlan.id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (authLoading || !mergedUser) return null;

  const tier: UserTier = mergedUser.tier as UserTier;

  const isCurrentPlan = (planId: string) => {
    if (planId === 'free' && tier === 'free') return true;
    if (planId === 'basic_monthly' && tier === 'basic') return true;
    if (planId === 'pro_monthly' && tier === 'pro') return true;
    return false;
  };

  // Du kan endast köpa abonnemang om planen är selectable och det inte redan är din nivå
  const canSubscribe =
    selected.startsWith('sms_') ||
    (selected === 'basic_monthly' && tier !== 'basic') ||
    (selected === 'pro_monthly' && tier !== 'pro');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe) {
      setError('Stripe has not loaded yet.');
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await apiFetchSafe('/api/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({
        action: selected.startsWith('sms_') ? 'purchase_sms' : 'subscribe',
        planId: selected,
      }),
    });

    if (fetchError || !data?.clientSecret) {
      setError(fetchError?.message || 'Failed to initiate checkout');
      setLoading(false);
      return;
    }

    const sessionId = data.clientSecret; // Checkout Session ID
    const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
    if (stripeError) {
      setError(stripeError.message || 'Failed to redirect to checkout');
      setLoading(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Choose Your Plan</h1>

        {/* Subscription plans */}
        <h2 className="text-xl font-bold mb-2">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {subscriptionPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => plan.selectable && setSelected(plan.id)}
              disabled={!plan.selectable}
              className={`p-4 border rounded-lg text-left relative transition ${
                selected === plan.id ? 'border-green-600 bg-green-50' : 'border-gray-200'
              } ${!plan.selectable ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              className={`p-4 border rounded-lg text-left transition ${
                selected === plan.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="text-gray-700">{plan.price}</p>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </button>
          ))}
        </div>

        {/* Subscribe/Buy form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={!stripe || loading || !canSubscribe}
            className={`w-full px-4 py-2 font-semibold rounded ${
              !canSubscribe
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : selected.startsWith('sms_')
                ? 'bg-blue-600 text-white'
                : 'bg-green-600 text-white'
            }`}
          >
            {loading
              ? 'Processing...'
              : selected.startsWith('sms_')
              ? 'Buy SMS Pack'
              : 'Subscribe'}
          </button>
        </form>

        {/* Cancel subscription */}
        {(tier === 'pro' || tier === 'basic') && (
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
              If you cancel, your account will automatically fall back to the Free plan.
            </div>
          </div>
        )}
      </div>
    </motion.main>
  );
}
