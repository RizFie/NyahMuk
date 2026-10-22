'use client';

import { useEffect, useState } from 'react';

export type ViewMode = 'management' | 'resident';

const VIEW_MODE_KEY = 'nyahmuk-view-mode';
const OWN_REPORTS_KEY = 'nyahmuk-own-report-ids';
const VIEW_MODE_EVENT = 'nyahmuk-view-mode-change';
const OWN_REPORTS_EVENT = 'nyahmuk-own-reports-change';

function readViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'management';
  return window.sessionStorage.getItem(VIEW_MODE_KEY) === 'resident'
    ? 'resident'
    : 'management';
}

export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewModeState] = useState<ViewMode>('management');

  useEffect(() => {
    const update = () => setViewModeState(readViewMode());
    update();
    window.addEventListener(VIEW_MODE_EVENT, update);
    return () => window.removeEventListener(VIEW_MODE_EVENT, update);
  }, []);

  const setViewMode = (mode: ViewMode) => {
    window.sessionStorage.setItem(VIEW_MODE_KEY, mode);
    setViewModeState(mode);
    window.dispatchEvent(new Event(VIEW_MODE_EVENT));
  };

  return [viewMode, setViewMode];
}

export function getOwnReportIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(OWN_REPORTS_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function rememberOwnReportId(id: string): void {
  const ids = getOwnReportIds();
  if (ids.includes(id)) return;
  window.sessionStorage.setItem(OWN_REPORTS_KEY, JSON.stringify([...ids, id]));
  window.dispatchEvent(new Event(OWN_REPORTS_EVENT));
}

export function useOwnReportIds(): string[] {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const update = () => setIds(getOwnReportIds());
    update();
    window.addEventListener(OWN_REPORTS_EVENT, update);
    return () => window.removeEventListener(OWN_REPORTS_EVENT, update);
  }, []);

  return ids;
}
