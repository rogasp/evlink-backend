'use client';
// app/admin/users/[id]/page.tsx

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserDetails } from "@/hooks/useUserDetails";
import { UserDetailHeader } from "@/components/admin/user/UserDetailHeader";

type Props = { params: Promise<{ id: string }> };

/**
 * AdminUserDetailPage component displays detailed information for a specific user in the admin panel.
 * It includes various tabs for different categories of user data like vehicles, logs, and Stripe information.
 */
export default function AdminUserDetailPage(props: Props) {
  // Get params-id correctly according to Next.js 15.3+
  const { id } = React.use(props.params);

  const { user, loading, updateUserField } = useUserDetails(id);
  const [tab, setTab] = useState("vehicles");

  // Show toast if error occurs (can be removed if you prefer to show error inline)

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Top section: Static info + inline-edit (base layout) */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
        {user && (
          <UserDetailHeader
            user={user}
            loading={loading}
            updateUserField={updateUserField}
          />
        )}
        {!user && !loading && (
          <div className="text-red-600">User not found.</div> /* Hardcoded string */
        )}
        {loading && (
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-8 w-40 mb-2 bg-indigo-100" />
            <Skeleton className="h-6 w-64 mb-2 bg-indigo-100" />
            <Skeleton className="h-6 w-52 mb-2 bg-indigo-100" />
          </div>
        )}
      </div>
      {/* Bottom section: Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger> {/* Hardcoded string */}
          <TabsTrigger value="logs">Logs</TabsTrigger> {/* Hardcoded string */}
          <TabsTrigger value="stripe">Stripe</TabsTrigger> {/* Hardcoded string */}
          {/* Add more tabs here */}
        </TabsList>
        <TabsContent value="vehicles">
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-32 bg-indigo-100" />
            ) : user ? (
              <span>Vehicle list will go here for <span className="font-mono">{user.id}</span></span> /* Hardcoded string */
            ) : (
              <span className="text-red-600">No user to show vehicles for.</span> /* Hardcoded string */
            )}
          </div>
        </TabsContent>
        <TabsContent value="logs">
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-32 bg-indigo-100" />
            ) : user ? (
              <span>Logs will go here for <span className="font-mono">{user.id}</span></span> /* Hardcoded string */
            ) : (
              <span className="text-red-600">No user to show logs for.</span> /* Hardcoded string */
            )}
          </div>
        </TabsContent>
        <TabsContent value="stripe">
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-32 bg-indigo-100" />
            ) : user ? (
              <span>Stripe information for <span className="font-mono">{user.id}</span></span> /* Hardcoded string */
            ) : (
              <span className="text-red-600">No user to show Stripe info for.</span> /* Hardcoded string */
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}