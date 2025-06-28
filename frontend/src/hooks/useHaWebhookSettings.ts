// src/hooks/useHaWebhookSettings.ts
import { useSupabase } from '@/lib/supabaseContext';
import { useEffect, useState } from 'react';

export function useHaWebhookSettings(userId: string) {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [webhookId, setWebhookId] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Hämta vid mount
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('users')
      .select('ha_webhook_id, ha_external_url')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        if (data) {
          setWebhookId(data.ha_webhook_id ?? '');
          setExternalUrl(data.ha_external_url ?? '');
        }
        setLoading(false);
      });
  }, [userId, supabase]);

  // Spara
  const save = async (newWebhookId: string, newExternalUrl: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('users')
      .update({ ha_webhook_id: newWebhookId, ha_external_url: newExternalUrl })
      .eq('id', userId);
    if (error) setError(error.message);
    setWebhookId(newWebhookId);
    setExternalUrl(newExternalUrl);
    setLoading(false);
    return !error;
  };

  return {
    loading,
    webhookId,
    externalUrl,
    setWebhookId,
    setExternalUrl,
    save,
    error,
  };
}
