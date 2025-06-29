'use client';
// app/admin/users/[id]/page.tsx

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserDetails } from "@/hooks/useUserDetails";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { authFetch } from "@/lib/authFetch";
import { useAuth } from "@/hooks/useAuth";

type Props = { params: Promise<{ id: string }> };

export default function AdminUserDetailPage(props: Props) {
  // Hämta params-id korrekt enligt Next.js 15.3+
  const { id } = React.use(props.params);

  const { user, loading, error, setUser } = useUserDetails(id);
  const [tab, setTab] = useState("vehicles");

  const { accessToken } = useAuth();

  const handleToggleApproval = async (userId: string, isApproved: boolean) => {
    if (!accessToken) return;
    try {
      const res = await authFetch(`/admin/users/${userId}/approve`, {
        method: 'PATCH',
        accessToken,
        body: JSON.stringify({ is_approved: isApproved }),
      });
      if (res.error) {
        toast.error('Failed to update approval');
      } else {
        toast.success('Approval status updated');
        // Optimistisk update av UI direkt
        if (user && user.id === userId) setUser({ ...user, is_approved: isApproved });
      }
    } catch {
      toast.error('Could not update approval');
    }
  };

  // Visa toast om error uppstår (kan tas bort om du hellre bara visar error inline)
  if (error) toast.error(error);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Övre del: Statisk info + inline-edit (grundlayout) */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
        {loading ? (
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-8 w-40 mb-2 bg-indigo-100" />
            <Skeleton className="h-6 w-64 mb-2 bg-indigo-100" />
            <Skeleton className="h-6 w-52 mb-2 bg-indigo-100" />
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : user ? (
          <div className="flex flex-col gap-2 flex-1">
            <div>
              <span className="text-gray-500 mr-1">User ID:</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <label className="font-semibold text-gray-700">Name:</label>
              <input
                className="border rounded px-2 py-1 text-sm"
                defaultValue={user.name ?? ""}
                // onBlur={...}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <label className="font-semibold text-gray-700">Email:</label>
              <input
                className="border rounded px-2 py-1 text-sm"
                defaultValue={user.email}
                // onBlur={...}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2 items-center">
                <label className="font-semibold text-gray-700">Approved:</label>
                <Switch
                    checked={user.is_approved}
                    onCheckedChange={(val) => handleToggleApproval(user.id, val)}
                    className="ml-2"
                />
            </div>
            {/* Lägg till fler fält här vid behov */}
          </div>
        ) : (
          <div className="text-red-600">User not found.</div>
        )}
      </div>

      {/* Nedre del: Tabbar */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
          {/* Lägg till fler flikar här */}
        </TabsList>
        <TabsContent value="vehicles">
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-32 bg-indigo-100" />
            ) : user ? (
              <span>Vehicle-list kommer här för <span className="font-mono">{user.id}</span></span>
            ) : (
              <span className="text-red-600">No user to show vehicles for.</span>
            )}
          </div>
        </TabsContent>
        <TabsContent value="logs">
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-32 bg-indigo-100" />
            ) : user ? (
              <span>Loggar kommer här för <span className="font-mono">{user.id}</span></span>
            ) : (
              <span className="text-red-600">No user to show logs for.</span>
            )}
          </div>
        </TabsContent>
        <TabsContent value="stripe">
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-32 bg-indigo-100" />
            ) : user ? (
              <span>Stripe-information för <span className="font-mono">{user.id}</span></span>
            ) : (
              <span className="text-red-600">No user to show stripe info for.</span>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
