// NyahMuk Mock Data Store
// Shared in-memory data store for community reports and mock calculations

import { GRID_ORIGIN, GRID_ROWS, GRID_COLS, CELL_SIZE_LAT, CELL_SIZE_LNG } from "./config";
import type { Report } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __nyahmuk_mock_reports: Report[] | undefined;
}

/**
 * Computes a column-letter and row-number cell ID (e.g. "A1") for a given lat/lng
 * relative to the township centre and grid dimensions.
 */
export function computeCellId(lat: number, lng: number): string {
  const row = Math.floor((lat - GRID_ORIGIN[0]) / CELL_SIZE_LAT);
  const col = Math.floor((lng - GRID_ORIGIN[1]) / CELL_SIZE_LNG);

  const clampedRow = Math.max(0, Math.min(GRID_ROWS - 1, row));
  const clampedCol = Math.max(0, Math.min(GRID_COLS - 1, col));

  return `${String.fromCharCode(65 + clampedCol)}${clampedRow + 1}`;
}

function getInitialReports(): Report[] {
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString();
  const daysAgo = (d: number, h = 0) => new Date(now - (d * 24 + h) * 3600 * 1000).toISOString();

  return [
    {
      id: "r_1a2b3c4d",
      location_label: "Jalan Melati drainage",
      lat: 3.087,
      lng: 101.433,
      status: "new",
      assigned_to: null,
      note: "Stagnant water in open drain",
      created_at: hoursAgo(2),
      cell_id: "G7",
      photo_url: "https://images.example.com/nyahmuk/report-024.jpg",
      ai_check: {
        label: "drain",
        is_standing_water: true,
        confidence: 0.91,
      },
    },
    {
      id: "r_2b3c4d5e",
      location_label: "Block 12 Taman Seri Jaya",
      lat: 3.082,
      lng: 101.428,
      status: "assigned",
      assigned_to: "Team Alpha",
      note: "Open container collecting rainwater",
      created_at: hoursAgo(5),
      cell_id: "F6",
      photo_url: "https://images.example.com/nyahmuk/report-023.jpg",
      ai_check: {
        label: "bottle",
        is_standing_water: true,
        confidence: 0.84,
      },
    },
    {
      id: "r_3c4d5e6f",
      location_label: "Jalan Kenanga",
      lat: 3.077,
      lng: 101.423,
      status: "cleared",
      assigned_to: null,
      note: "Blocked drain near playground",
      created_at: daysAgo(1, 2),
      cell_id: "D5",
      photo_url: "https://images.example.com/nyahmuk/report-022.jpg",
      ai_check: {
        label: "drain",
        is_standing_water: true,
        confidence: 0.88,
      },
    },
    {
      id: "r_4d5e6f70",
      location_label: "Community playground",
      lat: 3.092,
      lng: 101.438,
      status: "assigned",
      assigned_to: "Team Beta",
      note: "Standing water after rain",
      created_at: daysAgo(1, 6),
      cell_id: "H8",
      photo_url: "https://images.example.com/nyahmuk/report-021.jpg",
      ai_check: {
        label: "none",
        is_standing_water: true,
        confidence: 0.79,
      },
    },
    {
      id: "r_5e6f7081",
      location_label: "Taman Murni junction",
      lat: 3.102,
      lng: 101.413,
      status: "new",
      assigned_to: null,
      note: "Abandoned tires collecting water",
      created_at: daysAgo(3, 1),
      cell_id: "C10",
      photo_url: "https://images.example.com/nyahmuk/report-020.jpg",
      ai_check: {
        label: "tyre",
        is_standing_water: true,
        confidence: 0.92,
      },
    },
    {
      id: "r_6f708192",
      location_label: "Block 7 parking area",
      lat: 3.067,
      lng: 101.408,
      status: "cleared",
      assigned_to: null,
      note: "Puddle in pothole",
      created_at: daysAgo(4, 2),
      cell_id: "B2",
      photo_url: "https://images.example.com/nyahmuk/report-019.jpg",
      ai_check: {
        label: "unknown",
        is_standing_water: true,
        confidence: 0.65,
      },
    },
    {
      id: "r_708192a3",
      location_label: "Jalan Melati end",
      lat: 3.097,
      lng: 101.448,
      status: "cleared",
      assigned_to: null,
      note: "Clogged gutter",
      created_at: daysAgo(5, 3),
      cell_id: "J9",
      photo_url: "https://images.example.com/nyahmuk/report-018.jpg",
      ai_check: {
        label: "drain",
        is_standing_water: false,
        confidence: 0.72,
      },
    },
    {
      id: "r_8192a3b4",
      location_label: "Taman Harmoni entrance",
      lat: 3.072,
      lng: 101.418,
      status: "new",
      assigned_to: null,
      note: "Unused flower pots with water",
      created_at: daysAgo(1, 0),
      cell_id: "D3",
      photo_url: "https://images.example.com/nyahmuk/report-017.jpg",
      ai_check: {
        label: "flowerpot",
        is_standing_water: true,
        confidence: 0.86,
      },
    },
    {
      id: "r_92a3b4c5",
      location_label: "Behind Block 3",
      lat: 3.107,
      lng: 101.443,
      status: "assigned",
      assigned_to: "Team Alpha",
      note: "Construction debris holding water",
      created_at: daysAgo(2, 4),
      cell_id: "I11",
      photo_url: "https://images.example.com/nyahmuk/report-016.jpg",
      ai_check: {
        label: "coconut_shell",
        is_standing_water: true,
        confidence: 0.81,
      },
    },
    {
      id: "r_a3b4c5d6",
      location_label: "Near surau",
      lat: 3.087,
      lng: 101.453,
      status: "assigned",
      assigned_to: "Team Gamma",
      note: "Old basin with stagnant water",
      created_at: daysAgo(3, 5),
      cell_id: "L7",
      photo_url: "https://images.example.com/nyahmuk/report-015.jpg",
      ai_check: {
        label: "none",
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
