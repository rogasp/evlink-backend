'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authFetch } from '@/lib/authFetch';

export function useUncontactedCount() {
  const { accessToken } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      if (!accessToken) return;
      const res = await authFetch('/admin/interest/uncontacted/count', {
        method: 'GET',
        accessToken,
      });
      if (!res.error && res.data?.count) {
        setCount(res.data.count);
      }
    };

    fetchCount();
  }, [accessToken]);

  return count;
}
