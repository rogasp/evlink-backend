'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '@/lib/authFetch';

// Anpassa dessa typer efter din backend!
export interface Subscription {
  subscription_id: string;
  plan_name: string;
  price_id?: string;
  status: string;
  next_billing_date?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  amount?: number | null;
  currency?: string | null;
  [key: string]: unknown;
}

export interface Invoice {
  invoice_id: string;
  receipt_number: string; 
  created_at: string;
  amount_due: number;
  currency: string;
  status: string;
  pdf_url?: string;
  hosted_invoice_url?: string;
  [key: string]: unknown;
}

interface UseBillingInfoResult {
  subscription: Subscription | null;
  invoices: Invoice[];
  loadingBilling: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch subscription and invoices for the current user.
 */
export function useBillingInfo(
  userId?: string | null,
  accessToken?: string | null
): UseBillingInfoResult {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingBilling, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!accessToken) {
      setError('No access token');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Du kan byta till `/me/subscription` och `/me/invoices` om du vill
      const subRes = await authFetch(`/user/${userId}/subscription`, {
        method: 'GET',
        accessToken,
      });
      const invRes = await authFetch(`/user/${userId}/invoices`, {
        method: 'GET',
        accessToken,
      });

      if (subRes.error) throw new Error(subRes.error.message || 'Failed to fetch subscription');
      if (invRes.error) throw new Error(invRes.error.message || 'Failed to fetch invoices');

      setSubscription(subRes.data ?? null);
      setInvoices(Array.isArray(invRes.data) ? invRes.data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load billing info');
    } finally {
      setLoading(false);
    }
  }, [userId, accessToken]);

  useEffect(() => {
    if (!userId || !accessToken) {
      setSubscription(null);
      setInvoices([]);
      setLoading(false);
      return;
    }
    fetchAll();
  }, [userId, accessToken, fetchAll]);

  return {
    subscription,
    invoices,
    loadingBilling,
    error,
    refresh: fetchAll,
  };
}
