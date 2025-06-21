'use client'

import { SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import LogoLink from './layout/LogoLink'

export default function SidebarLogoHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <SidebarHeader className="h-14 px-4 flex items-center bg-[#0A2245]">
      {!isCollapsed ? (
        <LogoLink />
      ) : (
        <SidebarTrigger className='text-white' />
      )}
    </SidebarHeader>
  )
}
