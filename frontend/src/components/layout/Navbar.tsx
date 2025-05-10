'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabaseContext';
import { useEffect, useState } from 'react';
import UserAvatarMenu from './UserAvatarMenu';
import { Badge } from '@/components/ui/badge';
import { useRegistrationStatus } from '@/contexts/RegistrationContext';

export default function Navbar() {
  const { supabase } = useSupabase();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { registrationAllowed } = useRegistrationStatus();

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setAvatarUrl(user.user_metadata?.avatar_url);
        setUserName(user.user_metadata?.name || user.email);
        setIsAdmin(user.user_metadata?.role === 'admin');
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

  return (
    <nav className="w-full bg-[#0A2245] text-white px-4 py-2 flex items-center justify-between shadow-md h-14">
      <div className="flex items-center space-x-3 h-full">
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

      <div className="flex items-center gap-2">
        {isAdmin && (
          <div className="flex items-center gap-2">
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
        <UserAvatarMenu avatarUrl={avatarUrl} fallback={fallback} />
      </div>
    </nav>
  );
}
