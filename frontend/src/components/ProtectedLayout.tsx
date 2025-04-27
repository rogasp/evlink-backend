'use client';

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      console.warn("Access token could not be refreshed. Logging out...");
      signOut({ callbackUrl: '/login' });
    }
  }, [session]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {children}
    </div>
  );
}
