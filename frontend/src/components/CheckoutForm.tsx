'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiFetchSafe } from '@/lib/api';

export default function CheckoutForm({ planId }: { planId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { data, error: intentError } = await apiFetchSafe('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
    if (intentError) {
      setError(intentError.message);
      setLoading(false);
      return;
    }

    const clientSecret = data.clientSecret;
    const card = elements.getElement(CardElement);
    if (!card) return;

    const result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
    if (result.error) {
      setError(result.error.message!);
    } else if (result.paymentIntent?.status === 'succeeded') {
      window.location.href = '/success';
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement />
      {error && <div className="text-red-600">{error}</div>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
    </form>
  );
}