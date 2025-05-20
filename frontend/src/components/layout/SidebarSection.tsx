'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface SidebarItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badgeCount?: number;
}

interface SidebarSectionProps<T = SidebarItem> {
  label: string;
  items: T[];
  defaultOpen?: boolean;
  renderItem?: (item: T) => React.ReactNode;
}

export default function SidebarSection<T = SidebarItem>({
  label,
  items,
  defaultOpen = false,
  renderItem,
}: SidebarSectionProps<T>) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if ((items as SidebarItem[]).some((item) => pathname.startsWith(item.href))) {
      setOpen(true);
    }
  }, [pathname, items]);

  useEffect(() => {
    const saved = localStorage.getItem(`sidebar-${label}-open`);
    if (saved !== null) setOpen(saved === 'true');
  }, [label]);

  useEffect(() => {
    localStorage.setItem(`sidebar-${label}-open`, String(open));
  }, [label, open]);

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
          {items.map((item, index) => {
            if (renderItem) {
              return renderItem(item);
            }

            const sidebarItem = item as SidebarItem;

            return (
              <Link
                key={sidebarItem.href ?? index}
                href={sidebarItem.href}
                className={`block px-3 py-2 rounded hover:bg-gray-200 ${
                  isActive(sidebarItem.href) ? 'bg-indigo-100 font-semibold' : ''
                }`}
              >
                {sidebarItem.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
