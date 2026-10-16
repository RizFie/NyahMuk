'use client';

import React, { useMemo } from 'react';
import type { Report, RiskCell } from '@/lib/types';
import StatusTag from './StatusTag';

export interface PriorityListProps {
  reports: Report[];
  cells: RiskCell[];
}

interface PriorityItem {
  id: string;
  title: string;
  subtitle: string;
  markerType: 'high' | 'medium' | 'cleared';
  markerChar: string;
  tagStatus: 'new' | 'assigned' | 'cleared' | 'high' | 'medium' | 'low';
  tagLabel: 'HIGH' | 'MEDIUM' | 'REVIEWED';
}

const MARKER_STYLES = {
  high: 'bg-[#482929] text-[#ff7777]',
  medium: 'bg-[#43351c] text-[#f4bd50]',
  cleared: 'bg-[#1b3d30] text-[#55d7a0]',
};

export default function PriorityList({ reports = [], cells = [] }: PriorityListProps) {
  const cellMap = useMemo(() => {
    const map = new Map<string, RiskCell>();
    for (const cell of cells) {
      map.set(cell.cell_id, cell);
    }
    return map;
  }, [cells]);

  const openReports = useMemo(() => {
    return reports
      .filter((r) => r.status !== 'cleared')
      .sort((a, b) => {
        const cellA = cellMap.get(a.cell_id);
        const cellB = cellMap.get(b.cell_id);
        const scoreA = cellA?.risk_score ?? 0;
        const scoreB = cellB?.risk_score ?? 0;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [reports, cellMap]);

  const items = useMemo(() => {
    const result: PriorityItem[] = [];
    const coveredCellIds = new Set<string>();

    // 1. Add top open reports (up to 4)
    for (const report of openReports.slice(0, 4)) {
      coveredCellIds.add(report.cell_id);
      const cell = cellMap.get(report.cell_id);
      const riskLevel = cell?.risk_level || 'high';

      let tagLabel: 'HIGH' | 'MEDIUM' | 'REVIEWED' = 'HIGH';
      let tagStatus: 'new' | 'assigned' | 'cleared' = 'new';
      let markerType: 'high' | 'medium' | 'cleared' = 'high';
      let markerChar = '!';

      if (report.status === 'assigned') {
        tagLabel = 'MEDIUM';
        tagStatus = 'assigned';
        markerType = 'medium';
        markerChar = '!';
      } else if (riskLevel === 'medium') {
        tagLabel = 'MEDIUM';
        tagStatus = 'assigned';
        markerType = 'medium';
        markerChar = '!';
      } else {
        tagLabel = 'HIGH';
        tagStatus = 'new';
        markerType = 'high';
        markerChar = '!';
      }

      const title = report.location_label
        ? `${report.location_label} · Cell ${report.cell_id}`
        : `Cell ${report.cell_id} · ${report.note || 'Community Report'}`;

      const factors = cell?.top_factors?.length
        ? cell.top_factors.slice(0, 2).join(', ')
        : report.note || 'Standing water reported';

      const subtitle = report.ai_check?.label
        ? `AI: ${report.ai_check.label} · ${factors}`
        : factors;

      result.push({
        id: `report-${report.id}`,
        title,
        subtitle,
        markerType,
        markerChar,
        tagStatus,
        tagLabel,
      });
    }

    // 2. If fewer than 4, fill with highest-risk cells
    if (result.length < 4 && cells.length > 0) {
      const sortedCells = [...cells].sort((a, b) => b.risk_score - a.risk_score);
      for (const cell of sortedCells) {
        if (result.length >= 4) break;
        if (coveredCellIds.has(cell.cell_id)) continue;

        coveredCellIds.add(cell.cell_id);

        let tagLabel: 'HIGH' | 'MEDIUM' | 'REVIEWED' = 'HIGH';
        let tagStatus: 'high' | 'medium' | 'cleared' = 'high';
        let markerType: 'high' | 'medium' | 'cleared' = 'high';
        let markerChar = '!';

        if (cell.risk_level === 'medium') {
          tagLabel = 'MEDIUM';
          tagStatus = 'medium';
          markerType = 'medium';
          markerChar = '!';
        } else if (cell.risk_level === 'low') {
          tagLabel = 'REVIEWED';
          tagStatus = 'cleared';
          markerType = 'cleared';
          markerChar = '✓';
        } else {
          tagLabel = 'HIGH';
          tagStatus = 'high';
          markerType = 'high';
          markerChar = '!';
        }

        const title = `Sector ${cell.cell_id} · Hotspot Area`;
        const subtitle = `Risk score: ${Math.round(cell.risk_score * 100)}% · ${
          cell.top_factors?.length
            ? cell.top_factors.slice(0, 2).join(', ')
            : 'High vector probability'
        }`;

        result.push({
          id: `cell-${cell.cell_id}`,
          title,
          subtitle,
          markerType,
          markerChar,
          tagStatus,
          tagLabel,
        });
      }
    }

    return result;
  }, [openReports, cells, cellMap]);

  if (items.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-[#a1b9b0]">
        No priority areas identified.
      </div>
    );
  }

  return (
    <div className="risk-list flex flex-col">
      {items.map((item) => (
        <div
          key={item.id}
          className="risk-row flex items-center gap-[10px] py-[14px] border-b border-[#2b4940] last:border-b-0 max-[680px]:gap-2"
        >
          <div
            className={`risk-marker grid place-items-center w-[35px] h-[35px] shrink-0 rounded-[11px] font-[800] text-sm ${MARKER_STYLES[item.markerType]}`}
          >
            {item.markerChar}
          </div>
          <div className="risk-info min-w-0 flex-1">
            <strong className="block text-xs leading-[1.5] text-[#e7f5ef] truncate max-[680px]:text-[11px]">
              {item.title}
            </strong>
            <small className="block mt-1 text-[#a1b9b0] text-[11px] leading-[1.5] truncate max-[680px]:text-[10px]">
              {item.subtitle}
            </small>
          </div>
          <StatusTag status={item.tagStatus} label={item.tagLabel} />
        </div>
      ))}
    </div>
  );
}

export { PriorityList };
