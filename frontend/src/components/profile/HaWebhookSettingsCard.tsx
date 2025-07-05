'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { authFetch } from '@/lib/authFetch';

interface HaWebhookSettingsCardProps {
  userId: string;
  accessToken: string;
}

export default function HaWebhookSettingsCard({ userId, accessToken }: HaWebhookSettingsCardProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookId, setWebhookId] = useState('');
  const [loading, setLoading] = useState(true);

  // Ladda in data vid mount
  useEffect(() => {
    let ignore = false;
    const fetchWebhook = async () => {
      setLoading(true);
      const { data, error } = await authFetch(`/user/${userId}/webhook`, {
        method: 'GET',
        accessToken,
      });
      if (!ignore && data) {
        setWebhookUrl(data.ha_external_url ?? '');
        setWebhookId(data.ha_webhook_id ?? '');
        if (error) toast.error('Could not fetch webhook settings');
        setLoading(false);
      }
    };
    fetchWebhook();
    return () => { ignore = true };
  }, [userId, accessToken]);

  // Spara till backend när fält lämnas (onBlur)
  const handleSave = async (field: 'webhook_url' | 'webhook_id', value: string) => {
    // Uppdatera det lokala state
    if (field === 'webhook_url') setWebhookUrl(value);
    if (field === 'webhook_id') setWebhookId(value);

    // Skicka alltid båda i PATCH
    const patchBody = {
      webhook_url: field === 'webhook_url' ? value : webhookUrl,
      webhook_id: field === 'webhook_id' ? value : webhookId,
    };

    const { error } = await authFetch(`/user/${userId}/webhook`, {
      method: 'PATCH',
      accessToken,
      body: JSON.stringify(patchBody),
      headers: { 'Content-Type': 'application/json' },
    });

    if (error) toast.error('Failed to save changes');
    else toast.success('Webhook updated!');
  };


  if (loading) return null; // Skeleton visas via page/layout

  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col gap-4 py-6">
        <span className="font-semibold">Home Assistant Webhook</span>
        <div>
          <label className="block text-xs text-muted-foreground mb-1" htmlFor="webhook-url">Webhook URL</label>
          <Input
            id="webhook-url"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            onBlur={e => handleSave('webhook_url', e.target.value)}
            className="w-full"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1" htmlFor="webhook-id">Webhook ID</label>
          <Input
            id="webhook-id"
            value={webhookId}
            onChange={e => setWebhookId(e.target.value)}
            onBlur={e => handleSave('webhook_id', e.target.value)}
            className="w-full"
            autoComplete="off"
          />
        </div>
      </CardContent>
    </Card>
  );
}
