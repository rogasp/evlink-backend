// src/components/profile/HaWebhookSettingsCard.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHaWebhookSettings } from '@/hooks/useHaWebhookSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

type Props = {
  userId: string;
};

export default function HaWebhookSettingsCard({ userId }: Props) {
  const {
    loading,
    webhookId,
    externalUrl,
    setWebhookId,
    setExternalUrl,
    save,
    error,
  } = useHaWebhookSettings(userId);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const ok = await save(webhookId, externalUrl);
    if (ok) toast.success('Settings saved!');
    else toast.error('Failed to save settings');
    setSaving(false);
  };

  if (loading) {
    // Byt ut mot din egen skeleton loader från shadcn om du vill
    return <Skeleton className="w-full h-24 rounded-xl" />;
  }

  return (
    <div className="p-4 border rounded-xl space-y-4 max-w-xl bg-muted/40">
      <h3 className="font-semibold text-lg">Home Assistant Webhook Settings</h3>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Webhook Entry ID</label>
        <Input
          value={webhookId}
          onChange={e => setWebhookId(e.target.value)}
          placeholder="HA Entry ID"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">External HA URL</label>
        <Input
          value={externalUrl}
          onChange={e => setExternalUrl(e.target.value)}
          placeholder="https://your-ha.example.com"
        />
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
      {error && <div className="text-red-600 text-xs">{error}</div>}
    </div>
  );
}
