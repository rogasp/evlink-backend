'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { UserDetails } from "@/hooks/useUserDetails";
import { FieldWithCopy } from "@/components/admin/user/FieldWithCopy";

type Props = {
  user: UserDetails;
  loading: boolean;
  updateUserField: <K extends keyof UserDetails>(field: K, value: UserDetails[K]) => Promise<boolean>;
};

export function UserDetailHeader({ user, loading, updateUserField }: Props) {
  const [saving, setSaving] = useState<string | null>(null);

  const handleSwitch = async (field: keyof UserDetails, value: boolean) => {
    setSaving(field);
    await updateUserField(field, value);
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-8 w-40 mb-2 bg-indigo-100" />
        <Skeleton className="h-6 w-64 mb-2 bg-indigo-100" />
        <Skeleton className="h-6 w-52 mb-2 bg-indigo-100" />
      </div>
    );
  }

  return (
    <div className="max-w-9xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vänster kolumn */}
        <div className="flex flex-col gap-6">
          <FieldWithCopy
            label="User ID"
            value={user.id ?? ""}
            className="w-full max-w-100"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              defaultValue={user.name ?? ""}
              className="w-full max-w-100"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">Approved:</label>
            <Switch
              checked={user.is_approved}
              onCheckedChange={val => handleSwitch("is_approved", val)}
              disabled={saving === "is_approved"}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">Notify Offline:</label>
            <Switch
              checked={user.notify_offline}
              onCheckedChange={val => handleSwitch("notify_offline", val)}
              disabled={saving === "notify_offline"}
            />
          </div>
        </div>
        {/* Höger kolumn */}
        <div className="flex flex-col gap-6">
          <FieldWithCopy
            label="Stripe Customer ID"
            value={user.stripe_customer_id ?? ""}
            className="w-full max-w-100"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              defaultValue={user.email}
              className="w-full max-w-100"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">Accepted Terms:</label>
            <Switch
              checked={!!user.accepted_terms}
              onCheckedChange={val => handleSwitch("accepted_terms", val)}
              disabled={saving === "accepted_terms"}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">Subscribed:</label>
            <Switch
              checked={user.is_subscribed}
              onCheckedChange={val => handleSwitch("is_subscribed", val)}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
            <Select
                value={user.tier ?? ""}
                onValueChange={val => updateUserField("tier", val as "free" | "pro")}
                disabled={saving === "tier"}
            >
                <SelectTrigger className="w-full max-w-100">
                <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
            </Select>
          </div>

        </div>
      </div>
    </div>
  );
}
