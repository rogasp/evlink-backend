'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import EditableField from '@/components/EditableField';

interface UserInfoCardProps {
  userId: string;
  email: string;
  name: string;
  onNameSave: (newName: string) => void;
}

export default function UserInfoCard({
  userId,
  email,
  name,
  onNameSave,
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
      </div>
    </div>
  );
}
