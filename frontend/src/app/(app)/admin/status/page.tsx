'use client';

import { useEffect, useState } from 'react';
import { StatusBar } from '@/components/status/StatusBar';
import { Badge } from '@/components/ui/badge';
import { format, subMonths } from 'date-fns';

export default function StatusPage() {
  const [uptime, setUptime] = useState<number | null>(null);
  const toDate = format(new Date(), 'yyyy-MM-dd');
  const fromDate = format(subMonths(new Date(), 3), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchUptime = async () => {
      try {
        const res = await fetch(
          `/api/public/status/webhook/uptime?from_date=${fromDate}&to_date=${toDate}&category=webhook_incoming`
        );
        const data = await res.json();
        setUptime(data.uptime ?? null);
      } catch (err) {
        console.error('Failed to load uptime:', err);
      }
    };

    fetchUptime();
  }, [fromDate, toDate]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Status Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Webhook</p>
        </div>
        {uptime !== null && (
          <Badge variant="outline" className="text-sm text-gray-600 font-normal px-3 py-1">
            Uptime: {uptime.toFixed(2)}%
          </Badge>
        )}
      </div>

      <StatusBar />
    </div>
  );
}
