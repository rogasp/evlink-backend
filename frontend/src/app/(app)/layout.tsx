'use client';

import { SupabaseProvider } from '@/components/SupabaseProvider';
import AppShell from '@/components/layout/AppShell';
import { StripeProvider } from '@/contexts/StripeContext';
import { Toaster } from 'sonner';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" richColors closeButton={false} />
      <SupabaseProvider>
        <StripeProvider>
          <AppShell>{children}</AppShell>
        </StripeProvider>
      </SupabaseProvider>
    </>

  );
}
