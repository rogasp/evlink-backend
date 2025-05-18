// src/components/layout/Sidebar.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { useUncontactedCount } from '@/hooks/useUncontactedCount';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SidebarNav from './SidebarNav';

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { user } = useAuth();
  const uncontacted = useUncontactedCount();
  const isAdmin = user?.user_metadata?.role === 'admin';

  return (
    <aside
      className={`h-full overflow-y-auto bg-gray-100 p-3 shadow-md flex flex-col justify-between transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <nav className="space-y-2">
        <SidebarNav
          collapsed={collapsed}
          pathname={pathname}
          isAdmin={isAdmin}
          uncontacted={uncontacted}
        />
      </nav>

      <button
        onClick={toggle}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-black hover:bg-gray-200 rounded px-3 py-2 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <>
            <ChevronLeft className="w-5 h-5" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
}
