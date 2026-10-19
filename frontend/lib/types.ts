// NyahMuk API type definitions

/** GeoJSON Polygon geometry (coordinates in [lng, lat] order) */
export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: [number, number][][];
}

/** A single grid cell with risk prediction */
export interface RiskCell {
  cell_id: string;
  geometry: GeoJSONPolygon;
  risk_score: number;
  risk_level: "low" | "medium" | "high";
  top_factors: string[];
  confidence: "low" | "medium" | "high";
}

/** Response from GET /risk */
export interface RiskResponse {
  generated_at: string;
  day: number;
  horizon_days: number;
  model_version: string;
  cells: RiskCell[];
}

/** AI check result on a report photo */
export interface AICheck {
  label: "tyre" | "drain" | "flowerpot" | "bottle" | "coconut_shell" | "none" | "unknown";
  is_standing_water: boolean;
  confidence: number;
}

/** A community report */
export interface Report {
  id: string;
  lat: number;
  lng: number;
  photo_url: string;
  note: string;
  location_label?: string;
  created_at: string;
  status: "new" | "assigned" | "cleared";
  assigned_to: string | null;
  ai_check: AICheck;
  cell_id: string;
}

/** Model info metric */
export interface ModelMetric {
  name: string;
  value: string;
  note: string;
}

/** Response from GET /model-info */
export interface ModelInfo {
  model_version: string;
  last_trained: string;
  data_sources: string[];
  metrics: ModelMetric[];
}

/** Body for PATCH /reports/{id} */
export interface ReportPatch {
  status: "new" | "assigned" | "cleared";
  assigned_to?: string | null;
}
