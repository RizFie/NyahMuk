"""Create data/grid.geojson (a regular grid of cells over the demo township).

Defaults = Bandar Bukit Raja, Klang (centre about 3.0874, 101.4334).
Other area:  python make_grid.py --lat <lat> --lng <lng> --cols 12 --rows 12 --cell 0.005
(--lat/--lng is the SOUTH-WEST corner of cell A1. Cell size 0.005 degrees is about 550 m.)
"""
import argparse, json
from pathlib import Path
import risk

ap = argparse.ArgumentParser()
ap.add_argument("--lat", type=float, default=3.0574, help="south-west corner latitude")
ap.add_argument("--lng", type=float, default=101.4034, help="south-west corner longitude")
ap.add_argument("--cols", type=int, default=12)
ap.add_argument("--rows", type=int, default=12)
ap.add_argument("--cell", type=float, default=0.005, help="cell size in degrees")
a = ap.parse_args()

feats = []
for c in range(a.cols):
    for r in range(a.rows):
        x0, y0 = a.lng + c * a.cell, a.lat + r * a.cell
        x1, y1 = x0 + a.cell, y0 + a.cell
        ring = [[x0, y0], [x0, y1], [x1, y1], [x1, y0], [x0, y0]]   # GeoJSON order is [lng, lat]
        feats.append({"type": "Feature",
                      "properties": {"cell_id": f"{risk.col_label(c)}{r + 1}"},
                      "geometry": {"type": "Polygon", "coordinates": [[[round(p[0], 6), round(p[1], 6)] for p in ring]]}})
grid = {"type": "FeatureCollection",
        "meta": {"origin_lat": a.lat, "origin_lng": a.lng, "dlat": a.cell, "dlng": a.cell,
                 "ncols": a.cols, "nrows": a.rows},
        "features": feats}
out = risk.DATA_DIR / "grid.geojson"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(grid), encoding="utf-8")
print(f"wrote {out} with {len(feats)} cells")
