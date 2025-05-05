'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { authFetch } from '@/lib/authFetch';

type WebhookSubscription = {
  enode_webhook_id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  last_success?: string;
  api_version?: string;
};

export default function AdminPage() {
  const { user, accessToken } = useAuth();
  const [subscriptions, setSubscriptions] = useState<WebhookSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState<WebhookSubscription | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await authFetch('/webhook/subscriptions', {
        method: 'GET',
        accessToken,
      });

      if (res.error) throw res.error;

      setSubscriptions(res.data || []);
      toast.success('Subscriptions refreshed');
    } catch (err) {
      toast.error('Could not load subscriptions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const handleSubscribe = async () => {
    if (!accessToken) return;
    try {
      const res = await authFetch('/webhook/subscriptions', {
        method: 'POST',
        accessToken,
      });

      if (res.error) throw res.error;

      await fetchSubscriptions();
      toast.success('Webhook subscription successful!');
    } catch (err) {
      toast.error('Webhook subscription failed');
      console.error(err);
    }
  };

  const confirmAndDelete = async () => {
    if (!confirmDeleteId || !accessToken) return;
    try {
      const res = await authFetch(`/webhook/subscriptions/${confirmDeleteId}`, {
        method: 'DELETE',
        accessToken,
      });

      if (res.error) throw res.error;

      toast.success('Webhook deleted');
      await fetchSubscriptions();
    } catch (err) {
      toast.error('Could not delete webhook');
      console.error(err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700">Webhook Admin Panel</h1>

      <div className="flex items-center gap-4">
        <Button onClick={handleSubscribe} variant="default">
          Subscribe to Webhooks
        </Button>
        <Button onClick={fetchSubscriptions} variant="outline" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden mt-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-2">Webhook ID</th>
              <th className="px-4 py-2">Last Success</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.enode_webhook_id} className="border-t">
                <td className="px-4 py-2">{sub.enode_webhook_id}</td>
                <td className="px-4 py-2">
                  {sub.last_success ? new Date(sub.last_success).toLocaleString() : '–'}
                </td>
                <td className="px-4 py-2">
                  <span className={sub.is_active ? 'text-green-600' : 'text-red-500'}>
                    {sub.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        title="View details"
                        onClick={() => setSelectedSub(sub)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Webhook Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 text-sm">
                        <div><strong>ID:</strong> {selectedSub?.enode_webhook_id}</div>
                        <div><strong>URL:</strong> {selectedSub?.url}</div>
                        <div><strong>Events:</strong> {selectedSub?.events.join(', ')}</div>
                        <div><strong>Created:</strong> {selectedSub?.created_at}</div>
                        <div><strong>Last Success:</strong> {selectedSub?.last_success}</div>
                        <div><strong>API Version:</strong> {selectedSub?.api_version ?? '–'}</div>
                        <div><strong>Active:</strong> {selectedSub?.is_active ? 'Yes' : 'No'}</div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="icon"
                    variant="destructive"
                    title="Delete webhook"
                    onClick={() => setConfirmDeleteId(sub.enode_webhook_id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && subscriptions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                  No subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this webhook?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmAndDelete}>
              Yes, Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
