'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import EditableField from '@/components/EditableField';

interface UserInfoCardProps {
  userId: string;
  email: string;
  name: string;
  notifyOffline: boolean;
  onNameSave: (newName: string) => void;
  onToggleNotify: (checked: boolean) => void;
}

export default function UserInfoCard({
  userId,
  email,
  name,
  notifyOffline,
  onNameSave,
  onToggleNotify,
}: UserInfoCardProps) {
  const getInitials = (email?: string) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 p-6 bg-white shadow rounded-lg">
      <Avatar className="h-16 w-16">
        <AvatarFallback>{getInitials(email)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-4 w-full">
        <div>
          <label className="text-sm font-medium text-gray-700">User ID</label>
          <Input value={userId} readOnly disabled />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input value={email} readOnly disabled />
        </div>
        <EditableField label="Name" value={name} onSave={onNameSave} type="text" />

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox id="notify" checked={notifyOffline} onCheckedChange={onToggleNotify} />
          <label htmlFor="notify" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
            Notify me by email when a vehicle goes offline
          </label>
        </div>
      </div>
    </div>
  );
}
