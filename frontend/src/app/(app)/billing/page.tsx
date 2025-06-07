// src/app/billing/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStripe } from '@stripe/react-stripe-js';
import { apiFetchSafe } from '@/lib/api';
import { motion } from 'framer-motion';

type Plan = {
  id: string;
  name: string;
  price: string;
  description: string;
};

const plans: Plan[] = [
  { id: 'pro_monthly', name: 'Pro Plan', price: '€4.99 / month', description: 'Upgrade for up to 3 vehicles, alerts and push updates.' },
  { id: 'sms_50', name: '50 SMS Pack', price: '€10', description: 'Get 50 SMS notifications for offline vehicle alerts.' },
  { id: 'sms_100', name: '100 SMS Pack', price: '€18', description: 'Get 100 SMS notifications for offline vehicle alerts.' },
];

export default function BillingPage() {
  const stripe = useStripe();
  const [selected, setSelected] = useState<string>(plans[0].id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      body: JSON.stringify({ action: selected.startsWith('sms_') ? 'purchase_sms' : 'subscribe', planId: selected }),
    });

    if (fetchError || !data?.clientSecret) {
      setError(fetchError?.message || 'Failed to initiate checkout');
      setLoading(false);
      return;
    }

    // Här är clientSecret egentligen Checkout Session ID
    const sessionId = data.clientSecret;

    const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
    if (stripeError) {
      setError(stripeError.message || 'Failed to redirect to checkout');
      setLoading(false);
      return;
    }
    // Stripe hanterar redirect till success/cancel URL
  };

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Choose Your Plan</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`p-4 border rounded-lg text-left ${
                selected === plan.id ? 'border-green-600 bg-green-50' : 'border-gray-200'
              }`}
            >
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="text-gray-700">{plan.price}</p>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded"
          >
            {loading
              ? 'Processing...'
              : selected.startsWith('sms_')
              ? 'Buy SMS Pack'
              : 'Subscribe'}
          </button>
          {!selected.startsWith('sms_') && (
            <Link href="/app" className="block text-center text-gray-600 hover:underline mt-2">
              Cancel Subscription
            </Link>
          )}
        </form>
      </div>
    </motion.main>
  );
}
