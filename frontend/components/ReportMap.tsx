'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { ReportMapInnerProps } from './ReportMapInner';

const ReportMapInner = dynamic(() => import('./ReportMapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] w-full rounded-[11px] bg-[#1a332d] animate-pulse flex flex-col items-center justify-center gap-2 border border-[#2b4940]">
      <div className="w-5 h-5 rounded-full border-2 border-[#13845f] border-t-transparent animate-spin" />
      <span className="text-xs text-[#a1b9b0] font-medium">Loading report map...</span>
    </div>
  ),
});

export type ReportMapProps = ReportMapInnerProps;

export function ReportMap(props: ReportMapProps) {
  return <ReportMapInner {...props} />;
}

export default ReportMap;
