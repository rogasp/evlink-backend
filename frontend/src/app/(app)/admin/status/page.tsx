// src/app/admin/status/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

type StatusLog = {
  id: string;
  status: boolean;
  checked_at: string;
};

const mockLogs: StatusLog[] = Array.from({ length: 20 }, (_, i) => ({
  id: `${i}`,
  status: i % 5 !== 0, // var 5:e är fel
  checked_at: new Date(Date.now() - i * 5 * 60 * 1000).toISOString(),
}));

export default function StatusPage() {
  const [logs, setLogs] = useState<StatusLog[]>([]);

  useEffect(() => {
    setLogs(mockLogs);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Webhook Status</h1>
      <div className="flex gap-2 flex-wrap">
        {logs.map((log) => (
          <div
            key={log.id}
            title={new Date(log.checked_at).toLocaleString()}
            className={`w-4 h-4 rounded-full ${
              log.status ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
