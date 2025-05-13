'use client';

import { StatusBarItem } from './StatusBarItem';
import type { DailyStatus } from '@/types/status';

interface Props {
  data: DailyStatus[];
}

export function StatusBar({ data }: Props) {
  return (
    <div className="flex items-end gap-1 mt-2">
      {Array.isArray(data) && data.map((day) => (
        <StatusBarItem key={day.date} day={day} />
      ))}
    </div>
  );
}
