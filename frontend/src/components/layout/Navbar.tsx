'use client'

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import LogoLink from './LogoLink'
import Link from 'next/link'
import { useUserInfo } from '@/hooks/useUserInfo'
import { usePathname } from 'next/navigation'
import NavUser from '../NavUser'
import { OnlineStatusIcon } from './OnlineStatusIcon'
import LanguageSwitcher from '../LanguageSwitcher'

export default function Navbar() {
  const { isLoggedIn } = useUserInfo()
  const pathname = usePathname()
  const isRoot = pathname === '/'
  const { state } = useSidebar()
  const isSidebarCollapsed = state === 'collapsed'

  return (
    <nav className="h-14 w-full bg-[#0A2245] text-white px-4 py-2 flex items-center justify-between shadow-md">
      {/* Vänster: Sidomenytrigger + logo */}
      <div className="flex items-center gap-3 h-full">
        {!isRoot && !isSidebarCollapsed && (
          <SidebarTrigger />
        )}
        { isRoot || isSidebarCollapsed && (
          <LogoLink />
        )}
      </div>
      {/* Höger: Exempelknappar */}
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
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
        {isLoggedIn && <OnlineStatusIcon />}
        {isLoggedIn && isRoot && (
          <>
          <NavUser  />
          </>
        )}
      </div>
    </nav>
  )
}
