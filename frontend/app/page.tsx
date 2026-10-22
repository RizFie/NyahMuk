'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import StatCard from '@/components/StatCard';
import RiskMap from '@/components/RiskMap';
import Legend from '@/components/Legend';
import DaySlider from '@/components/DaySlider';
import PriorityList from '@/components/PriorityList';
import ReportsTable from '@/components/ReportsTable';
import ApiModeBadge from '@/components/ApiModeBadge';
import { fetchReports, fetchRisk, patchReport } from '@/lib/api';
import type { Report, RiskResponse } from '@/lib/types';
import { useOwnReportIds, useViewMode } from '@/lib/view-mode';

export default function DashboardPage() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [viewMode] = useViewMode();
  const ownReportIds = useOwnReportIds();
  const queryClient = useQueryClient();
  const riskQuery = useQuery<RiskResponse>({
    queryKey: ['risk', selectedDay],
    queryFn: () => fetchRisk(selectedDay),
  });
  const reportsQuery = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: fetchReports,
  });
  const updateReport = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { status: Report['status']; assigned_to?: string } }) =>
      patchReport(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  });

  const reports = reportsQuery.data ?? [];
  const residentView = viewMode === 'resident';
  const visibleReports = residentView
    ? reports.filter((report) => ownReportIds.includes(report.id))
    : reports;
  const cells = riskQuery.data?.cells ?? [];
  const openReports = useMemo(() => visibleReports.filter((report) => report.status !== 'cleared'), [visibleReports]);
  const loading = riskQuery.isLoading || reportsQuery.isLoading;
  const highRisk = cells.filter((cell) => cell.risk_level === 'high').length;
  const assigned = visibleReports.filter((report) => report.status === 'assigned').length;
  const cleared = visibleReports.filter((report) => report.status === 'cleared').length;

  return (
    <div className="min-h-dvh bg-bg text-text">
      <Topbar />
      <div className="grid min-h-[calc(100dvh-76px)] grid-cols-[230px_minmax(0,1fr)] max-[1100px]:grid-cols-[190px_minmax(0,1fr)] max-[680px]:block">
        <Sidebar activeSection="dashboard" />
        <main className="mx-auto w-full max-w-[1500px] min-w-0 scroll-mt-[90px] p-7 max-[1100px]:p-5 max-[680px]:px-[13px] max-[680px]:py-5" id="dashboard">
          <header className="mb-[22px] flex items-center justify-between gap-4 max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-2">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[1.5px] text-[#20b785]">Township overview</div>
              <h1 className="my-[5px] text-[30px] font-extrabold tracking-[-1px] max-[680px]:text-[26px]">Risk Dashboard</h1>
              <p className="m-0 text-sm leading-[1.5] text-muted max-[680px]:text-xs">{residentView ? 'View the risk map and track your submitted reports.' : 'Monitor potential mosquito breeding hotspots and community activity.'}</p>
            </div>
          </header>

          {(riskQuery.isError || reportsQuery.isError) && (
            <div className="mb-[18px] rounded-panel border border-[#df4b4b] bg-surface p-[18px] text-sm text-[#ff7777]">Unable to load dashboard data. Please try again.</div>
          )}

          {!residentView && <section className="mb-[18px] grid grid-cols-4 gap-[14px] max-[1100px]:grid-cols-2 max-[680px]:gap-[9px]">
            <StatCard title="High-risk zones" icon="⚠" value={loading ? '—' : String(highRisk).padStart(2, '0')} footer={<><span className="font-bold text-[#ff7777]">Needs attention</span> · Priority inspection</>} />
            <StatCard title="Reports received" icon="▤" value={loading ? '—' : String(reports.length).padStart(2, '0')} footer={<><span className="font-bold text-[#37c894]">↑ Community activity</span> · This month</>} />
            <StatCard title="Sites under review" icon="⌕" value={loading ? '—' : String(assigned).padStart(2, '0')} footer="Awaiting verification" />
            <StatCard title="Resolved reports" icon="✓" value={loading ? '—' : String(cleared).padStart(2, '0')} footer={<><span className="font-bold text-[#37c894]">{reports.length ? Math.round((cleared / reports.length) * 100) : 0}% resolved</span> · This month</>} />
          </section>}

          <section className="grid grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] gap-4 max-[1100px]:grid-cols-1 max-[680px]:block">
            <div className="min-w-0 scroll-mt-[90px] rounded-panel border border-border bg-surface p-[18px] max-[680px]:p-[14px]" id="risk-map">
              <PanelTitle title="Predicted Risk Map" />
              <RiskMap cells={cells} reports={visibleReports} modelVersion={riskQuery.data?.model_version ?? ''} generatedAt={riskQuery.data?.generated_at ?? ''} />
              <Legend />
              <DaySlider value={selectedDay} onChange={setSelectedDay} />
            </div>
            {!residentView && <div className="min-w-0 scroll-mt-[90px] rounded-panel border border-border bg-surface p-[18px] max-[680px]:mt-[13px] max-[680px]:p-[14px]" id="priority">
              <PanelTitle title="Priority Areas" aside="Inspection list" />
              <PriorityList reports={openReports} cells={cells} />
            </div>}
          </section>

          <section className="mt-4 min-w-0 scroll-mt-[90px] rounded-panel border border-border bg-surface p-[18px] max-[680px]:mb-[10px] max-[680px]:p-[14px]" id="reports">
            <PanelTitle title={residentView ? 'Your report status' : 'Latest Community Reports'} aside={residentView ? 'Private to this demo session' : 'Recent activity'} />
            <ReportsTable reports={visibleReports} residentView={residentView} onAssign={(id, team) => updateReport.mutate({ id, patch: { status: 'assigned', assigned_to: team } })} onClear={(id) => updateReport.mutate({ id, patch: { status: 'cleared' } })} />
          </section>
        </main>
      </div>
      <BottomNav activePage="dashboard" />
      <ApiModeBadge />
    </div>
  );
}

function PanelTitle({ title, aside }: { title: string; aside?: string }) {
  return <div className="mb-[15px] flex items-center justify-between gap-[10px]"><h2 className="m-0 text-base max-[680px]:text-sm">{title}</h2>{aside && <span className="text-[11px] text-muted max-[680px]:text-[10px]">{aside}</span>}</div>;
}
