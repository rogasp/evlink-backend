'use client';

import UserInfoCardSkeleton from '@/components/profile/UserInfoCardSkeleton';
import ApiKeySectionSkeleton from '@/components/profile/ApiKeySectionSkeleton';
import HaWebhookSettingsCardSkeleton from '@/components/profile/HaWebhookSettingsCardSkeleton';
import BillingCardSkeleton from '@/components/profile/BillingCardSkeleton';

import UserInfoCard from '@/components/profile/UserInfoCard';
import { useUserContext } from '@/contexts/UserContext';
import { useBillingInfo } from '@/hooks/useBillingInfo';
import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import { toast } from 'sonner';
import ApiKeySection from '@/components/profile/ApiKeySection';
import HaWebhookSettingsCard from '@/components/profile/HaWebhookSettingsCard';
import BillingCard from '@/components/profile/BillingCard';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, mergedUser, loading, accessToken } = useUserContext();
  const { subscription, invoices, loadingBilling } = useBillingInfo(user?.id, accessToken);

  const [notifyOffline, setNotifyOffline] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (mergedUser?.notify_offline !== undefined) {
      setNotifyOffline(mergedUser.notify_offline);
    }
  }, [mergedUser]);

  useEffect(() => {
    // Only run if accessToken exists
    if (!accessToken) return;

    setSubscribeLoading(true);

    authFetch('/newsletter/manage/status', {
      method: 'GET',
      accessToken,
    })
      .then(({ data, error }) => {
        if (error) {
          throw error;
        }
        setIsSubscribed(!!data?.is_subscribed); // Fallback to false if undefined
      })
      .catch(() => {
        toast.error('Could not check newsletter status'); /* Hardcoded string */
      })
      .finally(() => {
        setSubscribeLoading(false);
      });
  }, [accessToken]);

  if (loading || !user || !accessToken) {
    return (
      <div className="container py-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <UserInfoCardSkeleton />
            <ApiKeySectionSkeleton />
            <HaWebhookSettingsCardSkeleton />
          </div>
          <div className="flex flex-col gap-4">
            <BillingCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const handleToggleNotify = async (checked: boolean) => {
    setNotifyLoading(true);
    // Skicka PATCH till backend
    const { error } = await authFetch(`/user/${user.id}/notify`, {
      method: 'PATCH',
      accessToken,
      body: JSON.stringify({ notify_offline: checked }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (error) {
      toast.error('Failed to update notification setting'); /* Hardcoded string */
    } else {
      setNotifyOffline(checked);
      toast.success(
        checked
          ? 'You will now receive email when a vehicle goes offline.' /* Hardcoded string */
          : 'Notifications disabled.' /* Hardcoded string */
      );
    }
    setNotifyLoading(false);
  };

  const handleToggleNewsletter = async (checked: boolean) => {
    if (!accessToken || !user?.email) {
      toast.error('User or access token missing'); /* Hardcoded string */
      return;
    }

    setSubscribeLoading(true);

    try {
      const endpoint = checked
        ? '/newsletter/manage/subscribe'
        : '/newsletter/manage/unsubscribe';

      const { error } = await authFetch(endpoint, {
        method: 'POST',
        accessToken,
        body: JSON.stringify({ email: user.email }),
      });

      if (error) throw new Error(error.message || 'Failed'); /* Hardcoded string */

      setIsSubscribed(checked);
      toast.success(
        checked
          ? 'You are now subscribed to the newsletter.' /* Hardcoded string */
          : 'You have unsubscribed from the newsletter.' /* Hardcoded string */
      );
    } catch (error) {
      let errorMessage = 'Could not update subscription'; /* Hardcoded string */
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setSubscribeLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <UserInfoCard
            userId={user.id}
            name={mergedUser?.name ?? ''}
            email={user.email ?? ''}
            tier={mergedUser?.tier?.toUpperCase() ?? 'FREE'} /* Hardcoded string */
            smsCredits={mergedUser?.sms_credits ?? 0}
            purchasedApiTokens={mergedUser?.purchased_api_tokens ?? 0}
            notifyOffline={notifyOffline}
            notifyLoading={notifyLoading}
            isSubscribed={isSubscribed}
            subscribeLoading={subscribeLoading}
            avatarUrl={user.user_metadata?.avatar_url ?? null}
            onNameSave={() => {}} // Byt ut till riktig save-funktion senare
            onToggleNotify={handleToggleNotify}
            onToggleSubscribe={handleToggleNewsletter}
          />
          <ApiKeySection userId={user.id} accessToken={accessToken} />
          <HaWebhookSettingsCard userId={user.id} accessToken={accessToken} />
        </div>
        <div className="flex flex-col gap-4">
          {loadingBilling || !subscription || !invoices ? (
            <BillingCardSkeleton />
          ) : (
            <BillingCard
              subscriptionPlan={subscription?.plan_name ?? 'Free'} /* Hardcoded string */
              price={
                subscription && subscription.amount && subscription.currency
                  ? `${(subscription.amount / 100).toFixed(2)} ${subscription.currency.toUpperCase()}`
                  : '—' /* Hardcoded string */
              }
              nextBillingDate={subscription?.current_period_end ?? undefined}
              current_period_start={subscription?.current_period_start ?? undefined}
              current_period_end={subscription?.current_period_end ?? undefined}
              invoices={invoices}
              onManageClick={() => router.push('/billing')} /* Hardcoded string */
            />
          )}
        </div>
      </div>
    </div>
  );
}
