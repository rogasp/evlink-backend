'use client';

import { SupabaseProvider } from '@/components/SupabaseProvider';
import AppShell from '@/components/layout/AppShell';
import { StripeProvider } from '@/contexts/StripeContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from 'sonner';
import I18nProvider from '@/components/I18nProvider';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" richColors closeButton={false} />
      <I18nProvider>
        <SupabaseProvider>
          <UserProvider>
            <StripeProvider>
              <AppShell>{children}</AppShell>
            </StripeProvider>
          </UserProvider>
        </SupabaseProvider>
      </I18nProvider>
    </>

  );
}
