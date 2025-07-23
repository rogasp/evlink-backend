// src/components/profile/ApiUsageDisplay.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { authFetch } from '@/lib/authFetch';
import TooltipInfo from '../TooltipInfo';

type ApiUsageStats = {
  current_calls: number;
  max_calls: number;
  max_linked_vehicles: number;
  linked_vehicle_count: number;
  tier: string;
};

type Props = {
  initialPurchasedApiTokens: number;
  userId: string;
};

export default function ApiUsageDisplay({ initialPurchasedApiTokens, userId }: Props) {
  const [apiUsage, setApiUsage] = useState<ApiUsageStats | null>(null);
  const [purchasedApiTokens, setPurchasedApiTokens] = useState(initialPurchasedApiTokens);

  const fetchApiUsage = useCallback(async () => {
    // We need to get the access token from the session here, as it might not be available
    // when the component first mounts or when the realtime event triggers a refetch.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    try {
      const response = await authFetch('/me/api-usage', { accessToken: session.access_token });
      if (response.data) {
        setApiUsage(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch API usage stats:', error);
    }
  }, []); // No dependencies here, as session is fetched inside

  // Initial fetch of API usage data
  useEffect(() => {
    fetchApiUsage();
  }, [fetchApiUsage]);

  // Realtime subscriptions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`api-usage-${userId}`) // Unique channel name
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poll_logs',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchApiUsage(); // Refetch API usage data
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && payload.new.purchased_api_tokens !== undefined) {
            setPurchasedApiTokens(payload.new.purchased_api_tokens);
          }
        }
      )
      .subscribe(() => {
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchApiUsage]);

  return (
    <>
      <div className="text-muted-foreground text-xs flex items-center">
        API Tokens:&nbsp;<span className="font-medium">{purchasedApiTokens}</span>
        <TooltipInfo
          content={
            <>
              <strong>API Tokens</strong>
              <br />
              Additional API calls purchased beyond your monthly allowance.
            </>
          }
          className="ml-1"
        />
      </div>
      {apiUsage && (
        <div className="text-muted-foreground text-xs flex items-center">
          API Calls:&nbsp;<span className="font-medium">{apiUsage.current_calls}/{apiUsage.max_calls}</span>&nbsp;(Used/Included Monthly)
          <TooltipInfo
            content={
              <>
                <strong>API Call Usage</strong>
                <br />
                Your current API calls this month versus your plan&apos;s included limit.
              </>
            }
            className="ml-1"
          />
        </div>
      )}
      {apiUsage && (
        <div className="text-muted-foreground text-xs flex items-center">
          Linked Vehicles:&nbsp;<span className="font-medium">{apiUsage.linked_vehicle_count}/{apiUsage.max_linked_vehicles}</span>&nbsp;(Used/Included)
          <TooltipInfo
            content={
              <>
                <strong>Linked Vehicles</strong>
                <br />
                The number of vehicles currently linked to your account versus the maximum allowed by your plan.
              </>
            }
            className="ml-1"
          />
        </div>
      )}
    </>
  );
}
