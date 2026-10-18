"""Quick self-test (no models, no internet needed):  python test_backend.py"""
import io, json, os, shutil, sys, tempfile
from datetime import datetime
from pathlib import Path

tmp = Path(tempfile.mkdtemp())
shutil.copytree(Path(__file__).parent / "data", tmp / "data")
os.environ["NYAHMUK_DATA_DIR"] = str(tmp / "data")
os.environ["NYAHMUK_UPLOAD_DIR"] = str(tmp / "uploads")
os.environ["NYAHMUK_MODEL_DIR"] = str(tmp / "no_models")
sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from PIL import Image
import risk, main, make_osm_features

ok = 0
def check(name, cond):
    global ok
    print(("PASS " if cond else "FAIL ") + name)
    ok += bool(cond)
    if not cond: raise SystemExit(1)

# --- weather parsing (shape of an Open-Meteo reply) ---
today = datetime.now(risk.TZ)
days = [(today.replace(hour=0, minute=0, second=0, microsecond=0) + __import__("datetime").timedelta(days=i - 7)).strftime("%Y-%m-%d") for i in range(14)]
js = {"daily": {"time": days, "precipitation_sum": [10.0] * 14, "temperature_2m_mean": [28.0] * 14},
      "hourly": {"time": [d + "T12:00" for d in days], "relative_humidity_2m": [82] * 14}}
wx = risk.parse_open_meteo(js, today)
check("weather parsed, today_index == 7", wx["today_index"] == 7 and wx["daily"][0]["rh"] == 82)
risk._write("weather_cache.json", wx)

c = TestClient(main.app)
_m = risk.load_grid()['meta']
def pt(col, row):   # centre of a cell
    return _m['origin_lat'] + (row + 0.5) * _m['dlat'], _m['origin_lng'] + (col + 0.5) * _m['dlng']

# --- GET /risk ---
r = c.get("/risk", params={"day": 0}).json()
check("risk returns all 144 cells", len(r["cells"]) == 144 and r["day"] == 0 and r["model_version"] == "v0.1-rules")
cell = r["cells"][0]
check("risk cell has the contract fields", set(cell) == {"cell_id", "geometry", "risk_score", "risk_level", "top_factors", "confidence"})
check("heavy rain factor present (70 mm / 7 d)", "rain_last_7d_high" in cell["top_factors"] and cell["risk_level"] in ("medium", "high"))
check("confidence never above medium", all(x["confidence"] in ("low", "medium") for x in r["cells"]))
check("no NaN in JSON", bool(json.dumps(r, allow_nan=False)))
e = c.get("/risk", params={"day": 7}); check("day=7 -> 400 {error}", e.status_code == 400 and "error" in e.json())
e = c.get("/risk", params={"day": "x"}); check("day=x -> 422 {error}", e.status_code == 422 and "error" in e.json())

# --- other GETs ---
check("model-info", "metrics" in c.get("/model-info").json())
rep = c.get("/reports").json()
check("3 sample reports, absolute photo_url", len(rep) == 3 and rep[0]["photo_url"].startswith("http"))

# --- POST /reports (models missing -> label unknown) ---
buf = io.BytesIO(); Image.new("RGB", (800, 600), (90, 120, 160)).save(buf, "JPEG")
lat, lng = pt(6, 6)                               # inside the grid
res = c.post("/reports", files={"photo": ("p.jpg", buf.getvalue(), "image/jpeg")}, data={"lat": lat, "lng": lng, "note": "test"})
new = res.json()
check("POST /reports ok, unknown label without models", res.status_code == 200 and new["ai_check"]["label"] == "unknown" and new["status"] == "new")
check("report has cell_id and +08:00 timestamp", new["cell_id"] == risk.find_cell(lat, lng) and new["created_at"].endswith("+08:00"))
check("photo saved and EXIF-free JPEG", (Path(os.environ["NYAHMUK_UPLOAD_DIR"]) / f"{new['id']}.jpg").exists())
bad = c.post("/reports", files={"photo": ("p.txt", b"hello", "text/plain")}, data={"lat": 1, "lng": 1})
check("non-image -> 400 {error}", bad.status_code == 400 and "error" in bad.json())
bad = c.post("/reports", files={"photo": ("p.jpg", buf.getvalue(), "image/jpeg")}, data={"lat": 999, "lng": 1})
check("bad lat -> 400 {error}", bad.status_code == 400)

# --- a standing-water tyre report raises nearby risk, clearing it removes the effect ---
main.check_photo = lambda p: {"label": "tyre", "is_standing_water": True, "confidence": 0.9}
def cell_of(cid): return next(x for x in c.get("/risk", params={"day": 0}).json()["cells"] if x["cell_id"] == cid)
cid = risk.find_cell(*pt(1, 1))
before = cell_of(cid)
buf.seek(0)
t = c.post("/reports", files={"photo": ("p.jpg", buf.getvalue(), "image/jpeg")}, data={"lat": pt(1, 1)[0], "lng": pt(1, 1)[1]}).json()
after = cell_of(cid)
check("report raises risk and lists reports_nearby_N first", after["risk_score"] > before["risk_score"] and after["top_factors"][0].startswith("reports_nearby_"))
p = c.patch(f"/reports/{t['id']}", json={"status": "assigned", "assigned_to": "Team A"}).json()
check("PATCH assigned", p["status"] == "assigned" and p["assigned_to"] == "Team A")
c.patch(f"/reports/{t['id']}", json={"status": "cleared"})
check("clearing removes the report's effect", cell_of(cid)["risk_score"] == before["risk_score"])
check("PATCH unknown id -> 404 {error}", c.patch("/reports/nope", json={"status": "cleared"}).status_code == 404)
check("PATCH bad status -> 422 {error}", "error" in c.patch(f"/reports/{t['id']}", json={"status": "done"}).json())

# --- grid + OSM parsing ---
g = risk.load_grid()
check("find_cell inside / outside", risk.find_cell(_m["origin_lat"] + 0.0001, _m["origin_lng"] + 0.0001, g) == "A1" and risk.find_cell(10, 10, g) is None)
check("GeoJSON order is [lng, lat]", g["features"][0]["geometry"]["coordinates"][0][0][0] == _m["origin_lng"])
osm = {"elements": [{"type": "way", "center": {"lat": pt(1, 1)[0], "lon": pt(1, 1)[1]}, "tags": {"waterway": "drain"}},
                    {"type": "way", "center": {"lat": pt(8, 8)[0], "lon": pt(8, 8)[1]}, "tags": {"landuse": "construction"}}]}
feats = make_osm_features.features_from_overpass(osm, g)
check("OSM features parsed into cells", feats.get(risk.find_cell(*pt(1, 1), g)) == {"near_water_body": True})
risk._write("cell_features.json", feats)
risk.rebuild(risk._read("reports.json"))
check("near_water_body shows up in risk", "near_water_body" in cell_of(risk.find_cell(*pt(1, 1), g))["top_factors"])

print(f"\nALL {ok} CHECKS PASSED")
shutil.rmtree(tmp, ignore_errors=True)
