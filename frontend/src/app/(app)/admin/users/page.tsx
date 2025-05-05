'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, Trash } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { authFetch } from '@/lib/authFetch';

type AdminUserView = {
  id: string;
  full_name?: string;
  email: string;
  is_admin: boolean;
  linked_to_enode: boolean;
  linked_at?: string | null;
};

export default function UserAdminPage() {
  const { user, accessToken } = useAuth();
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ✅ Memoized version of fetchUsers
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      if (!accessToken) return;
      const res = await authFetch('/admin/users', {
        method: 'GET',
        accessToken,
      });

      if (res.error) {
        toast.error('Failed to fetch users');
      } else {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
      toast.error('Could not load users');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // 🔁 Run on first load
  useEffect(() => {
    if (accessToken) fetchUsers();
  }, [accessToken, fetchUsers]);

  const confirmAndDelete = async () => {
    if (!confirmDeleteId || !accessToken) return;
    try {
      const res = await authFetch(`/admin/users/${confirmDeleteId}`, {
        method: 'DELETE',
        accessToken,
      });

      if (res.error) {
        toast.error('Failed to delete user');
      } else {
        toast.success('User deleted');
        fetchUsers(); // 🔁 Refresh after delete
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not delete user');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-700">User Admin</h1>
        <Button onClick={fetchUsers} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden mt-4">
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              <th className="px-4 py-2">User ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Admin</th>
              <th className="px-4 py-2">Enode Connected</th>
              <th className="px-4 py-2">Connected At</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.id}</td>
                <td className="px-4 py-2">{u.full_name || '–'}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  {u.is_admin ? (
                    <span className="text-green-600 font-semibold">Yes</span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {u.linked_to_enode ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-red-500 font-bold">✗</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {u.linked_at ? new Date(u.linked_at).toLocaleString() : '–'}
                </td>
                <td className="px-4 py-2">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => setConfirmDeleteId(u.id)}
                    title="Delete user"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this user?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmAndDelete}>
              Yes, Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
