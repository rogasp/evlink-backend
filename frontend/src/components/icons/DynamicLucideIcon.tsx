'use client';

import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Props = {
  name?: string;
  className?: string;
  size?: number;
};

export function DynamicLucideIcon({ name, className = '', size = 16 }: Props) {
  if (!name) return null;

  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const iconKey = capitalize(name);
  const IconComponent = icons[iconKey];

  if (!IconComponent) return null;

  return <IconComponent size={size} className={className} />;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
