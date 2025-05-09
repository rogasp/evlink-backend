'use client';

import { Toaster } from 'sonner';
import { Geist, Geist_Mono } from 'next/font/google';
import { SupabaseProvider } from '@/components/SupabaseProvider';
import './../globals.css';
import AppShell from '@/components/layout/AppShell';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <body className={`antialiased ${geistSans.variable} ${geistMono.variable}`}>
      <Toaster position="top-center" richColors closeButton={false} />
      <SupabaseProvider>
        <AppShell>{children}</AppShell>
      </SupabaseProvider>
    </body>
  );
}
