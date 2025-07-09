'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUserContext } from '@/contexts/UserContext';
import { authFetch } from '@/lib/authFetch';

export function TrialButton() {
  const { mergedUser: user, refreshUser: mutateUser, accessToken } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleActivateTrial = async () => {
    if (!user) {
      toast.error('You must be logged in to activate the trial period.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authFetch('/api/me/activate-pro-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        accessToken: accessToken || '',
      });

      if (!response.error) {
        const data = response.data;
        toast.success(data.message || 'Pro trial activated!');
        mutateUser(); // Update user data after activation
      } else {
        const errorData = response.error;
        toast.error(errorData.message || 'Could not activate trial period.');
      }
    } catch (error) {
      console.error('Error activating trial period:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Visa inte knappen om användaren redan är Pro, Basic, eller har en aktiv provperiod
  if (user?.tier === 'pro' || user?.tier === 'basic' || user?.is_on_trial) {
    return null;
  }

  return (
    <Button onClick={handleActivateTrial} disabled={isLoading}>
      {isLoading ? 'Activating...' : 'Try Pro for free for 30 days'}
    </Button>
  );
}