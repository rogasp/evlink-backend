'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  if (!user) {
    return null; // Du kan ersätta detta med en spinner/loading-komponent
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
      <p className="text-gray-700">
        This is where general admin settings will be managed.
      </p>
    </div>
  );
}
