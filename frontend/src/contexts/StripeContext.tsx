'use client';

import React, { createContext, useContext } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe promise with correct typing
const stripePromise: Promise<Stripe | null> = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
);

type StripeContextType = { stripePromise: Promise<Stripe | null> };

// Create context with correct type
const StripeContext = createContext<StripeContextType | null>(null);

export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StripeContext.Provider value={{ stripePromise }}>
    <Elements stripe={stripePromise}>{children}</Elements>
  </StripeContext.Provider>
);

export function useStripeContext(): StripeContextType {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripeContext must be used within StripeProvider'); /* Hardcoded string */
  }
  return context;
}