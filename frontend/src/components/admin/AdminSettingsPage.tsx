'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authFetch } from '@/lib/authFetch';
import { AdminSetting } from '@/types/settings';
import { AdminSettingsTable } from '@/components/admin/AdminSettingsTable';

export default function AdminSettingsPage() {
  const { accessToken, user } = useAuth();
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await authFetch('/admin/settings', {
          method: 'GET',
          accessToken,
        });

        if (res.data) {
          setSettings(res.data);
        } else {
          console.error('❌ Failed to fetch settings:', res.error);
        }
      } catch (err) {
        console.error('❌ Exception during fetchSettings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [accessToken]);

  if (!user) return null;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>

      {loading ? (
        <p className="text-gray-500">Loading settings...</p>
      ) : (
        <AdminSettingsTable settings={settings} />
      )}
    </main>
  );
}
