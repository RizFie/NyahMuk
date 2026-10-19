import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import StatusTag from '@/components/StatusTag';

const priorityAreas = [
  {
    marker: '!',
    markerClass: 'bg-[#482929] text-[#ff7777]',
    title: 'Jalan Melati drainage',
    detail: 'Stagnant water reported · 2 hours ago',
    status: 'HIGH',
    statusClass: 'bg-[#482929] text-[#ff9999]',
  },
  {
    marker: '!',
    markerClass: 'bg-[#482929] text-[#ff7777]',
    title: 'Block 12, Taman Seri Jaya',
    detail: 'Potential breeding container · Today',
    status: 'HIGH',
    statusClass: 'bg-[#482929] text-[#ff9999]',
  },
  {
    marker: '!',
    markerClass: 'bg-[#43351c] text-[#f4bd50]',
    title: 'Community playground',
    detail: 'Standing water · Yesterday',
    status: 'MEDIUM',
    statusClass: 'bg-[#43351c] text-[#f4bd50]',
  },
  {
    marker: '✓',
    markerClass: 'bg-[#1b3d30] text-[#55d7a0]',
    title: 'Jalan Kenanga',
    detail: 'Inspection completed',
    status: 'REVIEWED',
    statusClass: 'bg-[#1b3d30] text-[#55d7a0]',
  },
];

