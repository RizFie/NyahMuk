'use client';

import React, { useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StableLeafletMap } from './StableLeafletMap';
import type { RiskCell, Report } from '@/lib/types';
import {
  RISK_COLOURS,
  RISK_FILL_OPACITY,
  STATUS_MARKER_COLOURS,
  getFactorLabel,
} from '@/lib/risk';
import { TOWNSHIP_CENTRE } from '@/lib/config';
import { relativeTime } from '@/lib/time';
import { formatReportId } from '@/lib/report-id';

export interface RiskMapInnerProps {
  cells: RiskCell[];
  reports: Report[];
  modelVersion: string;
  generatedAt: string;
  className?: string;
}

export function RiskMapInner({
  cells = [],
  reports = [],
  modelVersion = '',
  generatedAt = '',
  className = '',
}: RiskMapInnerProps) {
  // Filter valid reports with numeric lat/lng
  const validReports = reports.filter(
    (r) =>
      typeof r?.lat === 'number' &&
      !isNaN(r.lat) &&
      typeof r?.lng === 'number' &&
      !isNaN(r.lng)
  );
  const renderLayers = useCallback(
    () => {
      const layers = L.layerGroup();

      cells.forEach((cell) => {
        const ring = cell.geometry?.coordinates?.[0];
        if (!ring || ring.length === 0) return;

        const positions: [number, number][] = ring.map(([lng, lat]) => [
          lat,
          lng,
        ]);
        const fillColor = RISK_COLOURS[cell.risk_level] || '#19885d';
        const scorePercent = Math.round(cell.risk_score * 100);
        const polygon = L.polygon(positions, {
          fillColor,
          fillOpacity: RISK_FILL_OPACITY,
          weight: 1,
          color: '#2b4940',
          opacity: 0.5,
        });

        polygon.bindPopup(`
          <div class="bg-[#142925] text-[#e7f5ef] p-3 rounded-lg min-w-[210px] text-xs space-y-2">
            <div class="flex items-center justify-between border-b border-[#2b4940] pb-2">
              <span class="font-bold text-sm tracking-wide text-[#e7f5ef]">Cell ${cell.cell_id}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white" style="background-color:${fillColor}">${cell.risk_level} risk</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div><span class="text-[#a1b9b0] block text-[10px]">Risk Score</span><span class="font-semibold text-sm text-[#e7f5ef]">${scorePercent}%</span></div>
              <div><span class="text-[#a1b9b0] block text-[10px]">Confidence</span><span class="font-medium capitalize text-[#e7f5ef]">${cell.confidence}</span></div>
            </div>
            ${
              cell.top_factors?.length
                ? `<div class="pt-2 border-t border-[#2b4940]"><span class="text-[#a1b9b0] block text-[10px] mb-1 font-medium uppercase tracking-wider">Top Factors</span><ul class="space-y-1">${cell.top_factors
                    .map(
                      (factor) =>
                        `<li class="text-[11px] text-[#e7f5ef]">${getFactorLabel(factor)}</li>`
                    )
                    .join('')}</ul></div>`
                : ''
            }
          </div>
        `);
        layers.addLayer(polygon);
      });

      validReports.forEach((report) => {
        const markerColor =
          STATUS_MARKER_COLOURS[report.status] || '#19885d';
        const label =
          report.location_label ||
          (report.cell_id ? `${formatReportId(report.id)} · Cell ${report.cell_id}` : formatReportId(report.id));
        const marker = L.circleMarker([report.lat, report.lng], {
          radius: 6,
          fillColor: markerColor,
          fillOpacity: 0.9,
          weight: 2,
          color: '#ffffff',
        });

        marker.bindPopup(`
          <div class="bg-[#142925] text-[#e7f5ef] p-3 rounded-lg min-w-[200px] text-xs space-y-1.5">
            <div class="flex items-center justify-between border-b border-[#2b4940] pb-1.5">
              <span class="font-bold text-xs text-[#e7f5ef]">${label}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize text-white" style="background-color:${markerColor}">${report.status}</span>
            </div>
            ${report.note ? `<p class="text-[11px] text-[#a1b9b0] pt-1 leading-snug">${report.note}</p>` : ''}
            ${report.created_at ? `<div class="text-[10px] text-[#a1b9b0] pt-1">Reported: ${relativeTime(report.created_at)}</div>` : ''}
          </div>
        `);
        layers.addLayer(marker);
      });

      return layers;
    },
    [cells, validReports]
  );

  return (
    <div
      className={`relative w-full h-[330px] rounded-[13px] overflow-hidden border border-[#2b4940] bg-[#0d1e1b] ${className}`}
    >
      <style>{`
        .leaflet-popup-content-wrapper {
          background: #142925 !important;
          color: #e7f5ef !important;
          border: 1px solid #2b4940 !important;
          border-radius: 12px !important;
          padding: 0 !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          line-height: inherit !important;
        }
        .leaflet-popup-tip {
          background: #142925 !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #a1b9b0 !important;
          top: 8px !important;
          right: 8px !important;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: #e7f5ef !important;
        }
        .leaflet-bar a {
          background-color: #142925 !important;
          color: #e7f5ef !important;
          border-bottom: 1px solid #2b4940 !important;
        }
        .leaflet-bar a:hover {
          background-color: #1a332d !important;
          color: #e7f5ef !important;
        }
        .leaflet-bar {
          border: 1px solid #2b4940 !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-control-attribution {
          background: rgba(13, 30, 27, 0.75) !important;
          color: #a1b9b0 !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #13845f !important;
        }
      `}</style>

      <StableLeafletMap
        center={TOWNSHIP_CENTRE}
        zoom={15}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
        renderLayers={renderLayers}
      />

      {/* Model & Timestamp Badge */}
      {(modelVersion || generatedAt) && (
        <div className="absolute bottom-2 left-2 z-[400] bg-[#142925]/90 backdrop-blur-sm border border-[#2b4940] px-2.5 py-1 rounded-md text-[10px] text-[#a1b9b0] flex items-center gap-2 pointer-events-none">
          {modelVersion && (
            <span>
              Model: <strong className="text-[#e7f5ef]">{modelVersion}</strong>
            </span>
          )}
          {modelVersion && generatedAt && <span>•</span>}
          {generatedAt && (
            <span>
              Updated: <strong className="text-[#e7f5ef]">{relativeTime(generatedAt)}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default RiskMapInner;
