'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { RiskMapInnerProps } from './RiskMapInner';

const RiskMapInner = dynamic(() => import('./RiskMapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-[330px] w-full rounded-[13px] bg-[#1a332d] animate-pulse flex flex-col items-center justify-center gap-2 border border-[#2b4940]">
      <div className="w-6 h-6 rounded-full border-2 border-[#13845f] border-t-transparent animate-spin" />
      <span className="text-xs text-[#a1b9b0] font-medium">Loading risk map...</span>
    </div>
  ),
});

export type RiskMapProps = RiskMapInnerProps;

export function RiskMap(props: RiskMapProps) {
  return <RiskMapInner {...props} />;
}

export default RiskMap;
