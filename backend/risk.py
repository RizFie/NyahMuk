"""Rule-based Aedes breeding-risk map (model_version "v0.1-rules").

NOT a trained model. The weights and thresholds below are ASSUMPTIONS from general
Aedes ecology (rain leaves standing water, warm and humid weather speeds up breeding).
They are not fitted to dengue data. Say this in the demo and in model_info.json.

Also holds find_cell(lat, lng) and the helpers that rebuild data/risk.json.
"""
import json
import os
import re
import statistics
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Asia/Kuala_Lumpur")
DATA_DIR = Path(os.getenv("NYAHMUK_DATA_DIR", Path(__file__).parent / "data"))
MODEL_VERSION = "v0.1-rules"
HORIZON_DAYS = 7

# ---- assumptions (tune here, one place) ----
RAIN_HIGH_MM = 40.0          # 7-day rain at or above this earns the factor code rain_last_7d_high
RAIN_MAX_MM = 80.0           # rain score saturates here
TEMP_OPTIMAL = (25.0, 32.0)  # deg C
RH_HIGH = 75.0               # percent
REPORT_DAYS = 14             # reports older than this stop counting
WEIGHTS = {"base": 0.10, "rain": 0.30, "temp": 0.10, "humidity": 0.10,
           "water": 0.10, "construction": 0.10}
REPORT_STEP, REPORT_MAX = 0.10, 0.30     # each nearby report adds 0.10, up to 0.30
LEVELS = (0.35, 0.60)                    # < 0.35 low, < 0.60 medium, else high


def _read(name, default=None):
    p = DATA_DIR / name
    if not p.exists():
        return default
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return default


