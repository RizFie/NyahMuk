import { NextRequest, NextResponse } from "next/server";
import { reports, computeCellId } from "@/lib/mock-data";
import { TOWNSHIP_CENTRE } from "@/lib/config";
import type { Report } from "@/lib/types";

export async function GET() {
  // Return all reports as JSON array sorted by created_at descending
  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return NextResponse.json(sortedReports);
}

export async function POST(request: NextRequest) {
  let lat = TOWNSHIP_CENTRE[0];
  let lng = TOWNSHIP_CENTRE[1];
  let note = "";
  let locationLabel: string | undefined = undefined;

  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const latVal = formData.get("lat");
      const lngVal = formData.get("lng");
      const noteVal = formData.get("note");
      const locVal = formData.get("location_label");

      if (latVal) lat = parseFloat(latVal.toString());
      if (lngVal) lng = parseFloat(lngVal.toString());
      if (noteVal) note = noteVal.toString();
      if (locVal) locationLabel = locVal.toString();
    } else {
      // Fallback to JSON payload if client sent application/json
      const body = await request.json();
      if (body.lat !== undefined) lat = parseFloat(body.lat);
      if (body.lng !== undefined) lng = parseFloat(body.lng);
      if (body.note !== undefined) note = String(body.note);
      if (body.location_label !== undefined) locationLabel = String(body.location_label);
    }
  } catch {
    return NextResponse.json({ error: "Invalid report payload" }, { status: 400 });
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng must be valid numbers" }, { status: 400 });
  }

  const newId = `r_${Math.random().toString(16).slice(2, 10)}`;

  // AI check: randomly choose standing water or not (80% yes), confidence 0.65-0.95
  const isStandingWater = Math.random() < 0.8;
  const confidence = Math.round((0.65 + Math.random() * 0.3) * 100) / 100;
  const label = isStandingWater ? "drain" : "none";

  const newReport: Report = {
    id: newId,
    lat,
    lng,
    photo_url: "https://images.example.com/nyahmuk/report-upload.jpg",
    note,
    location_label: locationLabel || undefined,
    created_at: new Date().toISOString(),
    status: "new",
    assigned_to: null,
    ai_check: {
      label,
      is_standing_water: isStandingWater,
      confidence,
    },
    cell_id: computeCellId(lat, lng),
  };

  // Prepend to reports array so it is preserved in memory
  reports.unshift(newReport);

  return NextResponse.json(newReport, { status: 201 });
}
