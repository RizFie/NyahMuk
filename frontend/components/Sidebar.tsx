'use client';

import React from 'react';
import Link from 'next/link';
import SectionNavLink from './SectionNavLink';

export interface SidebarProps {
  activeSection?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  isRoute?: boolean;
}

const HASH_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦', href: '#dashboard' },
  { id: 'risk-map', label: 'Risk Map', icon: '⌖', href: '#risk-map' },
  { id: 'priority', label: 'Priority Areas', icon: '⚠', href: '#priority' },
  { id: 'reports', label: 'Community Reports', icon: '▤', href: '#reports' },
];

const ROUTE_NAV_ITEMS: NavItem[] = [
  { id: 'report', label: 'Report a Site', icon: '＋', href: '/report', isRoute: true },
  { id: 'about-model', label: 'About the Model', icon: 'ⓘ', href: '/about-model', isRoute: true },
];

export default function Sidebar({ activeSection }: SidebarProps) {
  const isItemActive = (id: string, href: string) => {
    if (!activeSection) return false;
    const cleanActive = activeSection.toLowerCase().replace(/^[\/#]+/, '');
    const cleanId = id.toLowerCase().replace(/^[\/#]+/, '');
    const cleanHref = href.toLowerCase().replace(/^[\/#]+/, '');
    return cleanActive === cleanId || cleanActive === cleanHref;
  };

  return (
    <aside className="p-[24px_15px] bg-[#0a2821] text-[#e8fff5] max-[680px]:hidden flex flex-col justify-between h-full min-h-screen">
      <div>
        <div className="side-label my-3 px-3 text-[#90b5a6] text-[10px] tracking-[1.5px] uppercase font-bold">
          Workspace
        </div>
        <nav className="flex flex-col gap-1">
          {HASH_NAV_ITEMS.map((item) => {
            const active = isItemActive(item.id, item.href);
            return (
              <SectionNavLink
                key={item.id}
                id={item.id}
                href={`/#${item.id}`}
                className={`nav flex items-center gap-3 w-full my-1 p-[13px_14px] rounded-xl no-underline text-[13px] font-semibold transition-colors ${
                  active
                    ? 'bg-[#197e5c] text-white'
                    : 'text-[#c5ddd3] hover:bg-[#197e5c] hover:text-white'
                }`}
              >
                <span className="ico w-[22px] text-[18px] text-center shrink-0">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </SectionNavLink>
            );
          })}

          <div className="my-2 border-t border-[#1a3d33]" />

          {ROUTE_NAV_ITEMS.map((item) => {
            const active = isItemActive(item.id, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`nav flex items-center gap-3 w-full my-1 p-[13px_14px] rounded-xl no-underline text-[13px] font-semibold transition-colors ${
                  active
                    ? 'bg-[#197e5c] text-white'
                    : 'text-[#c5ddd3] hover:bg-[#197e5c] hover:text-white'
                }`}
              >
                <span className="ico w-[22px] text-[18px] text-center shrink-0">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="aside-note mt-[35px] mx-[6px] p-[15px] border border-[#356a56] rounded-[14px] text-[#bdd8cb] text-xs leading-[1.6]">
        🛡️ <b>Healthier communities.</b>
        <br />
        Safer tomorrows. Help identify mosquito breeding sites before they become a bigger risk.
      </div>
    </aside>
  );
}

export { Sidebar };
