'use client';

import React from 'react';
import Link from 'next/link';
import { PLACE_NAME, isMockMode } from '@/lib/config';

export interface TopbarProps {
  isMock?: boolean;
}

export default function Topbar({ isMock }: TopbarProps = {}) {
  // Use prop if provided, otherwise check config mock mode
  const showMock = isMock !== undefined ? isMock : isMockMode();

  return (
    <header className="topbar flex items-center justify-between gap-4 py-[17px] px-[26px] bg-[#142925] border-b border-[#2b4940] max-[680px]:py-[13px] max-[680px]:px-[15px] max-[680px]:items-start">
      <Link
        href="/"
        className="brand flex items-center gap-[11px] text-[#e7f5ef] text-[20px] font-[800] tracking-[-0.5px] no-underline max-[680px]:gap-2 max-[680px]:text-[17px]"
      >
        <span className="logo grid place-items-center w-[42px] h-[42px] shrink-0 rounded-[14px] bg-[#073d31] text-[#c8f4df] text-[22px] max-[680px]:w-[36px] max-[680px]:h-[36px] max-[680px]:text-[18px]">
          ♧
        </span>
        <div>
          <span>NyahMuk</span>
          <small className="block mt-[3px] text-[#a1b9b0] text-[10px] font-semibold tracking-[1.2px] max-[680px]:text-[9px] max-[680px]:tracking-[0.8px]">
            DASHBOARD · DETECT · PREDICT
          </small>
        </div>
      </Link>

      <div className="top-actions flex items-center gap-[10px] max-[680px]:flex-col max-[680px]:items-end max-[680px]:gap-[5px]">
        <div className="pill px-[13px] py-2 border border-[#2b4940] rounded-full text-[#a1b9b0] text-xs whitespace-nowrap max-[680px]:px-2 max-[680px]:py-[6px] max-[680px]:text-[10px]">
          📍 {PLACE_NAME}
        </div>
        {showMock && (
          <div className="pill px-[13px] py-2 border border-[#2b4940] rounded-full text-[#a1b9b0] text-xs whitespace-nowrap max-[680px]:px-2 max-[680px]:py-[6px] max-[680px]:text-[10px]">
            Demo prototype
          </div>
        )}
      </div>
    </header>
  );
}

export { Topbar };
