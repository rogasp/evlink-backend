// src/components/profile/VehicleRealtimeTest.tsx
'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function VehicleRealtimeTest({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return;

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
        () => {
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
          () => {
        }
      )
      .subscribe(() => {
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="text-muted-foreground text-xs flex items-center">
      Vehicle Realtime Test Component
    </div>
  );
}