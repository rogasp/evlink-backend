'use client';

import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ReactNode } from 'react';

type SidebarItemProps = {
  href: string;
  label: ReactNode;
  icon: ReactNode;
  collapsed: boolean;
  active: boolean;
  badgeCount?: number;
};

export default function SidebarItem({
  href,
  label,
  icon,
  collapsed,
  active,
  badgeCount,
}: SidebarItemProps) {
  const baseClass =
    'flex items-center px-3 py-2 rounded hover:bg-gray-200 transition-colors relative';
  const linkClass = active ? `${baseClass} bg-indigo-100 font-medium` : baseClass;

  const content = (
    <Link href={href} className={linkClass}>
      <div className="flex items-center gap-3">
        <div className="relative w-6 h-6 flex items-center justify-center">
          {icon}
          {badgeCount !== undefined && badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full z-10 min-w-[16px] text-center leading-none">
              {badgeCount}
            </span>
          )}
        </div>
        {!collapsed && <span className="text-sm">{label}</span>}
      </div>
    </Link>
  );

  return collapsed ? (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <div>{content}</div>
  );
}
