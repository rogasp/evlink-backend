'use client';

import { useAuth } from '@/hooks/useAuth';

export default function TestStatusDisplay() {
  const { onlineStatus } = useAuth();

  return (
    <div className="text-white bg-black p-4">
      <p>Current status: {onlineStatus}</p>
    </div>
  );
}
