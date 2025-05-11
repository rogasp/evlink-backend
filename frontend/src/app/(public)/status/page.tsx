'use client';

import { useEffect, useState } from 'react';
import { format, subMonths } from 'date-fns';

import { StatusPanel } from '@/components/status/StatusPanel';
import { Badge } from '@/components/ui/badge';
import type { DailyStatus } from '@/types/status';

type StatusApiResponse = {
  category: string;
  uptime: number;
  days: DailyStatus[];
};

export default function StatusPage() {
  const [statusItems, setStatusItems] = useState<StatusApiResponse[]>([]);
  const toDate = format(new Date(), 'yyyy-MM-dd');
  const fromDate = format(subMonths(new Date(), 3), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/public/status/webhook`);
        const data = await res.json();

        console.log('[🟢 Raw status API response]', data);

        setStatusItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('[❌ Failed to load status data]', err);
      }
    };

    fetchStatus();
  }, []);

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

      {categories.length > 0 ? (
        <StatusPanel categories={categories} />
      ) : (
        <p className="text-gray-500 text-sm">No status data available.</p>
      )}
    </div>
  );
}
