'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ReportForm from '@/components/ReportForm';
import BottomNav from '@/components/BottomNav';
import { isMockMode } from '@/lib/config';
import ApiModeBadge from '@/components/ApiModeBadge';

export default function ReportPage() {
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="min-h-dvh bg-[#0d1e1b] pb-[30px] max-[680px]:pb-[calc(76px+env(safe-area-inset-bottom,0px))]">
      {/* Sticky header */}
      <header
        className="topbar report-header sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#2b4940] bg-[#142925]"
        style={{ padding: '12px max(16px, calc((100% - 1000px) / 2))' }}
      >
        <Link
          href="/"
          className="brand flex items-center gap-[11px] text-[#e7f5ef] text-[20px] font-[800] tracking-[-0.5px] no-underline max-[680px]:gap-2 max-[680px]:text-[17px]"
        >
          <div className="logo grid place-items-center w-[42px] h-[42px] shrink-0 rounded-[14px] bg-[#073d31] text-[#c8f4df] text-[22px] max-[680px]:w-9 max-[680px]:h-9 max-[680px]:rounded-xl">
            ♧
          </div>
          <div>
            NyahMuk
            <small className="block mt-[3px] text-[#a1b9b0] text-[10px] font-semibold tracking-[1.2px] max-[680px]:text-[8px] max-[680px]:tracking-[0.8px] max-[380px]:text-[7px]">
              COMMUNITY REPORTING
            </small>
          </div>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-[7px] min-h-[40px] px-[15px] py-[10px] border border-[#2b4940] rounded-[10px] bg-[#1a332d] text-[#e7f5ef] text-xs font-[750] no-underline whitespace-nowrap hover:border-[#13845f] hover:bg-[#203e34] transition max-[680px]:py-[9px] max-[680px]:px-[11px] max-[680px]:text-[11px] max-[380px]:p-2 max-[380px]:text-[10px]"
        >
          Dashboard
        </Link>
      </header>

      <main className="w-full max-w-[620px] mx-auto py-[27px] px-[18px] max-[680px]:max-w-[460px] max-[680px]:pt-[22px] max-[680px]:px-[13px] max-[680px]:pb-[25px] max-[380px]:px-[10px]">
        {/* Introduction */}
        <section className="mb-5 max-[680px]:mb-[17px]">
          <div className="text-[#20b785] text-[11px] font-[800] tracking-[1.5px] uppercase">
            Community contribution
          </div>
          <h1 className="my-[7px] text-[30px] leading-[1.2] tracking-[-1px] font-[800] max-[680px]:max-w-[360px] max-[680px]:text-[27px] max-[680px]:leading-[1.25] max-[380px]:text-[24px]">
            Report a Breeding Site
          </h1>
          <p className="m-0 text-[#a1b9b0] text-[13px] leading-[1.6] max-[680px]:text-xs">
            Help your community identify possible mosquito breeding locations.
          </p>
          <p className="m-0 mt-2 text-[#df4b4b] text-[13px] leading-[1.6] max-[680px]:text-xs">
            If possible you can take action to eliminate mosquito breeding sites without submitting a report.
          </p>
        </section>

        {/* Progress steps */}
        <div className="flex gap-2 mb-[17px] max-[680px]:gap-[6px]">
          <div className="flex-1 p-[11px_8px] border border-[#b5dfc9] rounded-[10px] bg-[#d8f3e6] text-[#116346] text-[11px] font-bold text-center max-[680px]:p-[10px_3px] max-[680px]:text-[9px] max-[380px]:text-[8px]">
            1 · Snap
          </div>
          <div className="flex-1 p-[11px_8px] border border-[#b5dfc9] rounded-[10px] bg-[#d8f3e6] text-[#116346] text-[11px] font-bold text-center max-[680px]:p-[10px_3px] max-[680px]:text-[9px] max-[380px]:text-[8px]">
            2 · Submit
          </div>
        </div>

        {/* Form panel */}
        <section className="min-w-0 p-[21px] border border-[#2b4940] rounded-[17px] bg-[#142925] max-[680px]:p-[16px_13px] max-[380px]:p-[13px_10px]">
          <div className="relative z-0">
            <ReportForm key={formKey} onClear={() => setFormKey((value) => value + 1)} />
          </div>
          {isMockMode() && (
            <p className="mt-[13px] text-[#a1b9b0] text-[11px] leading-[1.6]">
              Prototype only. Reports are not sent to a real authority or database.
            </p>
          )}
        </section>

        {/* What happens next? info panel */}
        <section className="min-w-0 border border-[#2b4940] rounded-[17px] bg-[#142925] mt-4 overflow-hidden p-0">
          <div
            className="relative grid place-items-center h-[115px] overflow-hidden max-[680px]:h-[105px]"
            style={{
              background:
                'linear-gradient(150deg, transparent 43%, #f5fff5 44%, #f5fff5 56%, transparent 57%), linear-gradient(25deg, #cce8d8, #9fcfba)',
            }}
          >
            {/* Decorative river band */}
            <div className="absolute w-[150%] h-[25px] rotate-[24deg] bg-[#8ac5cb] opacity-80" />
            <span className="relative z-[1] text-[28px]">📍</span>
          </div>
          <div className="p-[17px]">
            <h2 className="m-0 mb-[9px] text-sm font-[800]">What happens next?</h2>
            <p className="m-0 text-[#a1b9b0] text-[11px] leading-[1.7]">
              Your report can help identify locations that may need inspection. In the planned NyahMuk system, reports can be reviewed and prioritised for follow-up.
            </p>
            <div className="mt-[13px] text-[#20b785] text-[11px] font-[800]">
              ✓ Community-powered prevention
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-[25px] pb-[10px] text-[#a1b9b0] text-[10px] text-center">
          NyahMuk · Detect, Predict, Prevent
        </footer>
      </main>

      <BottomNav activePage="report" />
      <ApiModeBadge />
    </div>
  );
}