const reports = [
  ['#NM-024', 'Jalan Melati', 'Stagnant water', '2 hours ago', 'New', 'new'],
  ['#NM-023', 'Block 12', 'Open container', 'Today', 'Reviewing', 'assigned'],
  ['#NM-022', 'Jalan Kenanga', 'Blocked drain', 'Yesterday', 'Resolved', 'cleared'],
] as const;

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Topbar isMock />
      <div className="grid min-h-[calc(100vh-76px)] grid-cols-[230px_minmax(0,1fr)] max-[1100px]:grid-cols-[190px_minmax(0,1fr)] max-[680px]:block">
        <Sidebar activeSection="dashboard" />

        <main className="mx-auto w-full max-w-[1500px] min-w-0 p-7 max-[1100px]:p-5 max-[680px]:px-[13px] max-[680px]:py-5" id="dashboard">
          <div className="mb-[22px] flex items-center justify-between gap-4 max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-2">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[1.5px] text-[#20b785]">
                Township overview
              </div>
              <h1 className="my-[5px] text-[30px] font-extrabold tracking-[-1px] max-[680px]:text-[26px]">
                Risk Dashboard
              </h1>
              <p className="m-0 text-sm leading-[1.5] text-muted max-[680px]:text-xs">
                Monitor potential mosquito breeding hotspots and community activity.
              </p>
            </div>
            <span className="whitespace-nowrap rounded-control border border-border px-3 py-[9px] text-[11px] text-muted max-[680px]:text-[10px]">
              Illustrative demo data
            </span>
          </div>

          <section className="mb-[18px] grid grid-cols-4 gap-[14px] max-[1100px]:grid-cols-2 max-[680px]:gap-[9px]">
            <Stat title="High-risk zones" icon="⚠" value="08">
              <span className="font-bold text-[#ff7777]">Needs attention</span> · Priority inspection
            </Stat>
            <Stat title="Reports received" icon="▤" value="24">
              <span className="font-bold text-[#37c894]">↑ Community activity</span> · This month
            </Stat>
            <Stat title="Sites under review" icon="⌕" value="06">Awaiting verification</Stat>
            <Stat title="Resolved reports" icon="✓" value="18">
              <span className="font-bold text-[#37c894]">75% resolved</span> · Sample data
            </Stat>
          </section>

          <section className="grid grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] gap-4 max-[1100px]:grid-cols-1 max-[680px]:block">
            <div className="min-w-0 rounded-panel border border-border bg-surface p-[18px] max-[680px]:p-[14px]" id="risk-map">
              <PanelTitle title="Predicted Risk Map" aside="Illustrative demo map" />
              <div className="map-placeholder">Map placeholder</div>
              <div className="mt-[13px] flex flex-wrap gap-[13px] text-[11px] text-muted max-[680px]:gap-[9px] max-[680px]:text-[10px]">
                <Legend color="#e94b4b" label="High risk" />
                <Legend color="#eda72a" label="Medium risk" />
                <Legend color="#19885d" label="Lower risk" />
              </div>
              <p className="mt-[13px] text-[11px] leading-[1.6] text-muted">
                Map locations and risk zones are illustrative and do not represent actual predictions.
              </p>
            </div>

            <div className="min-w-0 rounded-panel border border-border bg-surface p-[18px] max-[680px]:mt-[13px] max-[680px]:p-[14px]" id="priority">
              <PanelTitle title="Priority Areas" aside="Inspection list" />
              <div className="flex flex-col">
                {priorityAreas.map((area) => (
                  <div className="flex items-center gap-[10px] border-b border-border py-[14px] last:border-b-0 max-[680px]:gap-2" key={area.title}>
                    <div className={`grid h-[35px] w-[35px] shrink-0 place-items-center rounded-[11px] font-extrabold ${area.markerClass}`}>
                      {area.marker}
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-xs leading-[1.5]">{area.title}</strong>
                      <small className="mt-1 block truncate text-[11px] leading-[1.5] text-muted">{area.detail}</small>
                    </div>
                    <span className={`ml-auto rounded-full px-2 py-[5px] text-[10px] font-extrabold ${area.statusClass}`}>{area.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-4 min-w-0 rounded-panel border border-border bg-surface p-[18px] max-[680px]:mb-[10px] max-[680px]:p-[14px]" id="reports">
            <PanelTitle title="Latest Community Reports" aside="Recent activity" />
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr>
                    {['Report ID', 'Location', 'Issue', 'Reported', 'Status'].map((heading) => (
                      <th className="border-b border-border p-[11px] text-[10px] font-bold uppercase tracking-[0.8px] text-muted" key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map(([id, location, issue, reported, status, variant]) => (
                    <tr key={id}>
                      <td className="border-b border-border p-[13px_11px] text-xs">{id}</td>
                      <td className="border-b border-border p-[13px_11px] text-xs">{location}</td>
                      <td className="border-b border-border p-[13px_11px] text-xs">{issue}</td>
                      <td className="border-b border-border p-[13px_11px] text-xs text-muted">{reported}</td>
                      <td className="border-b border-border p-[13px_11px] text-xs"><StatusTag status={variant}>{status}</StatusTag></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-[13px] text-[11px] leading-[1.6] text-muted">
              All reports shown are fictional sample data for the NyahMuk interface prototype.
            </p>
          </section>
        </main>
      </div>
      <BottomNav activePage="dashboard" />
    </div>
  );
}

function PanelTitle({ title, aside }: { title: string; aside: string }) {
  return (
    <div className="mb-[15px] flex items-center justify-between gap-[10px]">
      <h2 className="m-0 text-base max-[680px]:text-sm">{title}</h2>
      <span className="text-[11px] text-muted max-[680px]:text-[10px]">{aside}</span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center"><i className="mr-[5px] inline-block h-[9px] w-[9px] rounded-full" style={{ backgroundColor: color }} />{label}</span>;
}

function Stat({ title, icon, value, children }: { title: string; icon: string; value: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-panel border border-border bg-surface p-[18px] max-[680px]:p-[13px]">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-muted max-[680px]:text-[11px]">
        <span>{title}</span>
        <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[11px] bg-surface-2 text-[17px] max-[680px]:h-[29px] max-[680px]:w-[29px]">{icon}</span>
      </div>
      <div className="mb-[3px] mt-3 text-[29px] font-extrabold tracking-[-1px] max-[680px]:text-[25px]">{value}</div>
      <div className="text-[11px] leading-[1.5] text-muted max-[680px]:text-[10px]">{children}</div>
    </div>
  );
}
