// frontend/app/components/UserInfoCard.tsx

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
  isSubscribed: boolean;               // NEW: whether the user is subscribed to the newsletter
  onNameSave: (newName: string) => void;
  onToggleNotify: (checked: boolean) => void;
  onToggleSubscribe: (checked: boolean) => void; // NEW: handler for newsletter toggle
}

export default function UserInfoCard({
  userId,
  email,
  name,
  notifyOffline,
  isSubscribed,
  onNameSave,
  onToggleNotify,
  onToggleSubscribe,
}: UserInfoCardProps) {
  /**
   * Utility to extract the first initial from the email for the avatar fallback.
   */
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

        {/* Existing toggle: Notify offline */}
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="notify"
            checked={notifyOffline}
            onCheckedChange={onToggleNotify}
          />
          <label
            htmlFor="notify"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
          >
            Notify me by email when a vehicle goes offline
          </label>
        </div>

        {/* NEW toggle: Newsletter subscription */}
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="subscribe"
            checked={isSubscribed}
            onCheckedChange={onToggleSubscribe}
          />
          <label
            htmlFor="subscribe"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
          >
            Subscribe to newsletter
          </label>
        </div>
      </div>
    </div>
  );
}
