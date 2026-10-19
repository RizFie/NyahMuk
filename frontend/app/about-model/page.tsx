'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Topbar from '@/components/Topbar';
import BottomNav from '@/components/BottomNav';
import { fetchModelInfo } from '@/lib/api';
import type { ModelInfo } from '@/lib/types';

export default function AboutModelPage() {
  const { data, isLoading, isError } = useQuery<ModelInfo>({
    queryKey: ['model-info'],
    queryFn: fetchModelInfo,
  });

  return (
    <div className="app min-h-dvh bg-[#0d1e1b] text-[#e7f5ef] pb-20">
      <Topbar />

      <main className="w-full max-w-[620px] mx-auto p-7 max-[680px]:px-4 max-[680px]:py-5">
        <div className="mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#20b785] hover:underline mb-3"
          >
            ← Back to Dashboard
          </Link>
          <div className="text-[#20b785] text-[11px] font-[800] tracking-[1.5px] uppercase">
            Model transparency
          </div>
          <h1 className="my-[5px] text-[28px] font-[800] tracking-[-1px] max-[680px]:text-[24px]">
            About the Model
          </h1>
          <p className="m-0 text-[#a1b9b0] text-sm leading-[1.5] max-[680px]:text-xs">
            Technical specifications, data sources, and validation metrics for the mosquito breeding-risk prediction system.
          </p>
        </div>

        {isLoading && (
          <div className="h-[200px] rounded-[17px] bg-[#1a332d] animate-pulse my-4" />
        )}

        {isError && (
          <div className="panel p-[18px] mb-4 border border-[#df4b4b] rounded-[17px] bg-[#142925] text-[#ff7777] text-sm">
            ⚠ Failed to load model information from the server.
          </div>
        )}

        {data && (
          <div className="panel min-w-0 p-[22px] border border-[#2b4940] rounded-[17px] bg-[#142925] max-[680px]:p-[16px]">
            {/* Version & Date */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#2b4940] max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-2">
              <div>
                <span className="text-[#a1b9b0] text-[11px] font-semibold uppercase tracking-[0.8px]">
                  Model Version
                </span>
                <div className="text-base font-bold text-[#e7f5ef] font-mono mt-0.5">
                  {data.model_version || 'v0.1-rules'}
                </div>
              </div>
              <div className="text-right max-[480px]:text-left">
                <span className="text-[#a1b9b0] text-[11px] font-semibold uppercase tracking-[0.8px]">
                  Last Trained
                </span>
                <div className="text-sm text-[#e7f5ef] mt-0.5">
                  {data.last_trained
                    ? new Date(data.last_trained).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div className="py-4 border-b border-[#2b4940]">
              <h3 className="text-xs font-bold uppercase tracking-[1px] text-[#20b785] mb-3">
                Data Sources
              </h3>
              {data.data_sources && data.data_sources.length > 0 ? (
                <ul className="m-0 p-0 list-none flex flex-col gap-2">
                  {data.data_sources.map((source, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-[#e7f5ef] leading-[1.5]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#13845f] mt-1.5 shrink-0" />
                      <span>{source}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#a1b9b0] m-0">No data sources specified.</p>
              )}
            </div>

            {/* Metrics */}
            <div className="py-4 border-b border-[#2b4940]">
              <h3 className="text-xs font-bold uppercase tracking-[1px] text-[#20b785] mb-3">
                Performance &amp; Validation Metrics
              </h3>
              {data.metrics && data.metrics.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {data.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#1a332d] border border-[#2b4940] max-[480px]:flex-col max-[480px]:items-start"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#e7f5ef]">{metric.name}</div>
                        <div className="text-[11px] text-[#a1b9b0] mt-0.5">{metric.note}</div>
                      </div>
                      <div className="text-sm font-bold font-mono text-[#20b785] shrink-0">
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#a1b9b0] m-0">No metrics available.</p>
              )}
            </div>

            {/* Notice */}
            <div className="mt-5 p-3.5 rounded-xl bg-[#1a332d]/60 border border-[#2b4940] text-xs text-[#a1b9b0] leading-[1.6]">
              <strong className="text-[#e7f5ef] block mb-1">Notice:</strong>
              Predictions are statistical estimates based on environmental and historical data. They do not guarantee the presence or absence of mosquito breeding.
            </div>
          </div>
        )}
      </main>

      <BottomNav activePage="dashboard" />
    </div>
  );
}
