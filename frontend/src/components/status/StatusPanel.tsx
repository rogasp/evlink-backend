'use client';

import { StatusRow } from './StatusRow';
import type { DailyStatus } from '@/types/status';

interface StatusCategory {
  label: string;
  uptime: number;
  data: DailyStatus[];
}

interface Props {
  categories: StatusCategory[];
}

export function StatusPanel({ categories }: Props) {
  return (
    <div className="space-y-4">
      {categories.map((cat, index) => (
        <StatusRow
          key={`${index}`}
          label={cat.label}
          uptime={cat.uptime}
          data={cat.data}
        />
      ))}
    </div>
  );
}


