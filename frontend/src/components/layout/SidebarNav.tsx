'use client';

import SidebarItem from './SidebarItem';
import SidebarSection from './SidebarSection';
import { baseItems, publicItems, getAdminItems, guideItems, NavItem } from './SidebarItems';

type Props = {
  collapsed: boolean;
  pathname: string;
  isAdmin: boolean;
  uncontacted: number;
};

export default function SidebarNav({ collapsed, pathname, isAdmin, uncontacted }: Props) {
  const renderSection = (items: NavItem[], title?: string) => (
    <>
      {title && !collapsed && (
        <div className="text-xs font-semibold text-gray-500 px-2 mt-4 mb-1">
          {title}
        </div>
      )}
      {items.map((item) => (
        <SidebarItem
          key={typeof item.label === 'string' ? item.label : item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          collapsed={collapsed}
          active={pathname.startsWith(item.href)}
          badgeCount={item.badgeCount}
        />
      ))}
    </>
  );

  return (
    <>
      {renderSection(baseItems)}

      {!collapsed && (
        <SidebarSection
          label="Guides"
          items={guideItems}
          renderItem={(item) => (
            <SidebarItem
              key={typeof item.label === 'string' ? item.label : item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              collapsed={collapsed}
              active={pathname.startsWith(item.href)}
              badgeCount={item.badgeCount}
            />
          )}
        />
      )}

      {renderSection(publicItems)}

      {isAdmin && renderSection(getAdminItems(uncontacted), 'Admin')}
    </>
  );
}
