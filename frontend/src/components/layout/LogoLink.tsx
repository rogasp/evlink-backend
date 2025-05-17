'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LogoLink() {
  return (
    <Link href="/" className="flex items-center space-x-2 h-full">
      <Image
        src="/evlink-logo.png"
        alt="EVLinkHA Logo"
        height={96}
        width={240}
        className="h-full w-auto object-contain"
      />
    </Link>
  );
}
