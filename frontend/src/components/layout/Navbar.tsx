'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabaseContext';
import { useEffect, useState } from 'react';
import UserAvatarMenu from './UserAvatarMenu';

export default function Navbar() {
  const { supabase } = useSupabase();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setAvatarUrl(user.user_metadata?.avatar_url);
        setUserName(user.user_metadata?.name || user.email);
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

      <UserAvatarMenu avatarUrl={avatarUrl} fallback={fallback} />
    </nav>
  );
}
