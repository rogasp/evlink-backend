'use client';

import { Toaster } from 'sonner';
import { RegistrationProvider } from '@/contexts/RegistrationContext';
import { Navbar } from '@/components/Navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" richColors closeButton={false} />
      <RegistrationProvider>
        <Navbar />
        <main className="px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </RegistrationProvider>
    </>
  );
}
