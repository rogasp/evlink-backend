'use client';
// app/admin/users/[id]/page.tsx

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserDetails } from "@/hooks/useUserDetails";
import { UserDetailHeader } from "@/components/admin/user/UserDetailHeader";

type Props = { params: Promise<{ id: string }> };

export default function AdminUserDetailPage(props: Props) {
  // Hämta params-id korrekt enligt Next.js 15.3+
  const { id } = React.use(props.params);

  const { user, loading, updateUserField } = useUserDetails(id);
  const [tab, setTab] = useState("vehicles");

  // Visa toast om error uppstår (kan tas bort om du hellre bara visar error inline)

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Övre del: Statisk info + inline-edit (grundlayout) */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
        {user && (
          <UserDetailHeader
            user={user}
            loading={loading}
            updateUserField={updateUserField}
          />
        )}
        {!user && !loading && (
          <div className="text-red-600">User not found.</div>
        )}
        {loading && (
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-8 w-40 mb-2 bg-indigo-100" />
            <Skeleton className="h-6 w-64 mb-2 bg-indigo-100" />
            <Skeleton className="h-6 w-52 mb-2 bg-indigo-100" />
          </div>
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