def _write(name, obj):
    p = DATA_DIR / name
    tmp = p.with_suffix(p.suffix + ".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, allow_nan=False), encoding="utf-8")
    tmp.replace(p)


def now_iso():
    return datetime.now(TZ).isoformat(timespec="seconds")


# ---------- grid helpers ----------
def col_label(i):
    s = ""
    while True:
        i, r = divmod(i, 26)
        s = chr(65 + r) + s
        if i == 0:
            return s
        i -= 1


def label_to_col(s):
    n = 0
    for ch in s:
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def load_grid():
    g = _read("grid.geojson")
    if not g:
        raise FileNotFoundError("data/grid.geojson missing. Run: python make_grid.py")
    return g


def find_cell(lat, lng, grid=None):
    """Return cell_id such as "A12", or None if the point is outside the grid."""
    m = (grid or load_grid())["meta"]
    col = int((lng - m["origin_lng"]) // m["dlng"])
    row = int((lat - m["origin_lat"]) // m["dlat"])
    if 0 <= col < m["ncols"] and 0 <= row < m["nrows"]:
        return f"{col_label(col)}{row + 1}"
    return None


def cell_rc(cell_id):
    m = re.fullmatch(r"([A-Z]+)(\d+)", cell_id or "")
    return (label_to_col(m.group(1)), int(m.group(2)) - 1) if m else None


# ---------- weather ----------
def parse_open_meteo(js, today):
    """Turn an Open-Meteo response into {"today_index": i, "daily": [{date, precip, temp, rh}]}."""
    d = js["daily"]
    rh_by_day = {}
    for t, v in zip(js.get("hourly", {}).get("time", []), js.get("hourly", {}).get("relative_humidity_2m", [])):
        if v is not None:
            rh_by_day.setdefault(t[:10], []).append(v)
    daily = []
    for i, day in enumerate(d["time"]):
        rhs = rh_by_day.get(day)
        daily.append({"date": day,
                      "precip": d["precipitation_sum"][i],
                      "temp": d["temperature_2m_mean"][i],
                      "rh": round(sum(rhs) / len(rhs), 1) if rhs else None})
    today_s = today.strftime("%Y-%m-%d")
    idx = next((i for i, x in enumerate(daily) if x["date"] == today_s), min(7, len(daily) - 1))
    return {"fetched_at": now_iso(), "today_index": idx, "daily": daily}


def _weather_for_day(weather, d):
    if not weather or not weather.get("daily"):
        return None
    daily, i = weather["daily"], weather.get("today_index", 7) + d
    if i >= len(daily):
        return None
    window = daily[max(0, i - 6): i + 1]
    rains = [x["precip"] for x in window if x.get("precip") is not None]
    temps = [x["temp"] for x in daily[max(0, i - 1): i + 1] if x.get("temp") is not None]
    rhs = [x["rh"] for x in daily[max(0, i - 2): i + 1] if x.get("rh") is not None]
    return {"rain7": sum(rains) if rains else None,
            "temp": statistics.mean(temps) if temps else None,
            "rh": statistics.mean(rhs) if rhs else None}


# ---------- scoring ----------
def _counted_reports(reports, now):
    out = []
    for r in reports:
        if r.get("status") == "cleared":
            continue
        try:
            age = now - datetime.fromisoformat(r["created_at"])
        except (KeyError, ValueError):
            continue
        ai = r.get("ai_check") or {}
        suspicious = ai.get("is_standing_water") or ai.get("label") not in (None, "none", "unknown")
        rc = cell_rc(r.get("cell_id"))
        if age <= timedelta(days=REPORT_DAYS) and suspicious and rc:
            out.append(rc)
    return out


def _level(score):
    return "low" if score < LEVELS[0] else "medium" if score < LEVELS[1] else "high"


def build_risk(grid, weather, features, reports, now=None):
    """Return the full risk document for days 0..6."""
    now = now or datetime.now(TZ)
    report_rcs = _counted_reports(reports, now)
    days = {}
    for d in range(HORIZON_DAYS):
        wx = _weather_for_day(weather, d)
        cells = []
        for f in grid["features"]:
            cid = f["properties"]["cell_id"]
            col, row = cell_rc(cid)
            parts, codes = {"base": WEIGHTS["base"]}, []
            if wx and wx["rain7"] is not None:
                parts["rain"] = WEIGHTS["rain"] * min(wx["rain7"] / RAIN_MAX_MM, 1.0)
                if wx["rain7"] >= RAIN_HIGH_MM:
                    codes.append(("rain_last_7d_high", parts["rain"]))
            if wx and wx["temp"] is not None and TEMP_OPTIMAL[0] <= wx["temp"] <= TEMP_OPTIMAL[1]:
                parts["temp"] = WEIGHTS["temp"]; codes.append(("temp_optimal", parts["temp"]))
            if wx and wx["rh"] is not None and wx["rh"] >= RH_HIGH:
                parts["humidity"] = WEIGHTS["humidity"]; codes.append(("humidity_high", parts["humidity"]))
            ft = (features or {}).get(cid, {})
            if ft.get("near_water_body"):
                parts["water"] = WEIGHTS["water"]; codes.append(("near_water_body", parts["water"] + 1))
            if ft.get("near_construction_site"):
                parts["construction"] = WEIGHTS["construction"]; codes.append(("near_construction_site", parts["construction"] + 1))
            n = sum(1 for (c, r) in report_rcs if abs(c - col) <= 1 and abs(r - row) <= 1)
            if n:
                parts["reports"] = min(REPORT_STEP * n, REPORT_MAX); codes.append((f"reports_nearby_{n}", parts["reports"] + 2))
            score = round(min(sum(parts.values()), 1.0), 2)
            # confidence never goes above "medium": the rules have not been validated yet
            has_data = bool(wx) or bool(ft) or n > 0
            confidence = "medium" if (has_data and (wx is not None) and d <= 3) or n > 0 else "low"
            # local factors (reports, nearby water/construction) are listed before weather factors,
            # because weather applies to every cell and does not explain why THIS cell stands out
            codes.sort(key=lambda x: -x[1])
            cells.append({"cell_id": cid, "geometry": f["geometry"], "risk_score": score,
                          "risk_level": _level(score), "top_factors": [c for c, _ in codes[:3]],
                          "confidence": confidence})
        days[str(d)] = cells
    return {"generated_at": now_iso(), "horizon_days": HORIZON_DAYS, "model_version": MODEL_VERSION,
            "weather_ok": bool(weather), "days": days}


def rebuild(reports):
    """Recompute data/risk.json from cached weather + features + the given reports."""
    doc = build_risk(load_grid(), _read("weather_cache.json"), _read("cell_features.json", {}), reports)
    _write("risk.json", doc)
    return doc


def load_risk(reports_loader):
    doc = _read("risk.json")
    return doc if doc else rebuild(reports_loader())
