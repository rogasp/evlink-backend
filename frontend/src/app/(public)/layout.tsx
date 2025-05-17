'use client';

import { Toaster } from 'sonner';
import { RegistrationProvider } from '@/contexts/RegistrationContext';
import { SupabaseProvider } from '@/components/SupabaseProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" richColors closeButton={false} />
      <RegistrationProvider>
        <SupabaseProvider>
          <Navbar />
          {children}
          <Footer />
        </SupabaseProvider>
      </RegistrationProvider>
    </>
  );
}
