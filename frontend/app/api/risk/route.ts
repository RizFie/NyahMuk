import { NextRequest, NextResponse } from "next/server";
import { GRID_ORIGIN, GRID_ROWS, GRID_COLS, CELL_SIZE_LAT, CELL_SIZE_LNG } from "@/lib/config";
import type { RiskResponse, RiskCell, GeoJSONPolygon } from "@/lib/types";

// Available risk factor codes
const ALL_FACTORS = [
  "rain_last_7d_high",
  "standing_water_nearby",
  "construction_site",
  "drainage_blocked",
  "low_elevation",
  "vegetation_dense",
  "waste_accumulation",
  "humidity_high",
  "temperature_optimal",
  "open_containers",
  "poor_drainage",
  "stagnant_pond",
] as const;

const HIGH_RISK_POOL = [
  "standing_water_nearby",
  "drainage_blocked",
  "stagnant_pond",
  "open_containers",
  "poor_drainage",
  "rain_last_7d_high",
  "waste_accumulation",
];

const MEDIUM_RISK_POOL = [
  "rain_last_7d_high",
  "vegetation_dense",
  "humidity_high",
  "low_elevation",
  "open_containers",
  "construction_site",
  "poor_drainage",
];

const LOW_RISK_POOL = [
  "temperature_optimal",
  "vegetation_dense",
  "low_elevation",
  "humidity_high",
  "construction_site",
  "rain_last_7d_high",
];

/**
 * 32-bit deterministic integer hash function returning a float in [0, 1).
 */
function hash32(r: number, c: number, d: number, salt: number = 0): number {
  let h = (r * 374761393 + c * 668265263 + d * 3628273133 + salt * 1442695040888963407) ^ 0x5bf03635;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Calculates a deterministic risk score [0, 1] for a grid cell and prediction day.
 * Includes realistic hotspot clustering around the centre of the township.
 */
function calculateRiskScore(row: number, col: number, day: number): number {
  // Primary hotspot near row 5, col 5 and secondary hotspot near row 4, col 7
  const d1 = Math.hypot(row - 5.0, col - 5.0);
  const d2 = Math.hypot(row - 4.0, col - 7.0);

  // Gaussian decay for hotspots
  const hotspot1 = 0.42 * Math.exp(-(d1 * d1) / 7.5);
  const hotspot2 = 0.32 * Math.exp(-(d2 * d2) / 5.5);
  const hotspotIntensity = hotspot1 + hotspot2;

  // Day variation to simulate mosquito lifecycle & weather shifts over time
  const dayShift = Math.sin((day * 0.7) + (row * 0.3) + (col * 0.2)) * 0.07;

  // Pseudo-random local variation
  const noise = (hash32(row, col, day, 101) - 0.5) * 0.22;

  // Base background risk
  const baseRisk = 0.16;

  const rawScore = hotspotIntensity + baseRisk + dayShift + noise;
  const clamped = Math.max(0.05, Math.min(0.96, rawScore));
  return Math.round(clamped * 100) / 100;
}

/**
 * Selects 2 to 3 distinct factor codes deterministically based on risk level and cell location.
 */
function pickTopFactors(row: number, col: number, day: number, riskLevel: "low" | "medium" | "high"): string[] {
  const pool = riskLevel === "high" ? HIGH_RISK_POOL : riskLevel === "medium" ? MEDIUM_RISK_POOL : LOW_RISK_POOL;
  const count = hash32(row, col, day, 202) > 0.5 ? 3 : 2;

  const selected: string[] = [];
  let salt = 300;

  while (selected.length < count && selected.length < pool.length) {
    const idx = Math.floor(hash32(row, col, day, salt) * pool.length);
    const factor = pool[idx];
    if (!selected.includes(factor)) {
      selected.push(factor);
    }
    salt += 37;
  }

  return selected;
}

/**
 * Determines confidence level based on score distance from the classification thresholds (0.35 and 0.65).
 */
function calculateConfidence(score: number): "low" | "medium" | "high" {
  const dist = Math.min(Math.abs(score - 0.35), Math.abs(score - 0.65));
  if (dist < 0.05) {
    return "low";
  }
  if (dist < 0.12) {
    return "medium";
  }
  return "high";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dayParam = searchParams.get("day");
  let day = 0;
  if (dayParam !== null) {
    const parsed = parseInt(dayParam, 10);
    if (!isNaN(parsed)) {
      day = Math.max(0, Math.min(6, parsed));
    }
  }

  const [southLat, westLng] = GRID_ORIGIN;

  const cells: RiskCell[] = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cellId = `${String.fromCharCode(65 + c)}${r + 1}`;

      const bottomLat = southLat + r * CELL_SIZE_LAT;
      const topLat = bottomLat + CELL_SIZE_LAT;
      const leftLng = westLng + c * CELL_SIZE_LNG;
      const rightLng = leftLng + CELL_SIZE_LNG;

      // Coordinates in [lng, lat] order with 5 points (closed ring)
      const polygon: GeoJSONPolygon = {
        type: "Polygon",
        coordinates: [
          [
            [Number(leftLng.toFixed(6)), Number(bottomLat.toFixed(6))],
            [Number(rightLng.toFixed(6)), Number(bottomLat.toFixed(6))],
            [Number(rightLng.toFixed(6)), Number(topLat.toFixed(6))],
            [Number(leftLng.toFixed(6)), Number(topLat.toFixed(6))],
            [Number(leftLng.toFixed(6)), Number(bottomLat.toFixed(6))],
          ],
        ],
      };

      const riskScore = calculateRiskScore(r, c, day);

      let riskLevel: "low" | "medium" | "high";
      if (riskScore > 0.65) {
        riskLevel = "high";
      } else if (riskScore >= 0.35) {
        riskLevel = "medium";
      } else {
        riskLevel = "low";
      }

      const topFactors = pickTopFactors(r, c, day, riskLevel);
      const confidence = calculateConfidence(riskScore);

      cells.push({
        cell_id: cellId,
        geometry: polygon,
        risk_score: riskScore,
        risk_level: riskLevel,
        top_factors: topFactors,
        confidence,
      });
    }
  }

  const response: RiskResponse = {
    generated_at: new Date().toISOString(),
    day,
    horizon_days: 7,
    model_version: "v0.3.1-demo",
    cells,
  };

  return NextResponse.json(response);
}
