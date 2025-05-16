'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabaseContext';
import { useEffect, useState } from 'react';
import UserAvatarMenu from './UserAvatarMenu';
import { Badge } from '@/components/ui/badge';
import { useRegistrationStatus } from '@/contexts/RegistrationContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export default function Navbar() {
  const { supabase } = useSupabase();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { registrationAllowed } = useRegistrationStatus();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setIsLoggedIn(true);
        setAvatarUrl(user.user_metadata?.avatar_url);
        setUserName(user.user_metadata?.name || user.email);
        setIsAdmin(user.user_metadata?.role === 'admin');
      } else {
        setIsLoggedIn(false);
      }
    };

    getUserData();
  }, [supabase]);

  const fallback = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="w-full bg-[#0A2245] text-white px-4 py-2 flex items-center justify-between shadow-md h-14">
      {/* Left side */}
      <div className="flex items-center space-x-3 h-full">
        {/* Hamburger menu - mobile only */}
        <div className="md:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="text-lg">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                {isLoggedIn && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="text-base font-medium hover:underline"
                  >
                    Dashboard
                  </Link>
                )}

                {isLoggedIn && (
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Log out
                  </Button>
                )}
              </nav>

              {!isLoggedIn && (
                <div className="mt-6 border-t pt-4 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block text-base font-medium text-gray-800 hover:underline"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block text-base font-medium text-gray-800 hover:underline"
                  >
                    Register
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 h-full">
          <Image
            src="/evlink-logo.png"
            alt="EVLink Logo"
            height={48}
            width={120}
            className="h-full w-auto object-contain"
          />
        </Link>
      </div>

      {/* Right side - desktop */}
      <div className="hidden md:flex items-center gap-4">
        {!isLoggedIn && (
          <>
            <Link
              href="/login"
              className="text-sm font-medium hover:underline text-gray-300 hover:text-white"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium hover:underline text-gray-300 hover:text-white"
            >
              Register
            </Link>
          </>
        )}

        {isAdmin && (
          <div className="flex items-center gap-2 ml-2">
            {registrationAllowed === false && (
              <Link href="/admin/settings">
                <Badge
                  variant="outline"
                  className="border-red-500 text-red-500 cursor-pointer hover:underline"
                >
                  Registration Closed
                </Badge>
              </Link>
            )}
            <Link href="/admin/settings">
              <Badge variant="secondary" className="cursor-pointer hover:underline">
                Admin
              </Badge>
            </Link>
          </div>
        )}

        {isLoggedIn && (
          <UserAvatarMenu avatarUrl={avatarUrl} fallback={fallback} />
        )}
      </div>
    </nav>
  );
}
