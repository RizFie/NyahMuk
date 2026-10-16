// NyahMuk configuration constants

/** Township name shown in the topbar pill */
export const PLACE_NAME = "Taman Seri Jaya";

/** Centre of the township (lat, lng) – used to generate mock grid cells */
export const TOWNSHIP_CENTRE: [number, number] = [3.0673, 101.5587];

/** Grid dimensions: 12×12 cells of ~150m each */
export const GRID_ROWS = 12;
export const GRID_COLS = 12;

/** Approximate cell size in degrees (~150m ≈ 0.00135° lat, 0.00150° lng at ~3°N) */
export const CELL_SIZE_LAT = 0.00135;
export const CELL_SIZE_LNG = 0.00150;

/** Whether to use built-in mock API (when NEXT_PUBLIC_API_BASE_URL is empty) */
export function isMockMode(): boolean {
  return !process.env.NEXT_PUBLIC_API_BASE_URL;
}

/** Resolved API base URL – falls back to relative path for mock routes */
export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
}
