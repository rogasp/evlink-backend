'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NewsletterModal from '../NewsletterModal';
import {
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import Navbar from './Navbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicRoutes = ['/', '/login', '/register'];
  const requireAuth = !publicRoutes.includes(pathname);

  useAuth({ requireAuth });

  return (
  <SidebarProvider>
    {/* Sidebar är fixed, vi lägger bara en placeholder i layouten */}
    <AppSidebar />

    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4">
          {children}
        </main>
      </div>
    </div>

    <NewsletterModal />
  </SidebarProvider>
)
}