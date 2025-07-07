'use client';

import { SupabaseProvider } from '@/components/SupabaseProvider';
import AppShell from '@/components/layout/AppShell';
import { StripeProvider } from '@/contexts/StripeContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from 'sonner';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" richColors closeButton={false} />
      <SupabaseProvider>
        <UserProvider>
          <StripeProvider>
            <AppShell>{children}</AppShell>
          </StripeProvider>
        </UserProvider>
      </SupabaseProvider>
    </>

  );
}
