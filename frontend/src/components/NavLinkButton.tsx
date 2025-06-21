'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

type NavLinkButtonProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export function NavLinkButton({ href, children, className }: NavLinkButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const isActive = pathname === href

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
    router.push(href)
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={cn(
        'w-full justify-start rounded-none px-4 py-2 text-left',
        isActive &&
          'bg-muted/70 text-primary/90 font-medium border-l-2 border-primary',
        className
      )}
    >
      {children}
    </Button>
  )
}
