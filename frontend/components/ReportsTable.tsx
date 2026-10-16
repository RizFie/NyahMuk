'use client';

import React, { useState } from 'react';
import type { Report } from '@/lib/types';
import relativeTime from '@/lib/time';
import StatusTag from './StatusTag';

export interface ReportsTableProps {
  reports: Report[];
  onAssign: (id: number, team: string) => void;
  onClear: (id: number) => void;
}

const STATUS_CONFIG: Record<
  Report['status'],
  { label: string; variant: 'default' | 'medium' | 'low' }
> = {
  new: { label: 'New', variant: 'default' },
  assigned: { label: 'Reviewing', variant: 'medium' },
  cleared: { label: 'Resolved', variant: 'low' },
};

function formatIssue(note?: string, maxLen = 30): string {
  if (!note || !note.trim()) return '—';
  const clean = note.trim();
  return clean.length > maxLen ? `${clean.slice(0, maxLen)}…` : clean;
}

export function ReportsTable({
  reports = [],
  onAssign,
  onClear,
}: ReportsTableProps) {
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [teamInput, setTeamInput] = useState<string>('');

  const submitAssign = (reportId: number) => {
    const trimmed = teamInput.trim();
    if (trimmed) {
      onAssign(reportId, trimmed);
    }
    setAssigningId(null);
    setTeamInput('');
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full min-w-[500px] sm:min-w-[560px] border-collapse text-left">
        <thead>
          <tr>
            <th className="p-[11px] border-b border-[#2b4940] text-[#a1b9b0] text-[10px] font-bold tracking-[0.8px] uppercase">
              Report ID
            </th>
            <th className="p-[11px] border-b border-[#2b4940] text-[#a1b9b0] text-[10px] font-bold tracking-[0.8px] uppercase">
              Location
            </th>
            <th className="p-[11px] border-b border-[#2b4940] text-[#a1b9b0] text-[10px] font-bold tracking-[0.8px] uppercase">
              Issue
            </th>
            <th className="p-[11px] border-b border-[#2b4940] text-[#a1b9b0] text-[10px] font-bold tracking-[0.8px] uppercase">
              Reported
            </th>
            <th className="p-[11px] border-b border-[#2b4940] text-[#a1b9b0] text-[10px] font-bold tracking-[0.8px] uppercase">
              Status
            </th>
            <th className="p-[11px] border-b border-[#2b4940] text-[#a1b9b0] text-[10px] font-bold tracking-[0.8px] uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="p-[13px_11px] text-center text-[#a1b9b0] text-xs"
              >
                No reports found
              </td>
            </tr>
          ) : (
            reports.map((report, index) => {
              const isLastRow = index === reports.length - 1;
              const borderBottomClass = isLastRow
                ? ''
                : 'border-b border-[#2b4940]';
              const config = STATUS_CONFIG[report.status] || {
                label: report.status,
                variant: 'default' as const,
              };
              const isAssigning = assigningId === report.id;

              return (
                <tr
                  key={report.id}
                  className="hover:bg-[#1a332d]/40 transition-colors"
                >
                  {/* Report ID */}
                  <td
                    className={`p-[13px_11px] ${borderBottomClass} text-xs font-mono font-medium text-[#e7f5ef]`}
                  >
                    #NM-{report.id.toString().padStart(3, '0')}
                  </td>

                  {/* Location */}
                  <td
                    className={`p-[13px_11px] ${borderBottomClass} text-xs text-[#e7f5ef]`}
                  >
                    {report.location_label ||
                      (report.cell_id ? `Cell ${report.cell_id}` : '—')}
                  </td>

                  {/* Issue */}
                  <td
                    className={`p-[13px_11px] ${borderBottomClass} text-xs text-[#e7f5ef] max-w-[200px]`}
                    title={report.note || undefined}
                  >
                    {formatIssue(report.note)}
                  </td>

                  {/* Reported */}
                  <td
                    className={`p-[13px_11px] ${borderBottomClass} text-xs text-[#a1b9b0] whitespace-nowrap`}
                  >
                    {report.created_at ? relativeTime(report.created_at) : '—'}
                  </td>

                  {/* Status */}
                  <td
                    className={`p-[13px_11px] ${borderBottomClass} text-xs whitespace-nowrap`}
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <StatusTag
                        status={report.status}
                      >
                        {config.label}
                      </StatusTag>
                      {report.assigned_to && (
                        <span className="text-[10px] text-[#a1b9b0]">
                          ({report.assigned_to})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td
                    className={`p-[13px_11px] ${borderBottomClass} text-xs whitespace-nowrap`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {report.status === 'new' && (
                        <>
                          {isAssigning ? (
                            <div className="inline-flex items-center gap-1.5">
                              <input
                                type="text"
                                autoFocus
                                placeholder="Team name"
                                value={teamInput}
                                onChange={(e) => setTeamInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    submitAssign(report.id);
                                  } else if (e.key === 'Escape') {
                                    setAssigningId(null);
                                    setTeamInput('');
                                  }
                                }}
                                onBlur={() => submitAssign(report.id)}
                                className="w-24 px-2 py-1 text-[10px] rounded-lg border border-[#13845f] bg-[#0d1e1b] text-[#e7f5ef] placeholder-[#a1b9b0] focus:outline-none focus:ring-1 focus:ring-[#13845f]"
                              />
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setAssigningId(null);
                                  setTeamInput('');
                                }}
                                className="text-[10px] text-[#a1b9b0] hover:text-[#e7f5ef] px-1"
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setAssigningId(report.id);
                                setTeamInput('');
                              }}
                              className="inline-flex items-center px-2 py-1 border border-[#2b4940] rounded-lg bg-[#1a332d] text-[#e7f5ef] text-[10px] font-semibold hover:border-[#13845f] hover:bg-[#203e34] transition cursor-pointer"
                            >
                              Assign
                            </button>
                          )}
                        </>
                      )}

                      {report.status !== 'cleared' && (
                        <button
                          type="button"
                          onClick={() => onClear(report.id)}
                          className="inline-flex items-center px-2 py-1 border border-[#2b4940] rounded-lg bg-[#1a332d] text-[#e7f5ef] text-[10px] font-semibold hover:border-[#13845f] hover:bg-[#203e34] transition cursor-pointer"
                        >
                          Mark cleared
                        </button>
                      )}

                      {report.status === 'cleared' && (
                        <span className="text-[10px] text-[#a1b9b0] italic">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReportsTable;
