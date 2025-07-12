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
    title: 'General', /* Hardcoded string */
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }, /* Hardcoded string */
      { title: 'Status', href: '/status', icon: Activity }, /* Hardcoded string */
    ],
  },
  {
    title: 'Guides', /* Hardcoded string */
    items: [
      { title: 'Integration Guide', href: '/integration-guide', icon: BookOpen }, /* Hardcoded string */
      { title: 'HA API', href: '/docs/ha-api', icon: Terminal }, /* Hardcoded string */
  { title: 'Insights', href: '/insights', icon: BarChart2 }, /* Hardcoded string */
    ],
  },
  {
    title: 'Admin', /* Hardcoded string */
    items: [
      { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, adminOnly: true }, /* Hardcoded string */
      { title: 'Settings', href: '/admin/settings', icon: Settings, adminOnly: true }, /* Hardcoded string */
      { title: 'Vendors', href: '/admin/vendors', icon: Network, adminOnly: true }, /* Hardcoded string */
      { title: 'Users', href: '/admin/users', icon: Users, adminOnly: true }, /* Hardcoded string */
      { title: 'Vehicles', href: '/admin/vehicles', icon: Truck, adminOnly: true }, /* Hardcoded string */
      { title: 'Webhooks', href: '/admin/webhooks', icon: Network, adminOnly: true }, /* Hardcoded string */
      { title: 'Logs', href: '/admin/logs', icon: FileText, adminOnly: true }, /* Hardcoded string */
      { title: 'Finance', href: '/admin/finance', icon: BarChart2, adminOnly: true }, /* Hardcoded string */
    ],
  },
];
