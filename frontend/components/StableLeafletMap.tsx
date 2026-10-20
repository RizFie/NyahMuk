'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface StableLeafletMapProps {
  center: [number, number];
  zoom: number;
  className?: string;
  style?: CSSProperties;
  onMapClick?: (lat: number, lng: number) => void;
  renderLayers: () => L.LayerGroup;
}

export function StableLeafletMap({
  center,
  zoom,
  className,
  style,
  onMapClick,
  renderLayers,
}: StableLeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const clickHandlerRef = useRef<((event: L.LeafletMouseEvent) => void) | null>(null);
  const initialOptionsRef = useRef({ center, zoom, onMapClick, renderLayers });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { center: initialCenter, zoom: initialZoom, onMapClick: initialOnMapClick, renderLayers: initialRenderLayers } =
      initialOptionsRef.current;
    const map = L.map(container, {
      scrollWheelZoom: true,
    }).setView(initialCenter, initialZoom);
    const layers = initialRenderLayers().addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const handleClick = initialOnMapClick
      ? (event: L.LeafletMouseEvent) =>
          initialOnMapClick(event.latlng.lat, event.latlng.lng)
      : undefined;
    if (handleClick) map.on('click', handleClick);
    clickHandlerRef.current = handleClick ?? null;

    mapRef.current = map;
    layersRef.current = layers;
    const invalidateFrame = requestAnimationFrame(() => map.invalidateSize());

    return () => {
      cancelAnimationFrame(invalidateFrame);
      if (handleClick) map.off('click', handleClick);
      clickHandlerRef.current = null;
      layers.clearLayers();
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || onMapClick === initialOptionsRef.current.onMapClick) return;

    if (clickHandlerRef.current) {
      map.off('click', clickHandlerRef.current);
    }
    const handleClick = (event: L.LeafletMouseEvent) =>
      onMapClick?.(event.latlng.lat, event.latlng.lng);
    map.on('click', handleClick);
    clickHandlerRef.current = handleClick;

    return () => {
      map.off('click', handleClick);
      if (clickHandlerRef.current === handleClick) {
        clickHandlerRef.current = null;
      }
    };
  }, [onMapClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView(center, map.getZoom(), { animate: false });
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const layers = renderLayers();
    layersRef.current?.clearLayers();
    layers.addTo(map);
    layersRef.current = layers;
  }, [renderLayers]);

  return <div ref={containerRef} className={className} style={style} />;
}
