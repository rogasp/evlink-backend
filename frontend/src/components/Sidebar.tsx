'use client';

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const [adminOpen, setAdminOpen] = useState(isAdminRoute);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-100 p-4 shadow-inner">
      <nav className="flex flex-col space-y-2 text-sm">
        <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
          Dashboard
        </Link>

        <Link href="/profile" className="text-gray-700 hover:text-indigo-600">
          Profile
        </Link>

        <button
          onClick={() => setAdminOpen(!adminOpen)}
          className="flex items-center justify-between text-gray-700 hover:text-indigo-600 w-full"
        >
          <span>Admin</span>
          {adminOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {adminOpen && (
          <div className="ml-4 flex flex-col space-y-2 mt-1">
            <Link href="/admin/webhooks" className="text-gray-600 hover:text-indigo-600">
              Webhook Subscriptions
            </Link>
            <Link href="/admin/logs" className="text-gray-600 hover:text-indigo-600">
              Webhook Log
            </Link>
            <Link href="/admin/vehicles" className="text-gray-600 hover:text-indigo-600">
              Vehicle Admin
            </Link>
            <Link href="/admin/users" className="text-gray-600 hover:text-indigo-600">
              User Admin
            </Link>
            <Link href="/admin/settings" className="text-gray-600 hover:text-indigo-600">
              Settings
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
