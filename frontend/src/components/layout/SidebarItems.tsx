// src/components/layout/sidebarItems.ts
import {
  LayoutDashboard,
  Settings,
  Users,
  Zap,
  Car,
  Podcast,
  ScrollText,
  Activity,
  Mail,
  BookIcon,
} from 'lucide-react';
import { ReactNode } from 'react';

export type NavItem = {
  href: string;
  label: ReactNode;
  icon: ReactNode;
  badgeCount?: number;
};

export const baseItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
];

export const publicItems: NavItem[] = [
  {
    href: '/status',
    label: 'System status',
    icon: <Activity className="w-5 h-5" />,
  },
  {
    href: '/integration-guide',
    label: 'Integration Guide',
    icon: <BookIcon className="w-5 h-5" />,
  }
];

export function getAdminItems(uncontacted: number): NavItem[] {
  return [
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
      href: '/admin/interest',
      label: 'Interest signups',
      icon: <Mail className="w-5 h-5" />,
      badgeCount: uncontacted,
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
}
