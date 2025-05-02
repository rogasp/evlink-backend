// src/components/Sidebar.tsx
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/vehicles", label: "Vehicles" },
    { href: "/webhooks", label: "Webhooks" },
    { href: "/settings", label: "Settings" },
    { href: "/admin/settings", label: "Admin" },
  ];

  return (
    <aside className="w-64 h-full bg-gray-100 p-4 shadow-md">
      <nav className="space-y-2">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block px-3 py-2 rounded hover:bg-gray-200 ${
              pathname === href ? "bg-indigo-100 font-semibold" : ""
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
