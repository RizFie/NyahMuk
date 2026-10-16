// Risk level colours and factor code translations

/** Map risk_level to fill colour (for map polygons) */
export const RISK_COLOURS: Record<string, string> = {
  high: "#e94b4b",
  medium: "#eda72a",
  low: "#19885d",
};

/** Opacity for risk grid polygons on the map */
export const RISK_FILL_OPACITY = 0.45;

/** Map risk_level to marker colour (for report pins) */
export const STATUS_MARKER_COLOURS: Record<string, string> = {
  new: "#e94b4b",
  assigned: "#eda72a",
  cleared: "#19885d",
};

/** Human-readable translations for risk factor codes */
export const FACTOR_LABELS: Record<string, string> = {
  rain_last_7d_high: "Heavy rain in the past 7 days",
  rain_last_3d_high: "Heavy rain in the past 3 days",
  standing_water_nearby: "Standing water reported nearby",
  construction_site: "Active construction site",
  drainage_blocked: "Blocked drainage detected",
  low_elevation: "Low-lying area prone to pooling",
  vegetation_dense: "Dense vegetation cover",
  waste_accumulation: "Waste accumulation observed",
  population_density_high: "High population density area",
  previous_outbreak: "Previous dengue outbreak zone",
  humidity_high: "Sustained high humidity levels",
  temperature_optimal: "Temperature favourable for breeding",
  open_containers: "Open containers detected",
  poor_drainage: "Poor drainage infrastructure",
  stagnant_pond: "Stagnant pond or water body",
};

/** Get human-readable label for a factor code, falling back to formatted code */
export function getFactorLabel(code: string): string {
  return FACTOR_LABELS[code] || code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
