'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { DailyStatus } from '@/types/status';

interface Props {
  day: DailyStatus;
}

export function StatusBarItem({ day }: Props) {
  const colorClass = day.ok ? 'bg-green-500' : 'bg-red-500';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`w-3 h-8 rounded-sm ${colorClass} hover:opacity-80 transition`}
          role="status"
        />
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm font-medium">{day.date}</p>
        <p className="text-sm">{day.ok ? 'All OK' : 'Service outage'}</p>
        {day.note && <p className="text-xs text-muted-foreground">{day.note}</p>}
      </TooltipContent>
    </Tooltip>
  );
}
