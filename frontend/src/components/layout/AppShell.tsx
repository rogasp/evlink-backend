// src/components/layout/AppShell.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import NewsletterModal from '../NewsletterModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Definiera vilka rutter som är publika
  const publicRoutes = ['/', '/login', '/register'];
  // Om vi är på en public route ska vi inte kräva auth
  const requireAuth = !publicRoutes.includes(pathname);

  // Kör auth-kollen endast när requireAuth = true
  useAuth({ requireAuth });

  return (
    <SidebarProvider>
      <div className="grid grid-rows-[auto_1fr] grid-cols-[auto_1fr] h-screen">
        <div className="row-start-1 col-span-2 sticky top-0 z-50">
          <Navbar />
        </div>

        <Sidebar />

        <main className="overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
      <NewsletterModal />
    </SidebarProvider>
  );
}
