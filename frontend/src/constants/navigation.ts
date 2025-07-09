import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Activity,
  BookOpen,
  Terminal,
  Users,
  Settings,
  Truck,
  Network,
  FileText,
  BarChart2,
} from 'lucide-react';

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

export const navigation: NavigationGroup[] = [
  {
    title: 'General',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Status', href: '/status', icon: Activity },
    ],
  },
  {
    title: 'Guides',
    items: [
      { title: 'Integration Guide', href: '/integration-guide', icon: BookOpen },
      { title: 'HA API', href: '/docs/ha-api', icon: Terminal },
  { title: 'Insights', href: '/insights', icon: BarChart2 },
    ],
  },
  {
    title: 'Admin',
    items: [
      { title: 'Settings', href: '/admin/settings', icon: Settings, adminOnly: true },
      { title: 'Vendors', href: '/admin/vendors', icon: Network, adminOnly: true },
      { title: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
      { title: 'Vehicles', href: '/admin/vehicles', icon: Truck, adminOnly: true },
      { title: 'Webhooks', href: '/admin/webhooks', icon: Network, adminOnly: true },
      { title: 'Logs', href: '/admin/logs', icon: FileText, adminOnly: true },
    ],
  },
];
