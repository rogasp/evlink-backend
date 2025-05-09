'use client';

import { Toaster } from 'sonner';
import { Geist, Geist_Mono } from 'next/font/google';
import { RegistrationProvider } from '@/contexts/RegistrationContext';
import './../globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" richColors closeButton={false} />
      <RegistrationProvider>{children}</RegistrationProvider>
    </>
  );
}
