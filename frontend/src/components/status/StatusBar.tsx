// src/components/status/StatusBar.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type DailyStatus = {
  date: string;
  status: boolean;
};

export function StatusBar() {
  const [days, setDays] = useState<DailyStatus[]>([]);

  useEffect(() => {
    const toDate = new Date().toISOString().slice(0, 10);
    const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `/api/public/status/webhook?from_date=${fromDate}&to_date=${toDate}`
        );
        const data = await res.json();
        setDays(data);
      } catch (err) {
        console.error('Failed to load status logs:', err);
      }
    };

    fetchStatus();
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex gap-0.5 flex-wrap">
        {days.map((day) => (
          <Tooltip key={day.date}>
            <TooltipTrigger asChild>
              <div
                className={`w-1.5 h-5 rounded-sm ${
                  day.status ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs px-2 py-1">
              <div className="font-medium">{day.date}</div>
              <div>{day.status ? 'All OK' : 'Service outage'}</div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
