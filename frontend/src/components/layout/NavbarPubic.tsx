'use client'

import LogoLink from './LogoLink'
import Link from 'next/link'
import { useUserInfo } from '@/hooks/useUserInfo'
import { usePathname } from 'next/navigation'
import NavUser from '../NavUser'
import { OnlineStatusIcon } from './OnlineStatusIcon'

export default function NavbarPublic() {
  const { isLoggedIn } = useUserInfo()
  const pathname = usePathname()
  const isRoot = pathname === '/'

  return (
    <nav className="h-14 w-full bg-[#0A2245] text-white px-4 py-2 flex items-center justify-between shadow-md">
      {/* Vänster: Sidomenytrigger + logo */}
      <div className="flex items-center gap-3 h-full">
        <LogoLink />
      </div>
      {/* Höger: Exempelknappar */}
      <div className="flex items-center gap-4">
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
          <NavUser/>
          </>
        )}
      </div>
    </nav>
  )
}
