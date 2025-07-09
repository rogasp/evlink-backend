'use client';

import { useUserContext } from '@/contexts/UserContext';
import { useEffect } from 'react';

export default function AdminFinancePage() {
  const { mergedUser, loading } = useUserContext();

  if (loading || !mergedUser) {
    return (
      <div className="container py-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="text-2xl font-bold mb-4">Admin Finance Page</h1>
      <p>Financial insights and tools will be displayed here.</p>
    </div>
  );
}
