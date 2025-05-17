'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import UserAvatarMenu from './UserAvatarMenu';

interface Props {
  isLoggedIn: boolean;
  isAdmin: boolean;
  avatarUrl?: string;
  fallback: string;
  registrationAllowed: boolean | null;
}

export default function NavbarDesktop({
  isLoggedIn,
  isAdmin,
  avatarUrl,
  fallback,
  registrationAllowed,
}: Props) {
  return (
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

      {isLoggedIn && <UserAvatarMenu avatarUrl={avatarUrl} fallback={fallback} />}
    </div>
  );
}
