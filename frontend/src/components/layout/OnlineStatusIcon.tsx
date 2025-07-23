'use client';

import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { authFetch } from '@/lib/authFetch';
import { supabase } from '@/lib/supabaseClient';

type Status = 'green' | 'yellow' | 'red' | 'grey';

export function OnlineStatusIcon() {
  const [status, setStatus] = useState<Status>('grey');

  // 🔁 Hämta /me första gången
  useEffect(() => {
    const fetchMe = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const res = await authFetch('/me', {
        method: 'GET',
        accessToken: session.access_token,
      });

      if (res.data?.online_status) {
        setStatus(res.data.online_status);
      }
    };

    fetchMe();
  }, []);

  // 🔁 Lyssna på realtime-updates på vehicles
  useEffect(() => {
    const listen = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) return;

      const channel = supabase
        .channel('realtime-vehicle-icon')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'vehicles',
            filter: `user_id=eq.${session.user.id}`,
          },
          async () => {
            const res = await authFetch('/me', {
              method: 'GET',
              accessToken: session.access_token,
            });
            if (res.data?.online_status) {
              setStatus(res.data.online_status);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    listen();
  }, []);

  const colorMap: Record<Status, string> = {
    green: 'text-green-500',
    yellow: 'text-yellow-400',
    red: 'text-red-500',
    grey: 'text-gray-400',
  };

  const labelMap: Record<Status, string> = {
    green: 'All vehicles online',
    yellow: 'Some vehicles offline',
    red: 'All vehicles offline',
    grey: 'No vehicles connected',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Radio className={`w-4 h-4 transition-colors duration-300 ${colorMap[status]}`} />
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>{labelMap[status]}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
