'use client';

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react"; // ⬅️ Vi använder en ikon från lucide-react!

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setOpen(!open);

  const handleNavigation = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    setOpen(false);
    signOut({ callbackUrl: '/' });
  };

  // Klick utanför menyn
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 bg-white text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition"
      >
        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
          {session?.user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-20 text-gray-800">
          <button
            onClick={() => handleNavigation('/dashboard')}
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-indigo-100 hover:text-indigo-700"
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNavigation('/profile')}
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-indigo-100 hover:text-indigo-700"
          >
            Profile
          </button>
          <button
            onClick={() => handleNavigation('/settings')}
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-indigo-100 hover:text-indigo-700"
          >
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
