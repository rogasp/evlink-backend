'use client';

import { Toaster } from 'sonner';
import { RegistrationProvider } from '@/contexts/RegistrationContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" richColors closeButton={false} />
      <RegistrationProvider>{children}</RegistrationProvider>
    </>
  );
}
