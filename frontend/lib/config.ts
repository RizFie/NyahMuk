// NyahMuk configuration constants

/** Township name shown in the topbar pill */
export const PLACE_NAME = "Bandar Bukit Raja";

/** Centre of the township (lat, lng) – used to generate mock grid cells */
export const TOWNSHIP_CENTRE: [number, number] = [3.0874, 101.4334];

/** Grid dimensions: 12×12 cells of ~150m each */
export const GRID_ROWS = 12;
export const GRID_COLS = 12;

/** Approximate cell size in degrees (~150m ≈ 0.00135° lat, 0.00150° lng at ~3°N) */
export const CELL_SIZE_LAT = 0.005;
export const CELL_SIZE_LNG = 0.005;
export const GRID_ORIGIN: [number, number] = [3.0574, 101.4034];

/** Whether the built-in mock API is active. */
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_API_MODE !== "real";
}

export function apiMode(): "real" | "mock" {
  return isMockMode() ? "mock" : "real";
}
