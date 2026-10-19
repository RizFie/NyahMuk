import { NextRequest, NextResponse } from "next/server";
import { reports } from "@/lib/mock-data";
import type { ReportPatch } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
  }

  const report = reports.find((r) => r.id === id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
  }

  const report = reports.find((r) => r.id === id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  try {
    const body = (await request.json()) as ReportPatch;

    if (body.status !== undefined && !["new", "assigned", "cleared"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid report status" }, { status: 400 });
    }
    if (body.status !== undefined) {
      report.status = body.status;
    }

    if ("assigned_to" in body) {
      report.assigned_to = body.assigned_to !== undefined ? body.assigned_to : null;
    }

    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
