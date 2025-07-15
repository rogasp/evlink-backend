'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, RotateCcw } from 'lucide-react';
import { authFetch } from '@/lib/authFetch';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import TooltipInfo from '../TooltipInfo';

interface ApiKeySectionProps {
  userId: string;
  accessToken: string;
}

export default function ApiKeySection({ userId, accessToken }: ApiKeySectionProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false); // True = visar den riktiga nyckeln
  const [apiCreated, setApiCreated] = useState<Date | null>(null); // När nyckeln skapades

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Hämta maskerad nyckel på mount
  useEffect(() => {
    let ignore = false;
    const fetchKey = async () => {
      setLoading(true);
      const { data, error } = await authFetch(`/users/${userId}/apikey`, {
        method: 'GET',
        accessToken,
      });
      if (!ignore) {
        setApiKey(data?.api_key_masked ?? '');
        setIsNew(false); // alltid maskerad vid laddning
        setApiCreated(data?.created_at ? new Date(data.created_at) : null);
        if (error) toast.error('Could not fetch API key');
        setLoading(false);
      }
    };
    fetchKey();
    return () => { ignore = true };
  }, [userId, accessToken]);

  // Generera ny nyckel (POST)
  const handleRegenerate = async () => {
    setGenerating(true);
    setShowConfirm(false);
    const { data } = await authFetch(`/users/${userId}/apikey`, {
      method: 'POST',
      accessToken,
    });
    if (data && data.api_key) {
      setApiKey(data.api_key);    // Detta är riktiga nya nyckeln!
      setIsNew(true);
      toast.success('New API key generated. Copy and save it now!');
    } else {
      toast.error('Failed to generate API key');
    }
    setGenerating(false);
  };

  // Kopiera aktuell synlig nyckel
  const handleCopy = () => {
    if (apiKey && isNew) {
      navigator.clipboard.writeText(apiKey);
      toast.success('API key copied!');
    }
  };

  if (loading) return null; // Visa skeleton via layout/page

  return (
    <>
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 py-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">API Key</span>
            <TooltipInfo
              content={
                <>
                  <strong>Your API Key</strong>
                  <br />
                  Used to authenticate your Home Assistant integration with EVLink.
                  <br />
                  Keep it secret!
                </>
              }
              className="ml-[-8px]"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {(!apiCreated)
              ? 'No API Key Created'
              : `Created on ${apiCreated.toLocaleDateString()} at ${apiCreated.toLocaleTimeString()}`}
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={apiKey || ''}
              readOnly
              className={`w-full font-mono ${isNew ? 'text-foreground' : 'text-muted-foreground'}`}
            />
            {isNew ? (
              <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy API key" className="cursor-pointer">
                <Copy className="w-5 h-5" />
              </Button>
            ) : null}
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowConfirm(true)}
              disabled={generating}
              aria-label="Generate new API key"
              className="cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
          {!isNew && (
            <p className="text-xs text-muted-foreground">
              The API key is only visible once. If you lose it, you must generate a new one.
            </p>
          )}
          {isNew && (
            <p className="text-xs text-red-600">
              <strong>Important:</strong> This key will not be shown again! Copy and save it now.
            </p>
          )}
        </CardContent>
      </Card>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate new API key?</DialogTitle>
            <DialogDescription>
              Your current API key will be deactivated and a new key will be generated.<br />
              <span className="text-red-600 font-semibold">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRegenerate}
              disabled={generating}
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 010 16v4l3.5-3.5L12 24v-4a8 8 0 01-8-8z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate new key"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
