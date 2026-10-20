'use client';

import React, { useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TOWNSHIP_CENTRE } from '@/lib/config';
import { StableLeafletMap } from './StableLeafletMap';

export interface ReportMapInnerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  className?: string;
}

export function ReportMapInner({
  onLocationSelect,
  selectedLocation,
  className = '',
}: ReportMapInnerProps) {
  const renderLayers = useCallback(
    () => {
      const layers = L.layerGroup();
      if (selectedLocation) {
        const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
          draggable: true,
          icon: L.divIcon({
            className: 'report-location-marker',
            html: '<span style="display:block;width:16px;height:16px;border:3px solid white;border-radius:50%;background:#13845f;box-shadow:0 1px 5px rgba(0,0,0,.5)"></span>',
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
        });
        marker.on('dragend', () => {
          const position = marker.getLatLng();
          onLocationSelect(position.lat, position.lng);
        });
        layers.addLayer(marker);
      }
      return layers;
    },
    [onLocationSelect, selectedLocation]
  );

  return (
    <div
      className={`relative w-full h-[200px] rounded-[11px] overflow-hidden border border-[#2b4940] bg-[#0d1e1b] ${className}`}
    >
      <style>{`
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
        center={
          selectedLocation
            ? [selectedLocation.lat, selectedLocation.lng]
            : TOWNSHIP_CENTRE
        }
        zoom={15}
        className="h-full w-full cursor-crosshair"
        style={{ height: '200px', width: '100%' }}
        onMapClick={onLocationSelect}
        renderLayers={renderLayers}
      />

      {/* Helper floating indicator */}
      <div className="absolute top-2 left-2 z-[400] bg-[#142925]/90 backdrop-blur-sm border border-[#2b4940] px-2 py-1 rounded text-[10px] text-[#e7f5ef] pointer-events-none">
        {selectedLocation ? (
          <span>
            Pin: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
          </span>
        ) : (
          <span className="text-[#a1b9b0]">Tap map to set location</span>
        )}
      </div>
    </div>
  );
}

export default ReportMapInner;
