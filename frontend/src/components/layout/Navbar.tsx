'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabaseContext';
import { useRegistrationStatus } from '@/contexts/RegistrationContext';
import NavbarMobile from '@/components/layout/NavbarMobile';
import NavbarDesktop from '@/components/layout/NavbarDesktop';
import LogoLink from '@/components/layout/LogoLink';
import { OnlineStatusIcon } from '@/components/layout/OnlineStatusIcon';

export default function Navbar() {
  const { supabase } = useSupabase();
  const { registrationAllowed } = useRegistrationStatus();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('[🔴 Navbar] Supabase error:', error);
      }

      const user = session?.user;

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

  return (
    <nav className="w-full bg-[#0A2245] text-white px-4 py-2 flex items-center justify-between shadow-md h-14">
      <div className="flex items-center space-x-3 h-full">
        <NavbarMobile
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          handleLogout={async () => {
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
        />
        <LogoLink />
        {isLoggedIn && <OnlineStatusIcon />}
      </div>

      <NavbarDesktop
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        avatarUrl={avatarUrl}
        fallback={fallback}
        registrationAllowed={registrationAllowed}
      />
    </nav>
  );
}
