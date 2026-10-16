import { NextResponse } from "next/server";
import type { ModelInfo } from "@/lib/types";

export async function GET() {
  const modelInfo: ModelInfo = {
    model_version: "v0.3.1-demo",
    last_trained: "2026-10-01T00:00:00Z",
    data_sources: [
      "Historical rainfall data (JPS)",
      "Land-use classification (satellite)",
      "Past dengue case records (MOH)",
      "Community report patterns",
      "Elevation and drainage maps",
    ],
    metrics: [
      {
        name: "AUC-ROC",
        value: "0.82",
        note: "Area under the ROC curve on validation set",
      },
      {
        name: "Precision (high-risk)",
        value: "0.74",
        note: "Of predicted high-risk cells, 74% had confirmed breeding",
      },
      {
        name: "Recall (high-risk)",
        value: "0.69",
        note: "Of actual high-risk cells, 69% were correctly identified",
      },
      {
        name: "Grid resolution",
        value: "~150m",
        note: "Each cell covers approximately 150×150 metres",
      },
    ],
  };

  return NextResponse.json(modelInfo);
}
