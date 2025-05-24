'use client';

import { useAuth } from '@/hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  useAuth({ requireAuth: true }); // 🔐 skydd här

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
    </SidebarProvider>
  );
}