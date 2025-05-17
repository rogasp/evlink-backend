'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

interface Props {
  isLoggedIn: boolean;
  isAdmin: boolean;
  handleLogout: () => void;
}

export default function NavbarMobile({ isLoggedIn, isAdmin, handleLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle className="text-lg">Menu</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col mt-6 space-y-3 px-4">
            {isLoggedIn && (
                <>
                    <SheetClose asChild>
                        <Link
                        href="/dashboard"
                        className="text-sm font-medium text-gray-700 hover:text-indigo-700 transition"
                        >
                        Dashboard
                        </Link>
                    </SheetClose>
                    <SheetClose asChild>
                        <Link
                        href="/profile"
                        className="text-sm font-medium text-gray-700 hover:text-indigo-700 transition"
                        >
                        Profile
                        </Link>
                    </SheetClose>
                </>
            )}
            {isAdmin && (
              <SheetClose asChild>
                <Link
                  href="/admin/settings"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-700 transition"
                >
                  Admin
                </Link>
              </SheetClose>
            )}
          </nav>

          <div className="px-4 mt-6 space-y-2 border-t pt-4">
            {!isLoggedIn && (
              <>
                <SheetClose asChild>
                  <Link
                    href="/login"
                    className="block text-sm font-medium text-gray-700 hover:text-indigo-700"
                  >
                    Log In
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/register"
                    className="block text-sm font-medium text-gray-700 hover:text-indigo-700"
                  >
                    Register
                  </Link>
                </SheetClose>
              </>
            )}
            {isLoggedIn && (
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                Log out
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
