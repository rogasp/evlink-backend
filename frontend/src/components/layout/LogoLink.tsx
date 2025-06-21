'use client'

import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'

type LogoLinkProps = {
  className?: string
}

export default function LogoLink({ className }: LogoLinkProps) {
  return (
    <Link
      href="/"
      className={clsx(
        'flex items-center gap-2 py-1',
        'focus:outline-none focus-visible:ring-0',
        'hover:bg-transparent',
        className
      )}
    >
      <Image
        src="/evlink-logo.png"
        alt="EVLinkHA Logo"
        height={32}
        width={120}
        className="h-8 w-auto object-contain"
        priority
      />
    </Link>
  )
}
