'use client';

import React from 'react';
import Link from 'next/link';

export interface BottomNavProps {
  activePage: 'dashboard' | 'report' | 'reports';
}

interface BottomNavItem {
  id: 'dashboard' | 'report' | 'reports';
  label: string;
  icon: string;
  href: string;
}

const NAV_ITEMS: BottomNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦', href: '/' },
  { id: 'report', label: 'Report', icon: '＋', href: '/report' },
  { id: 'reports', label: 'Reports', icon: '▤', href: '/#reports' },
];

export default function BottomNav({ activePage }: BottomNavProps) {
  return (
    <nav className="report-bottom-nav hidden max-[680px]:flex fixed right-0 bottom-0 left-0 z-20 justify-around border-t border-[#2b4940] bg-[#142925] px-[5px] pt-[9px] pb-[calc(9px+env(safe-area-inset-bottom,0px))]">
      {NAV_ITEMS.map((item) => {
        const isActive = activePage === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-1 min-w-[70px] text-[10px] no-underline transition-colors ${
              isActive
                ? 'text-[#20b785] font-[800]'
                : 'text-[#a1b9b0] font-normal hover:text-[#e7f5ef]'
            }`}
          >
            <span className="text-[19px] leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export { BottomNav };
