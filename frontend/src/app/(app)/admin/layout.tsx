"use client"

// app/(admin)/layout.tsx
import AccessDenied from '@/components/layout/AccessDenied';
import { useUserInfo } from '@/hooks/useUserInfo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useUserInfo();

  if (!useUserInfo || !isAdmin) return <AccessDenied />;
  return <>{children}</>;
}
