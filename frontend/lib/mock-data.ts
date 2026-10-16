// NyahMuk Mock Data Store
// Shared in-memory data store for community reports and mock calculations

import { TOWNSHIP_CENTRE, GRID_ROWS, GRID_COLS, CELL_SIZE_LAT, CELL_SIZE_LNG } from "./config";
import type { Report } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __nyahmuk_mock_reports: Report[] | undefined;
}

/**
 * Computes the zero-padded cell ID (e.g. "cell-04-05") for a given lat/lng
 * relative to the township centre and grid dimensions.
 */
export function computeCellId(lat: number, lng: number): string {
  const northLat = TOWNSHIP_CENTRE[0] + (GRID_ROWS / 2) * CELL_SIZE_LAT;
  const westLng = TOWNSHIP_CENTRE[1] - (GRID_COLS / 2) * CELL_SIZE_LNG;

  const row = Math.floor((northLat - lat) / CELL_SIZE_LAT);
  const col = Math.floor((lng - westLng) / CELL_SIZE_LNG);

  const clampedRow = Math.max(0, Math.min(GRID_ROWS - 1, row));
  const clampedCol = Math.max(0, Math.min(GRID_COLS - 1, col));

  return `cell-${String(clampedRow).padStart(2, "0")}-${String(clampedCol).padStart(2, "0")}`;
}

function getInitialReports(): Report[] {
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString();
  const daysAgo = (d: number, h = 0) => new Date(now - (d * 24 + h) * 3600 * 1000).toISOString();

  return [
    {
      id: 24,
      location_label: "Jalan Melati drainage",
      lat: 3.068,
      lng: 101.559,
      status: "new",
      assigned_to: null,
      note: "Stagnant water in open drain",
      created_at: hoursAgo(2),
      cell_id: "cell-04-05",
      photo_url: "/api/reports/photo",
      ai_check: {
        label: "Standing water detected",
        is_standing_water: true,
        confidence: 0.91,
      },
    },
    {
      id: 23,
      location_label: "Block 12 Taman Seri Jaya",
      lat: 3.0675,
      lng: 101.5585,
      status: "assigned",
      assigned_to: "Team Alpha",
      note: "Open container collecting rainwater",
      created_at: hoursAgo(5),
      cell_id: "cell-05-04",
      photo_url: "/api/reports/photo",
      ai_check: {
        label: "Potential breeding container",
        is_standing_water: true,
        confidence: 0.84,
      },
    },
    {
      id: 22,
      location_label: "Jalan Kenanga",
      lat: 3.0665,
      lng: 101.5595,
      status: "cleared",
      assigned_to: null,
      note: "Blocked drain near playground",
      created_at: daysAgo(1, 2),
      cell_id: "cell-07-06",
      photo_url: "/api/reports/photo",
      ai_check: {
        label: "Drainage issue confirmed",
        is_standing_water: true,
        confidence: 0.88,
      },
    },
    {
      id: 21,
      location_label: "Community playground",
      lat: 3.067,
      lng: 101.558,
      status: "assigned",
      assigned_to: "Team Beta",
      note: "Standing water after rain",
      created_at: daysAgo(1, 6),
      cell_id: "cell-06-03",
      photo_url: "/api/reports/photo",
      ai_check: {
        label: "Standing water detected",
        is_standing_water: true,
        confidence: 0.79,
      },
    },
    {
      id: 20,
      location_label: "Taman Murni junction",
      lat: 3.0685,
      lng: 101.5575,
      status: "new",
      assigned_to: null,
      note: "Abandoned tires collecting water",
      created_at: daysAgo(3, 1),
      cell_id: "cell-03-02",
      photo_url: "/api/reports/photo",
      ai_check: {
        label: "Breeding risk identified",
        is_standing_water: true,
        confidence: 0.92,
      },
    },
    {
      id: 19,
      location_label: "Block 7 parking area",
      lat: 3.066,
      lng: 101.5592,
      status: "cleared",
      assigned_to: null,
      note: "Puddle in pothole",
      created_at: daysAgo(4, 2),
      cell_id: "cell-08-05",
      photo_url: "/api/reports/photo",
      ai_check: {
        label: "Minor water accumulation",
        is_standing_water: true,
        confidence: 0.65,
      },
    },
    {
      id: 18,
      location_label: "Jalan Melati end",
      lat: 3.0678,
      lng: 101.5598,
      status: "cleared",
      assigned_to: null,
      note: "Clogged gutter",
      created_at: daysAgo(5, 3),
      cell_id: "cell-04-07",
      photo_url: "/api/reports/photo",
      ai_check: {
        label: "Drainage blockage",
        is_standing_water: false,
        confidence: 0.72,
      },
    },
    {
      id: 17,
      location_label: "Taman Harmoni entrance",
      lat: 3.0655,
      lng: 101.5583,
      status: "new",
      assigned_to: null,
      note: "Unused flower pots with water",
      created_at: daysAgo(1, 0),
      cell_id: "cell-09-04",
      photo_url: "/api/reports/photo",
      ai_check: {
        label: "Container breeding risk",
        is_standing_water: true,
        confidence: 0.86,
      },
    },
    {
      id: 16,
      location_label: "Behind Block 3",
      lat: 3.0682,
      lng: 101.557,
      status: "assigned",
      assigned_to: "Team Alpha",
      note: "Construction debris holding water",
      created_at: daysAgo(2, 4),
      cell_id: "cell-03-01",
      photo_url: "/api/reports/photo",
      ai_check: {
        label: "Construction site risk",
        is_standing_water: true,
        confidence: 0.81,
      },
    },
    {
      id: 15,
      location_label: "Near surau",
      lat: 3.0672,
      lng: 101.56,
      status: "assigned",
      assigned_to: "Team Gamma",
      note: "Old basin with stagnant water",
      created_at: daysAgo(3, 5),
      cell_id: "cell-05-08",
      photo_url: "/api/reports/photo",
      ai_check: {
        label: "Stagnant water confirmed",
        is_standing_water: true,
        confidence: 0.9,
      },
    },
  ];
}

// Preserve mutable reports array in Node.js global state to survive Next.js module reloads
if (!globalThis.__nyahmuk_mock_reports) {
  globalThis.__nyahmuk_mock_reports = getInitialReports();
}

export const reports: Report[] = globalThis.__nyahmuk_mock_reports;
