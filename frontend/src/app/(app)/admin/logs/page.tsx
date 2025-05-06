'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WebhookLogTable } from '@/components/webhooks/WebhookLogTable';
import { EventFilterSelect } from '@/components/webhooks/EventFilterSelect';
import { authFetch } from '@/lib/authFetch';

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

  useEffect(() => {
    const saved = localStorage.getItem(FILTER_KEY);
    if (saved) {
      setSelectedEvent(saved);
    }
  }, []);

  const fetchLogs = useCallback(
    async (event: string | null, limitValue: number) => {
      if (!accessToken) {
        console.warn('No access token found. Skipping fetch.');
        return;
      }

      let url = `/webhook/logs?limit=${limitValue}`;
      if (event) {
        url += `&event=${encodeURIComponent(event)}`;
      }

      try {
        const res = await authFetch(url, {
          method: 'GET',
          accessToken,
        });

        if (res.data) {
          setLogs(res.data);
          setLogCount(res.data.length);
        } else {
          console.error('❌ Failed to load logs:', res.error);
          setLogs([]);
          setLogCount(0);
        }
      } catch (err) {
        console.error('❌ Exception during fetchLogs:', err);
        setLogs([]);
        setLogCount(0);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    const event = selectedEvent === '__all__' ? null : selectedEvent;
    fetchLogs(event, limit);
  }, [selectedEvent, limit, fetchLogs]);

  const handleFilterChange = (value: string) => {
    localStorage.setItem(FILTER_KEY, value);
    setSelectedEvent(value);
  };

  const handleLimitChange = (value: string) => {
    const parsed = parseInt(value, 10);
    setLimit(parsed);
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
            {[10, 25, 50, 100].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
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
