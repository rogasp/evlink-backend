'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SidebarSection from './SidebarSection';

export default function Sidebar() {
  const pathname = usePathname();

  const baseLinks = [
    { href: '/dashboard', label: 'Dashboard' },
  ];

  const adminLinks = [
    { href: '/admin/settings', label: 'Settings' },
    { href: '/admin/vendors', label: 'Vendors' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/vehicles', label: 'Vehicles' },
    { href: '/admin/webhooks', label: 'Webhooks' },
    { href: '/admin/logs', label: 'Logs' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gray-100 p-4 shadow-md flex flex-col">
      <nav className="space-y-2">
        {baseLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block px-3 py-2 rounded hover:bg-gray-200 ${
              pathname === href ? 'bg-indigo-100 font-semibold' : ''
            }`}
          >
            {label}
          </Link>
        ))}

        <SidebarSection label="Admin" items={adminLinks} />
      </nav>
    </aside>
  );
}
