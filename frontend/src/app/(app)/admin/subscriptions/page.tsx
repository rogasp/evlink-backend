'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { authFetch } from '@/lib/authFetch';
import type { SubscriptionPlan } from '@/types/subscription';
import { useAuth } from '@/hooks/useAuth';
import { NewPlanModal } from './NewPlanModal';

export default function SubscriptionAdminPage() {
  const { accessToken } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchPlans = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await authFetch('/admin/subscription-plans', { method: 'GET', accessToken });
      if (res.error) {
        toast.error('Failed to fetch subscription plans');
        setPlans([]);
        return;
      }
      setPlans(res.data || []);
    } catch {
      toast.error('Could not load subscription plans');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const syncPlans = useCallback(async () => {
    if (!accessToken) return;
    setSyncing(true);
    try {
      const res = await authFetch('/admin/subscription-plans/sync', { method: 'POST', accessToken });
      if (res.error) {
        toast.error('Sync failed');
      } else {
        toast.success(
          `Sync complete: ${res.data?.inserted ?? 0} new, ${res.data?.updated ?? 0} updated`
        );
        fetchPlans();
      }
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  }, [accessToken, fetchPlans]);

  useEffect(() => {
    if (accessToken) fetchPlans();
  }, [accessToken, fetchPlans]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <NewPlanModal onCreated={fetchPlans} />
        <Button onClick={syncPlans} disabled={syncing || !accessToken} variant="outline">
          {syncing ? (
            <>
              <Loader2 className="mr-2 animate-spin" /> Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2" /> Sync with Stripe
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-6">
              <Loader2 className="animate-spin mr-2" /> Loading...
            </div>
          ) : plans.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No subscription plans found.
            </div>
          ) : (
            <table className="min-w-full table-auto border-t">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left text-sm font-medium">Name</th>
                  <th className="p-2 text-left text-sm font-medium">Type</th>
                  <th className="p-2 text-left text-sm font-medium">Price</th>
                  <th className="p-2 text-left text-sm font-medium">Interval</th>
                  <th className="p-2 text-left text-sm font-medium">Active</th>
                  <th className="p-2 text-left text-sm font-medium">Stripe Price ID</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b">
                    <td className="p-2 font-semibold">{plan.name}</td>
                    <td className="p-2">{plan.type}</td>
                    <td className="p-2">
                      {(plan.amount / 100).toLocaleString(undefined, {
                        style: 'currency',
                        currency: plan.currency.toUpperCase(),
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2">{plan.interval ?? '-'}</td>
                    <td className="p-2">
                      {plan.is_active ? (
                        <span className="text-green-700 font-bold">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="p-2 text-xs font-mono break-all">{plan.stripe_price_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
