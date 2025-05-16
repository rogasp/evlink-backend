'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LogoLink() {
  return (
    <Link href="/" className="flex items-center space-x-2 h-full">
      <Image
        src="/evlink-logo.png"
        alt="EVLink Logo"
        height={48}
        width={120}
        className="h-full w-auto object-contain"
      />
    </Link>
  );
}
