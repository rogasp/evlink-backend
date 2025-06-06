// frontend/app/(user)/profile/page.tsx

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { authFetch } from '@/lib/authFetch';
import UserInfoCard from '@/components/profile/UserInfoCard';
import ApiKeySection from '@/components/profile/ApiKeySection';

export default function ProfilePage() {
  const { user, accessToken, loading: authLoading, mergedUser } = useAuth();

  const [name, setName] = useState('');
  const [notifyOffline, setNotifyOffline] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false); // NEW: state for newsletter subscription

  // Initialize name, notifyOffline, and isSubscribed from mergedUser
  useEffect(() => {
    if (mergedUser?.name) {
      setName(mergedUser.name);
    }
    if (mergedUser?.notify_offline !== undefined) {
      setNotifyOffline(mergedUser.notify_offline);
    }
    if (mergedUser?.is_subscribed !== undefined) {
      setIsSubscribed(mergedUser.is_subscribed);
    }
  }, [mergedUser]);

  // Handler to save updated name
  const saveName = async (newName: string) => {
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { name: newName },
    });

    if (updateError) {
      toast.error('Failed to update name');
      return;
    }

    setName(newName);

    const { data, error: fetchError } = await supabase.auth.getUser();

    if (fetchError || !data.user) {
      toast.success('Name updated, but could not refresh user data');
    } else {
      toast.success('Name updated!');
    }
  };

  // Handler to toggle notifyOffline setting
  const toggleNotify = async (checked: boolean) => {
    if (!accessToken || !user?.id) return;

    const { error } = await authFetch(`/user/${user.id}/notify`, {
      method: 'PATCH',
      accessToken,
      body: JSON.stringify({ notify_offline: checked }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      toast.error('Failed to update notification setting');
    } else {
      setNotifyOffline(checked);
      toast.success(
        checked
          ? 'You will now receive email when a vehicle goes offline.'
          : 'Notifications disabled.'
      );
    }
  };

  // NEW: Handler to toggle newsletter subscription
  const toggleSubscribe = async (checked: boolean) => {
    if (!accessToken || !user?.email) return;

    try {
      if (checked) {
        // Subscribe to newsletter
        const { error } = await authFetch('/newsletter/manage/subscribe', {
          method: 'POST',
          accessToken,
          body: JSON.stringify({ email: user.email }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (error) {
          toast.error('Failed to subscribe to newsletter');
          return;
        }
        toast.success('Subscribed to newsletter');
      } else {
        // Unsubscribe from newsletter
        const { error } = await authFetch('/newsletter/manage/unsubscribe', {
          method: 'POST',
          accessToken,
          body: JSON.stringify({ email: user.email }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (error) {
          toast.error('Failed to unsubscribe from newsletter');
          return;
        }
        toast.success('Unsubscribed from newsletter');
      }
      setIsSubscribed(checked);
    } catch (e) {
      console.error('Error toggling subscription:', e);
      toast.error('Unexpected error toggling subscription');
    }
  };

  // Wait until auth state and mergedUser are loaded
  if (authLoading || !user || !accessToken || name === '') return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-10">
      <UserInfoCard
        userId={user.id}
        email={user.email ?? ''}
        name={name}
        notifyOffline={notifyOffline}
        isSubscribed={isSubscribed}               // Pass subscription state
        onNameSave={saveName}
        onToggleNotify={toggleNotify}
        onToggleSubscribe={toggleSubscribe}       // Pass newsletter handler
      />
      <ApiKeySection userId={user.id} accessToken={accessToken} />
    </div>
  );
}
