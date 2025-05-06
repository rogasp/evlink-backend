'use client';

import { useState } from 'react';
import { AdminSetting } from '@/types/settings';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { authFetch } from '@/lib/authFetch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DynamicLucideIcon } from '@/components/icons/DynamicLucideIcon';
import { useRegistrationStatus } from '@/contexts/RegistrationContext';

type Props = {
  settings: AdminSetting[];
  onValueChange?: () => void;
};

export function AdminSettingsTable({ settings, onValueChange }: Props) {
  const { accessToken } = useAuth();
  const [localSettings, setLocalSettings] = useState(settings);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { refresh } = useRegistrationStatus();

  const updateSetting = async (id: string, newValue: string) => {
    setLoadingId(id);

    const updated = localSettings.map((s) =>
      s.id === id ? { ...s, value: newValue } : s
    );
    setLocalSettings(updated);

    try {
      if (!accessToken) {
        console.warn('No access token found. Skipping update.');
        return;
      }

      const res = await authFetch(`/admin/settings/${id}`, {
        method: 'PUT',
        accessToken,
        body: JSON.stringify({ value: newValue }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.data) {
        toast.success('Setting saved');
        refresh();           // 🔁 uppdatera RegistrationContext (Navbar reagerar)
        onValueChange?.();   // om parent också vill reagera
      } else {
        console.error('❌ Failed to update setting:', res.error);
        toast.error('Failed to save setting');
      }
    } catch (err) {
      console.error('❌ Error updating setting:', err);
      toast.error('Error saving setting');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2">Group</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Label</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {localSettings.map((setting) => (
            <tr key={setting.id} className="border-t">
              <td className="px-4 py-2">{setting.group_name}</td>
              <td className="px-4 py-2 flex items-center gap-2">
                <DynamicLucideIcon name={setting.icon} className="text-muted-foreground" size={16} />
                <span className="font-mono">{setting.name}</span>
              </td>
              <td className="px-4 py-2">{setting.label}</td>
              <td className="px-4 py-2">{setting.type}</td>
              <td className="px-4 py-2">
                {setting.type === 'text' && (
                  <Input
                    defaultValue={setting.value}
                    onBlur={(e) => {
                      const newVal = e.target.value;
                      if (newVal !== setting.value) {
                        updateSetting(setting.id, newVal);
                      }
                    }}
                    className="max-w-sm"
                  />
                )}

                {setting.type === 'boolean' && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={setting.value === 'true'}
                      onCheckedChange={(checked) =>
                        updateSetting(setting.id, checked ? 'true' : 'false')
                      }
                    />
                    <div className="w-4 h-4">
                      {loadingId === setting.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                )}

                {setting.type === 'select' && setting.options && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={setting.value}
                      onValueChange={(val) => updateSetting(setting.id, val)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {setting.options.map((opt: { value: string; label: string }) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {loadingId === setting.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
