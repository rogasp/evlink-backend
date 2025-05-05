'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authFetch } from '@/lib/authFetch';

interface ApiKeySectionProps {
  userId: string;
  accessToken: string;
}

export default function ApiKeySection({ userId, accessToken }: ApiKeySectionProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchApiKey = useCallback(async () => {
    if (!userId || !accessToken) return;

    const { data, error } = await authFetch(`/users/${userId}/apikey`, {
      method: 'GET',
      accessToken,
    });

    if (error) {
      toast.error('Failed to fetch API key');
      return;
    }

    setApiKey(data.api_key_masked || null);
    setCreatedAt(data.created_at || null);
  }, [userId, accessToken]);

  const createApiKey = async () => {
    if (!userId || !accessToken) {
      toast.error('Missing user ID or access token');
      return;
    }

    setLoading(true);

    const { data, error } = await authFetch(`/users/${userId}/apikey`, {
      method: 'POST',
      accessToken,
    });

    if (error) {
      toast.error('Failed to create new API key');
    } else {
      setApiKey(data.api_key || null);
      setCreatedAt(new Date().toISOString());
      setJustCreated(true);
      toast.success('New API key created!');
    }

    setLoading(false);
  };

  const copyToClipboard = async () => {
    if (apiKey && justCreated) {
      await navigator.clipboard.writeText(apiKey);
      toast.success('API key copied to clipboard!');
    }
  };

  useEffect(() => {
    fetchApiKey();
  }, [fetchApiKey]);

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-lg font-semibold">API Key</h2>

      {apiKey ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              readOnly
              value={justCreated ? apiKey : '********************'}
              className="w-full bg-gray-100"
            />
            <Button
              onClick={copyToClipboard}
              variant={justCreated ? 'default' : 'secondary'}
              disabled={!justCreated}
            >
              Copy
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            {createdAt && <p>Created at: {new Date(createdAt).toLocaleString()}</p>}
            {!justCreated && (
              <p className="text-red-500 mt-1">
                The full API key is only shown when created. You must create a new one to view it again.
              </p>
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={loading}>
                {loading ? 'Creating...' : 'Create New API Key'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create new API Key</AlertDialogTitle>
                <AlertDialogDescription>
                  This will deactivate your previous API key. Are you sure you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={createApiKey}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p>No API key found for your account.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default" disabled={loading}>
                {loading ? 'Creating...' : 'Create API Key'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create new API Key</AlertDialogTitle>
                <AlertDialogDescription>
                  This will generate a new API key linked to your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={createApiKey}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
