'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WebhookLogTable } from '@/components/webhooks/WebhookLogTable';
import { EventFilterSelect } from '@/components/webhooks/EventFilterSelect';

const FILTER_KEY = 'evlink-webhook-event-filter';

type WebhookLog = {
  id: string;
  created_at: string;
  user_id?: string;
  vehicle_id?: string;
  event: string;
  version?: string;
  payload: Record<string, unknown>;
};

export default function WebhookLogPage() {
  const { accessToken } = useAuth();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('__all__');
  const [logCount, setLogCount] = useState<number>(0);
  const [limit, setLimit] = useState<number>(50);

  // 🚀 Load initial filter from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(FILTER_KEY);
    if (saved) {
      setSelectedEvent(saved);
    }
  }, []);

  // 🔁 Fetch logs whenever filter or limit changes
  useEffect(() => {
    const event = selectedEvent === '__all__' ? null : selectedEvent;
    if (accessToken) {
      fetchLogs(event, limit);
    }
  }, [selectedEvent, limit, accessToken]);

  const fetchLogs = async (event: string | null, limit: number) => {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/webhook/logs`);
    if (event) {
      url.searchParams.append('event', event);
    }
    url.searchParams.append('limit', limit.toString());

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    setLogs(data);
    setLogCount(data.length);
  };

  const handleFilterChange = (value: string) => {
    localStorage.setItem(FILTER_KEY, value);
    setSelectedEvent(value);
  };

  const handleLimitChange = (value: string) => {
    const intLimit = parseInt(value);
    setLimit(intLimit);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Webhook Logs</h1>

      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <EventFilterSelect selected={selectedEvent} onChange={handleFilterChange} />
        <div className="flex items-center gap-2">
          <label htmlFor="limit" className="text-sm text-muted-foreground">
            Limit:
          </label>
          <select
            id="limit"
            value={limit}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="border border-gray-300 text-sm px-2 py-1 rounded"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-2">
        Showing {logCount} log{logCount === 1 ? '' : 's'}
      </div>

      <WebhookLogTable logs={logs} />
    </main>
  );
}
