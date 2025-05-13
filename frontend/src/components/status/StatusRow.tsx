'use client';

import { StatusBar } from './StatusBar';
import type { DailyStatus } from '@/types/status';

interface Props {
  label: string;
  uptime: number;
  data: DailyStatus[];
}

export function StatusRow({ label, uptime, data }: Props) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-muted-foreground font-medium px-0.5">
        <span>{label}</span>
        <span>{typeof uptime === 'number' ? `${uptime.toFixed(1)}%` : '–'}</span>
      </div>
      <StatusBar data={data} />
    </div>
  );
}
