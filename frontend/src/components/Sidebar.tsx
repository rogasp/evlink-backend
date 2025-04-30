'use client';

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-100 p-4 shadow-inner">
      {/* Här bygger vi ut navigation senare */}
      <nav className="flex flex-col space-y-4">
        <a href="/dashboard" className="text-gray-700 hover:text-indigo-600">
          Dashboard
        </a>
        <a href="/profile" className="text-gray-700 hover:text-indigo-600">
          Profile
        </a>
        <Link href="/admin" className="text-sm text-gray-700 hover:underline">
          Admin
        </Link>
        <Link
          href="/webhooks"
          className="text-sm text-gray-700 hover:text-indigo-600"
        >
          Webhook Log
        </Link>
        {/* Lägg till fler länkar senare */}
      </nav>
    </aside>
  );
}
