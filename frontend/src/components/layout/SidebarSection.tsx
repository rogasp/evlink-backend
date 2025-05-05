'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface SidebarItem {
  href: string;
  label: string;
}

interface SidebarSectionProps {
  label: string;
  items: SidebarItem[];
  defaultOpen?: boolean;
}

export default function SidebarSection({
  label,
  items,
  defaultOpen = false,
}: SidebarSectionProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);

  // Auto-open if current route is inside this section
  useEffect(() => {
    if (items.some((item) => pathname.startsWith(item.href))) {
      setOpen(true);
    }
  }, [pathname, items]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between w-full px-3 py-2 rounded hover:bg-gray-200 text-left"
      >
        <span className={`font-semibold ${open ? 'text-indigo-700' : ''}`}>{label}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {open && (
        <div className="pl-4 space-y-1">
          {items.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded hover:bg-gray-200 ${
                isActive(href) ? 'bg-indigo-100 font-semibold' : ''
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
