'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // 👈 Importera auth
import SidebarSection from './SidebarSection';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth(); // 👈 Hämta inloggad användare

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

  const isAdmin = user?.user_metadata?.role === 'admin';

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

        {isAdmin && <SidebarSection label="Admin" items={adminLinks} />}
      </nav>
    </aside>
  );
}
