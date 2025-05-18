'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { authFetch } from '@/lib/authFetch';

type InterestEntry = {
  id: string;
  name: string | null;
  email: string;
  created_at: string;
  contacted: boolean;
  contacted_at: string | null;
  access_code?: string | null;
};

export default function AdminInterestPage() {
  const { user, accessToken } = useAuth();
  const [entries, setEntries] = useState<InterestEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchEntries = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    const res = await authFetch('/admin/interest', {
      method: 'GET',
      accessToken,
    });

    if (res.error) toast.error('Failed to load interest list');
    else setEntries(res.data || []);
    setLoading(false);
  }, [accessToken]);

  const handleContactAll = async () => {
    if (!accessToken) return;

    setSending(true);
    const res = await authFetch('/admin/interest/contact', {
      method: 'POST',
      accessToken,
    });

    if (res.error) toast.error('Failed to contact users');
    else {
      toast.success(res.data?.message || 'Contacted users');
      await fetchEntries();
    }

    setSending(false);
  };

  const handleGenerateCodes = async () => {
    if (!accessToken || selectedIds.length === 0) return;

    const res = await authFetch('/admin/interest/generate-codes', {
      method: 'POST',
      accessToken,
      body: JSON.stringify({ interest_ids: selectedIds }),
    });

    if (res.error) {
      toast.error('Failed to generate codes');
    } else {
      toast.success('Access codes generated');
      await fetchEntries();
      setSelectedIds([]);
    }
  };

  useEffect(() => {
    if (user) fetchEntries();
  }, [user, fetchEntries]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (!user) return null;

  const handleSendInvites = async () => {
    if (!accessToken || selectedIds.length === 0) return;

    const res = await authFetch('/admin/interest/send-codes', {
      method: 'POST',
      accessToken,
      body: JSON.stringify({ interest_ids: selectedIds }),
    });

    if (res.error) {
      toast.error('Failed to send invites');
    } else {
      toast.success(`${res.data?.sent || 0} invite(s) sent`);
      await fetchEntries();
      setSelectedIds([]);
    }
  };


  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">Interest Signups</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            disabled={selectedIds.length === 0}
            onClick={handleSendInvites}
          >
            Send Access Codes
          </Button>

          <Button onClick={handleGenerateCodes} disabled={selectedIds.length === 0}>
            Generate Access Codes
          </Button>
          <Button onClick={handleContactAll} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" /> Sending...
              </>
            ) : (
              'Contact uncontacted'
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">No signups yet.</p>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Created at</th>
                <th className="px-4 py-2">Contacted</th>
                <th className="px-4 py-2">Contacted at</th>
                <th className="px-4 py-2">Access Code</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t">
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(entry.id)}
                      onChange={() => toggleSelected(entry.id)}
                    />
                  </td>
                  <td className="px-4 py-2">{entry.name || '-'}</td>
                  <td className="px-4 py-2">{entry.email}</td>
                  <td className="px-4 py-2">
                    {format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="px-4 py-2">{entry.contacted ? '✅' : '❌'}</td>
                  <td className="px-4 py-2">
                    {entry.contacted_at
                      ? format(new Date(entry.contacted_at), 'yyyy-MM-dd HH:mm')
                      : '-'}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">
                    {entry.access_code || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
