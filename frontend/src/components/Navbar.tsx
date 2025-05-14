'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export function Navbar() {
  const { user } = useAuth();

  const links = [
    { href: '/status', label: 'Status' },
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/releasenotes', label: 'Release Notes' },
    { href: '/terms', label: 'Terms' },
  ];

  if (user) {
    links.splice(1, 0, { href: '/dashboard', label: 'Dashboard' }); // lägg in Dashboard efter Status
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-black">
          EVLink
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex space-x-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
                <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-4 mt-4">
                {links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="text-base font-medium hover:underline"
                >
                    {link.label}
                </Link>
                ))}
            </nav>
        </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
