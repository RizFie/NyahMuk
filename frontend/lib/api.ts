// API client functions for NyahMuk

import { getApiBase } from "./config";
import type { RiskResponse, Report, ModelInfo, ReportPatch } from "./types";

const base = () => getApiBase();

/** Fetch risk grid for a given day (0-6) */
export async function fetchRisk(day: number = 0): Promise<RiskResponse> {
  const res = await fetch(`${base()}/api/risk?day=${day}`);
  if (!res.ok) throw new Error(`Failed to fetch risk data: ${res.status}`);
  return res.json();
}

/** Fetch all community reports */
export async function fetchReports(): Promise<Report[]> {
  const res = await fetch(`${base()}/api/reports`);
  if (!res.ok) throw new Error(`Failed to fetch reports: ${res.status}`);
  return res.json();
}

/** Submit a new report (multipart form data) */
export async function submitReport(formData: FormData): Promise<Report> {
  const res = await fetch(`${base()}/api/reports`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Failed to submit report: ${res.status}`);
  return res.json();
}

/** Update a report's status */
export async function patchReport(id: number, patch: ReportPatch): Promise<Report> {
  const res = await fetch(`${base()}/api/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Failed to update report: ${res.status}`);
  return res.json();
}

/** Fetch model information */
export async function fetchModelInfo(): Promise<ModelInfo> {
  const res = await fetch(`${base()}/api/model-info`);
  if (!res.ok) throw new Error(`Failed to fetch model info: ${res.status}`);
  return res.json();
}
