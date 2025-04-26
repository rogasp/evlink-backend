'use client';

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 h-16 bg-indigo-600 text-white shadow">
      <div className="flex items-center space-x-4">
        {/* Logotyp */}
        <Link href="/dashboard" className="text-2xl font-bold">
          EVLink
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {/* Meny (Placeholder – byggs vidare senare) */}
        <Link href="/profile" className="hover:underline">Profile</Link>
        <Link href="/logout" className="hover:underline">Logout</Link>
      </div>
    </nav>
  );
}
