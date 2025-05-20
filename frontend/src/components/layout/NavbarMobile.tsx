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
import { guideItems, publicItems, getAdminItems } from './SidebarItems';

type SimpleNavItem = {
  href: string;
  label: string | React.ReactNode;
};

interface Props {
  isLoggedIn: boolean;
  isAdmin: boolean;
  handleLogout: () => void;
  uncontacted?: number;
}

export default function NavbarMobile({ isLoggedIn, isAdmin, handleLogout, uncontacted = 0 }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const renderLinks = (items: SimpleNavItem[]) => (
    <div className="flex flex-col space-y-1">
      {items.map((item) => (
        <SheetClose asChild key={item.href}>
          <Link
            href={item.href}
            className="text-sm font-medium text-gray-700 hover:text-indigo-700 transition"
          >
            {item.label}
          </Link>
        </SheetClose>
      ))}
    </div>
  );

  return (
    <div className="md:hidden">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="overflow-y-auto max-h-screen pb-6">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle className="text-lg">Menu</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col mt-4 space-y-4 px-4 text-sm">
            {isLoggedIn && (
              <div className="space-y-1">
                {renderLinks([
                  { href: '/dashboard', label: 'Dashboard' },
                  { href: '/profile', label: 'Profile' },
                ])}
              </div>
            )}

            <div className="pt-4 border-t space-y-1">
              <h3 className="text-xs font-semibold text-gray-500">Guides</h3>
              {renderLinks(guideItems)}
            </div>

            <div className="pt-4 border-t space-y-1">
              <h3 className="text-xs font-semibold text-gray-500">System</h3>
              {renderLinks(publicItems)}
            </div>

            {isAdmin && (
              <div className="pt-4 border-t space-y-1">
                <h3 className="text-xs font-semibold text-gray-500">Admin</h3>
                {renderLinks(getAdminItems(uncontacted))}
              </div>
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
