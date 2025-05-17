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

      if (res.error) {
        // 👇 Om användaren inte är admin, ignorera felet och sätt count = 0
        if (res.error.status === 403) {
          setCount(0);
          return;
        }

        // Logga andra fel
        console.error('🔴 Failed to fetch uncontacted count:', res.error);
        return;
      }

      if (res.data?.count != null) {
        setCount(res.data.count);
      }
    };

    fetchCount();
  }, [accessToken]);

  return count;
}
