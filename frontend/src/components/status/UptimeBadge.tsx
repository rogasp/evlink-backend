'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function UptimeBadge({ category }: { category: string }) {
  const [uptime, setUptime] = useState<number | null>(null);

  useEffect(() => {
    const fetchUptime = async () => {
      try {
        const res = await fetch(`/api/public/status/uptime?category=${category}`);
        const data = await res.json();
        if (typeof data.uptime === 'number') {
          setUptime(data.uptime);
        } else {
          console.warn('No uptime value found in response');
        }
      } catch (err) {
        console.error('Failed to fetch uptime:', err);
      }
    };

    fetchUptime();
  }, [category]);

  return (
    <Badge variant="outline" className="text-sm font-medium">
      {uptime !== null && !isNaN(uptime)
        ? `Uptime: ${uptime.toFixed(2)}%`
        : 'Uptime: Loading...'}
    </Badge>
  );
}
