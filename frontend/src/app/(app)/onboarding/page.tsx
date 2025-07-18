'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { authFetch } from '@/lib/authFetch';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OnboardingStatus {
  accepted_terms: boolean;
  api_key_created: boolean;
  api_me_called: boolean;
  api_status_called: boolean;
  email_verified: boolean;
  uses_old_status_endpoint: boolean;
  vehicle_created: boolean;
  vehicle_linked: boolean;
  webhook_confirmed: boolean;
  webhook_received: boolean;
  last_updated?: string;
}

const defaultStatus: OnboardingStatus = {
  accepted_terms: false,
  api_key_created: false,
  api_me_called: false,
  api_status_called: false,
  email_verified: false,
  uses_old_status_endpoint: false,
  vehicle_created: false,
  vehicle_linked: false,
  webhook_confirmed: false,
  webhook_received: false,
};

export default function OnboardingPage() {
  const { user, accessToken, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus>(defaultStatus);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user || !accessToken) return;

    try {
      const res = await authFetch(`/user/${user.id}/onboarding`, {
        method: 'GET',
        accessToken,
      });

      if (res.error) {
        throw new Error(res.error.message || 'Unknown error');
      }

      const data: Partial<OnboardingStatus> = res.data;
      setStatus({ ...defaultStatus, ...data });
      if (!data.accepted_terms) setShowTermsModal(true);
    } catch (err) {
      console.error('[OnboardingPage]', err);
      toast.error('Failed to fetch onboarding status');
    }
  }, [user, accessToken]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const acceptTerms = async () => {
    if (!user?.id || !accessToken) return;
    setAccepting(true);

    const res = await authFetch(`/user/${user.id}`, {
      method: 'PATCH',
      accessToken,
      body: JSON.stringify({ accepted_terms: true }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.error) {
      toast.success('Terms accepted');
      setShowTermsModal(false);
      fetchStatus();
    } else {
      console.error('[❌ callback] Failed to accept terms:', res.error);
      toast.error('Could not update terms acceptance');
    }

    setAccepting(false);
  };

  const declineTerms = () => {
    router.replace('/');
  };

  if (loading || !user || !accessToken) return null;

  const steps = [
    {
      key: 'accepted_terms',
      label: 'Terms accepted',
      description: 'You must review and accept our Terms of Service and Privacy Policy before continuing.',
      action: (
        !status.accepted_terms && (
          <Button variant="outline" size="sm" onClick={() => setShowTermsModal(true)}>
            Review terms
          </Button>
        )
      ),
    },
    {
      key: 'api_key_created',
      label: 'API key created',
      description: 'Create an API key to authenticate your Home Assistant instance.',
      action: (
        <Button asChild variant="outline" size="sm">
          <Link href="/profile#api-key">Create API key</Link>
        </Button>
      ),
    },
    {
      key: 'vehicle_linked',
      label: 'Vehicle linked',
      description: 'Link your vehicle to EVLinkHA using the Enode flow.',
      action: (
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Link vehicle</Link>
        </Button>
      ),
    },
    {
      key: 'vehicle_created',
      label: 'Vehicle created',
      description: 'Your vehicle must exist in the EVLinkHA database.',
    },
    {
      key: 'webhook_received',
      label: 'Webhook received',
      description: 'We must receive a webhook from Enode to confirm communication.',
    },
    {
      key: 'webhook_confirmed',
      label: 'Webhook confirmed',
      description: 'A webhook must be successfully received from Enode and forwarded to your Home Assistant instance.',
    },
    {
      key: 'api_me_called',
      label: 'HA /me tested',
      description: 'Home Assistant must call /api/ha/me successfully.',
    },
    {
      key: 'api_status_called',
      label: 'HA /status tested',
      description: 'Home Assistant must call /api/ha/status/{vehicle_id} successfully.',
    },
    {
      key: 'uses_old_status_endpoint',
      label: 'Still using old /api/status',
      description: 'Avoid using deprecated endpoints for future compatibility.',
      invert: true,
    },
  ];

  const completed = steps.filter(step => {
    const value = status[step.key as keyof OnboardingStatus];
    return step.invert ? !value : value;
  }).length;

  const percentage = Math.round((completed / steps.length) * 100);

  const progressColor = clsx({
    'bg-green-500': percentage === 100,
    'bg-yellow-400': percentage >= 40 && percentage < 100,
    'bg-red-500': percentage < 40,
  });

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Onboarding Status</h1>

      <div>
        <Progress value={percentage} className="h-2 overflow-hidden">
          <div className={`h-full transition-all duration-500 ${progressColor}`} style={{ width: `${percentage}%` }} />
        </Progress>
        <p className="text-muted-foreground text-sm mt-1">
          {completed} of {steps.length} steps completed ({percentage}%)
        </p>
      </div>

      <ul className="space-y-4">
        {steps.map((step) => {
          const value = status[step.key as keyof OnboardingStatus];
          const isDone = step.invert ? !value : value;
          return (
            <li key={step.key} className="flex flex-col gap-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${isDone ? 'text-green-600' : 'text-red-500'}`}>
                    {isDone ? '✅' : '❌'}
                  </span>
                  <span className="font-medium text-base">{step.label}</span>
                </div>
                {!isDone && step.action && <div>{step.action}</div>}
              </div>
              {step.description && (
                <p className="text-sm italic text-muted-foreground ml-7 sm:ml-9">{step.description}</p>
              )}
            </li>
          );
        })}
      </ul>

      {status.last_updated && (
        <p className="text-xs text-right text-muted-foreground">
          Last updated: {new Date(status.last_updated).toLocaleString()}
        </p>
      )}

      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terms & Conditions</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-gray-600">
            <p>To continue using EVLinkHA, you must accept the terms and conditions.</p>
            <p>
              Please read our{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-500 hover:text-blue-600"
              >
                full terms and conditions here
              </a>.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={declineTerms}>
              Decline
            </Button>
            <Button onClick={acceptTerms} disabled={accepting}>Accept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
