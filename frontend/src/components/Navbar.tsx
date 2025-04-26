'use client';

import UserMenu from "@/components/UserMenu";

export default function Navbar() {
  return (
    <nav className="w-full p-4 flex justify-between items-center bg-indigo-600 text-white">
      <div className="font-bold text-2xl">EVLink</div>

      <div>
        <UserMenu />
      </div>
    </nav>
  );
}
