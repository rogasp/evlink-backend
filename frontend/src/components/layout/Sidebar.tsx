'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/contexts/SidebarContext';
import { LayoutDashboard, Settings, Users, Zap, Server, List, ChevronLeft, ChevronRight, Car, Podcast, ScrollText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const baseItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
];

const adminItems: NavItem[] = [
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    href: '/admin/vendors',
    label: 'Vendors',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    href: '/admin/vehicles',
    label: 'Vehicles',
    icon: <Car className="w-5 h-5" />,
  },
  {
    href: '/admin/webhooks',
    label: 'Webhooks',
    icon: <Podcast className="w-5 h-5" />,
  },
  {
    href: '/admin/logs',
    label: 'Logs',
    icon: <ScrollText className="w-5 h-5" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin';

  const navClass = collapsed ? 'w-16' : 'w-64';

  const renderNavItem = ({ href, label, icon }: NavItem) => {
    const active = pathname.startsWith(href);
    const baseClass =
      'flex items-center px-3 py-2 rounded hover:bg-gray-200 transition-colors';

    const linkClass = active
      ? `${baseClass} bg-indigo-100 font-medium`
      : baseClass;

    const content = (
      <Link href={href} className={linkClass}>
        <div className="flex items-center gap-3">
          {icon}
          {!collapsed && <span className="text-sm">{label}</span>}
        </div>
      </Link>
    );

    return collapsed ? (
      <Tooltip key={href}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    ) : (
      <div key={href}>{content}</div>
    );
  };

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={`h-full overflow-y-auto bg-gray-100 p-3 shadow-md flex flex-col justify-between transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <nav className="space-y-2">
          {baseItems.map(renderNavItem)}

          {isAdmin && (
            <div className="pt-4">
              {!collapsed && <div className="text-xs font-semibold text-gray-500 px-2 mb-1">Admin</div>}
              {adminItems.map(renderNavItem)}
            </div>
          )}
        </nav>

        <button
          onClick={toggle}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black hover:bg-gray-200 rounded px-3 py-2 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>
    </TooltipProvider>
  );
}
