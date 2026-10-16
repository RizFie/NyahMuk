'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import RiskMap from '@/components/RiskMap';
import Legend from '@/components/Legend';
import DaySlider from '@/components/DaySlider';
import PriorityList from '@/components/PriorityList';
import ReportsTable from '@/components/ReportsTable';
import BottomNav from '@/components/BottomNav';
import { fetchRisk, fetchReports, patchReport } from '@/lib/api';
import { isMockMode } from '@/lib/config';
import type { RiskResponse, Report } from '@/lib/types';

export default function DashboardPage() {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const queryClient = useQueryClient();

  // Queries
  const {
    data: riskData,
    isLoading: riskLoading,
    isError: riskError,
  } = useQuery<RiskResponse>({
    queryKey: ['risk', selectedDay],
    queryFn: () => fetchRisk(selectedDay),
  });

  const {
    data: reports,
    isLoading: reportsLoading,
    isError: reportsError,
  } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: fetchReports,
  });

  // Mutations
  const assignMutation = useMutation({
    mutationFn: ({ id, team }: { id: number; team: string }) =>
      patchReport(id, { status: 'assigned', assigned_to: team }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: (id: number) =>
      patchReport(id, { status: 'cleared' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const handleAssign = (id: number, team: string) => {
    assignMutation.mutate({ id, team });
  };

  const handleClear = (id: number) => {
    clearMutation.mutate(id);
  };

  // Filter open reports (not cleared) for PriorityList
  const openReports = useMemo(() => {
    return (reports || []).filter((r) => r.status !== 'cleared');
  }, [reports]);

  // Computed Stats
  const highRiskStr = useMemo(() => {
    const count = (riskData?.cells || []).filter((c) => c.risk_level === 'high').length;
    return String(count).padStart(2, '0');
  }, [riskData]);

  const reportsStr = useMemo(() => {
    if (!reports || reports.length === 0) return '00';
    const now = new Date();
    const thisMonth = reports.filter((r) => {
      if (!r.created_at) return false;
      const d = new Date(r.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const count = thisMonth.length > 0 ? thisMonth.length : reports.length;
    return String(count).padStart(2, '0');
  }, [reports]);

  const reviewStr = useMemo(() => {
    const count = (reports || []).filter((r) => r.status === 'assigned').length;
    return String(count).padStart(2, '0');
  }, [reports]);

  const { resolvedStr, resolvedPct } = useMemo(() => {
    if (!reports || reports.length === 0) {
      return { resolvedStr: '00', resolvedPct: 0 };
    }
    const cleared = reports.filter((r) => r.status === 'cleared').length;
    const pct = Math.round((cleared / reports.length) * 100);
    return {
      resolvedStr: String(cleared).padStart(2, '0'),
      resolvedPct: pct,
    };
  }, [reports]);

  const isInitialLoading = (riskLoading && !riskData) && (reportsLoading && !reports);

  return (
    <div className="app min-h-screen bg-[#0d1e1b] text-[#e7f5ef]">
      <Topbar />
      <div className="layout grid grid-cols-[230px_minmax(0,1fr)] min-h-[calc(100vh-76px)] max-[1100px]:grid-cols-[190px_minmax(0,1fr)] max-[680px]:block">
        <div className="max-[680px]:hidden">
          <Sidebar activeSection="dashboard" />
        </div>
        <main className="w-full max-w-[1500px] min-w-0 mx-auto p-7 max-[1100px]:p-5 max-[680px]:px-[13px] max-[680px]:py-5">
          {/* Page heading */}
          <div className="pagehead flex items-center justify-between gap-4 mb-[22px] max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-2">
            <div>
              <div className="text-[#20b785] text-[11px] font-[800] tracking-[1.5px] uppercase">
                Township overview
              </div>
              <h1 className="my-[5px] text-[30px] font-[800] tracking-[-1px] max-[680px]:text-[26px]">
                Risk Dashboard
              </h1>
              <p className="m-0 text-[#a1b9b0] text-sm leading-[1.5] max-[680px]:text-xs">
                Monitor potential mosquito breeding hotspots and community activity.
              </p>
            </div>
            {isMockMode() && (
              <span className="px-3 py-[9px] border border-[#2b4940] rounded-[10px] text-[#a1b9b0] text-[11px] whitespace-nowrap max-[680px]:text-[10px]">
                Illustrative demo data
              </span>
            )}
          </div>

          {/* Error notification */}
          {(riskError || reportsError) && (
            <div className="panel p-[18px] mb-[18px] border border-[#df4b4b] rounded-[17px] bg-[#142925] text-[#ff7777] text-sm">
              ⚠ Error loading live dashboard data. Please verify network connection or server status.
            </div>
          )}

          {/* Stats section: 4 cards in a grid */}
          {isInitialLoading ? (
            <div className="grid grid-cols-4 gap-[14px] mb-[18px] max-[1100px]:grid-cols-2 max-[680px]:gap-[9px]">
              <div className="h-[120px] rounded-[17px] bg-[#1a332d] animate-pulse" />
              <div className="h-[120px] rounded-[17px] bg-[#1a332d] animate-pulse" />
              <div className="h-[120px] rounded-[17px] bg-[#1a332d] animate-pulse" />
              <div className="h-[120px] rounded-[17px] bg-[#1a332d] animate-pulse" />
            </div>
          ) : (
            <section className="grid grid-cols-4 gap-[14px] mb-[18px] max-[1100px]:grid-cols-2 max-[680px]:gap-[9px]">
              <StatCard
                title="High-risk zones"
                icon="⚠"
                value={highRiskStr}
                footer={
                  <>
                    <span className="text-[#ff7777] font-bold">Needs attention</span> · Priority inspection
                  </>
                }
              />
              <StatCard
                title="Reports received"
                icon="▤"
                value={reportsStr}
                footer={
                  <>
                    <span className="text-[#37c894] font-bold">↑ Community activity</span> · This month
                  </>
                }
              />
              <StatCard
                title="Sites under review"
                icon="⌕"
                value={reviewStr}
                footer="Awaiting verification"
              />
              <StatCard
                title="Resolved reports"
                icon="✓"
                value={resolvedStr}
                footer={
                  <>
                    <span className="text-[#37c894] font-bold">{resolvedPct}% resolved</span> ·{' '}
                    {isMockMode() ? 'Sample data' : 'This month'}
                  </>
                }
              />
            </section>
          )}

          {/* Dashboard grid: map panel + priority panel */}
          {isInitialLoading ? (
            <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] gap-4 max-[1100px]:grid-cols-1 max-[680px]:block">
              <div className="h-[200px] rounded-[17px] bg-[#1a332d] animate-pulse" />
              <div className="h-[200px] rounded-[17px] bg-[#1a332d] animate-pulse max-[680px]:mt-[13px]" />
            </div>
          ) : (
            <section
              className="grid grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] gap-4 max-[1100px]:grid-cols-1 max-[680px]:block"
              id="risk-map"
            >
              {/* Map panel */}
              <div className="panel min-w-0 p-[18px] border border-[#2b4940] rounded-[17px] bg-[#142925] max-[680px]:p-[14px]">
                <div className="panel-title flex items-center justify-between gap-[10px] mb-[15px]">
                  <h2 className="m-0 text-base max-[680px]:text-sm">Predicted Risk Map</h2>
                  <span className="text-[#a1b9b0] text-[11px] max-[680px]:text-[10px] max-[680px]:text-right">
                    {isMockMode()
                      ? 'Illustrative demo map'
                      : `Last updated: ${
                          riskData?.generated_at
                            ? new Date(riskData.generated_at).toLocaleTimeString()
                            : '...'
                        } · ${riskData?.model_version || ''}`}
                  </span>
                </div>
                <div className="h-[330px] rounded-[13px] overflow-hidden border border-[#2b4940] max-[680px]:h-[260px]">
                  <RiskMap
                    cells={riskData?.cells || []}
                    reports={reports || []}
                    modelVersion={riskData?.model_version || ''}
                    generatedAt={riskData?.generated_at || ''}
                  />
                </div>
                <Legend />
                <DaySlider value={selectedDay} onChange={setSelectedDay} />
                {isMockMode() && (
                  <p className="mt-[13px] text-[#a1b9b0] text-[11px] leading-[1.6]">
                    Map locations and risk zones are illustrative and do not represent actual predictions.
                  </p>
                )}
              </div>

              {/* Priority panel */}
              <div
                className="panel min-w-0 p-[18px] border border-[#2b4940] rounded-[17px] bg-[#142925] max-[680px]:p-[14px] max-[680px]:mt-[13px]"
                id="priority"
              >
                <div className="panel-title flex items-center justify-between gap-[10px] mb-[15px]">
                  <h2 className="m-0 text-base max-[680px]:text-sm">Priority Areas</h2>
                  <span className="text-[#a1b9b0] text-[11px] max-[680px]:text-[10px]">
                    Inspection list
                  </span>
                </div>
                <PriorityList reports={openReports} cells={riskData?.cells || []} />
              </div>
            </section>
          )}

          {/* Reports table */}
          {isInitialLoading ? (
            <div className="h-[200px] rounded-[17px] bg-[#1a332d] animate-pulse mt-4" />
          ) : (
            <section
              className="panel min-w-0 p-[18px] border border-[#2b4940] rounded-[17px] bg-[#142925] mt-4 max-[680px]:p-[14px] max-[680px]:mb-[10px]"
              id="reports"
            >
              <div className="panel-title flex items-center justify-between gap-[10px] mb-[15px]">
                <h2 className="m-0 text-base max-[680px]:text-sm">Latest Community Reports</h2>
                <span className="text-[#a1b9b0] text-[11px] max-[680px]:text-[10px]">
                  Recent activity
                </span>
              </div>
              <ReportsTable reports={reports || []} onAssign={handleAssign} onClear={handleClear} />
              {isMockMode() && (
                <p className="mt-[13px] text-[#a1b9b0] text-[11px] leading-[1.6]">
                  All reports shown are fictional sample data for the NyahMuk interface prototype.
                </p>
              )}
            </section>
          )}
        </main>
      </div>
      <BottomNav activePage="dashboard" />
    </div>
  );
}
