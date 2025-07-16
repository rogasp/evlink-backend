// src/components/profile/VehicleRealtimeTest.tsx
'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function VehicleRealtimeTest({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return;

    console.log('[PollLogsRealtimeTest] Subscribing to poll_logs table for user:', userId);

    const channel = supabase
      .channel(`poll_logs-insert-${userId}`) // Unique channel name
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poll_logs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[PollLogsRealtimeTest] Realtime INSERT event received for poll_logs table:', payload);
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
          console.log('[PollLogsRealtimeTest] Realtime UPDATE event received for users table:', payload);
          console.log('payload (Tokens):', payload.new.purchased_api_tokens);
        }
      )
      .subscribe((status) => {
        console.log('[PollLogsRealtimeTest] Channel subscription status:', status);
      });

    return () => {
      console.log('[PollLogsRealtimeTest] Unsubscribing from poll_logs channel.');
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="text-muted-foreground text-xs flex items-center">
      Vehicle Realtime Test Component
    </div>
  );
}