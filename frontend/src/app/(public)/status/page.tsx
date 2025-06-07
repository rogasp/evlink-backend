'use client';

import { useEffect, useState } from 'react';
import { subMonths } from 'date-fns';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { StatusPanel } from '@/components/status/StatusPanel';
import { DateRangeSelector } from '@/components/status/DateRangeSelector';
import type { DailyStatus } from '@/types/status';

type StatusApiResponse = {
  category: string;
  uptime: number;
  days: DailyStatus[];
};

export default function StatusPage() {
  const { user } = useAuth({ requireAuth: false });
  const [statusItems, setStatusItems] = useState<StatusApiResponse[]>([]);
  const [toDate, setToDate] = useState(new Date());
  const [fromDate, setFromDate] = useState(subMonths(new Date(), 3));

  const updateDateRange = (from: Date, to: Date) => {
    setFromDate(from);
    setToDate(to);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `/api/public/status/webhook?from_date=${fromDate.toISOString()}&to_date=${toDate.toISOString()}`
        );
        const data = await res.json();

        console.log('[🟢 Raw status API response]', data);
        setStatusItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('[❌ Failed to load status data]', err);
      }
    };

    fetchStatus();
  }, [fromDate, toDate]);

  const categories = statusItems
    .filter((item) => {
      const isValid = item && item.category && Array.isArray(item.days) && item.days.length > 0;
      if (!isValid) {
        console.warn('[⚠️ Skipping invalid status item]', item);
      }
      return isValid;
    })
    .map((item) => ({
      label: item.category === 'webhook_incoming' ? 'Webhook incoming' : item.category,
      uptime: typeof item.uptime === 'number' ? item.uptime : 0,
      data: item.days,
    }));

  console.log(`[ℹ️ Rendered ${categories.length} status categories]`);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-2 border-b">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back to Home
        </Link>
        {user && (
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            Go to Dashboard →
          </Link>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">Status Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Webhook Health</p>
        </div>
        {categories.length > 0 && (
          <Badge variant="outline" className="text-sm text-gray-600 font-normal px-3 py-1">
            Overall uptime: {categories[0].uptime.toFixed(2)}%
          </Badge>
        )}
      </div>

      <DateRangeSelector fromDate={fromDate} toDate={toDate} onChange={updateDateRange} />

      {categories.length > 0 ? (
        <StatusPanel categories={categories} />
      ) : (
        <p className="text-gray-500 text-sm">No status data available.</p>
      )}
    </div>
  );
}
