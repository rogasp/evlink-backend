'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authFetch } from '@/lib/authFetch';
import { AdminSetting } from '@/types/settings';
import { AdminSettingsTable } from '@/components/admin/AdminSettingsTable';

/**
 * AdminSettingsPage component fetches and displays application settings for administrators.
 * It uses AdminSettingsTable to render the settings in a tabular format.
 */
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
          console.error('❌ Failed to fetch settings:', res.error); // Hardcoded string
        }
      } catch (err) {
        console.error('❌ Exception during fetchSettings:', err); // Hardcoded string
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [accessToken]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Settings</h1> {/* Hardcoded string */}

      {loading ? (
        <p className="text-gray-500">Loading settings...</p> /* Hardcoded string */
      ) : (
        <AdminSettingsTable settings={settings} />
      )}
    </main>
  );
}