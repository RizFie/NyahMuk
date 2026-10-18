"""
NyahMuk: build mosquito risk predictions.
Run:  python make_risk_json.py
Writes: data/risk.json (7 days) and data/model_info.json

v0.1 = transparent rule-based index. All weights and thresholds are ASSUMPTIONS,
not measured results. Do not claim accuracy until validated.

Inputs: weather (Open-Meteo) + citizen reports (data/reports.json, written by the API
after the photo check). Residents never choose a site type: the AI photo check does.
"""
import json
import math
import datetime as dt
from pathlib import Path

import requests

# ---------- Settings (edit these) ----------
CENTER_LAT, CENTER_LNG = 3.07, 101.52   # TODO: set to your township centre
GRID_N = 12                              # 12 x 12 cells
CELL_M = 150                             # cell size in metres
TZ = "Asia/Kuala_Lumpur"
NEAR_M = 200                             # a report counts for cells within this distance
REPORT_DAYS = 14                         # only recent reports count

# Assumed weights (sum to 1.0)
WEIGHTS = {"rain": 0.40, "temp": 0.20, "humidity": 0.15, "reports": 0.25}
LOW_MAX, MEDIUM_MAX = 0.35, 0.60         # assumed level thresholds

DATA = Path(__file__).parent / "data"
DATA.mkdir(exist_ok=True)


# ---------- Helpers ----------
def clip(x):
    return max(0.0, min(1.0, x))


def dist_m(lat1, lng1, lat2, lng2):
    dy = (lat2 - lat1) * 111_320
    dx = (lng2 - lng1) * 111_320 * math.cos(math.radians(lat1))
    return math.hypot(dx, dy)


def build_grid():
    dlat = CELL_M / 111_320
    dlng = CELL_M / (111_320 * math.cos(math.radians(CENTER_LAT)))
    lat0 = CENTER_LAT - GRID_N / 2 * dlat
    lng0 = CENTER_LNG - GRID_N / 2 * dlng
    cells = []
    for r in range(GRID_N):
        for c in range(GRID_N):
            s, w = lat0 + r * dlat, lng0 + c * dlng
            n, e = s + dlat, w + dlng
            cells.append({
                "cell_id": f"{chr(65 + r)}{c + 1:02d}",
                # GeoJSON order is [lng, lat]
                "geometry": {"type": "Polygon",
                             "coordinates": [[[w, s], [e, s], [e, n], [w, n], [w, s]]]},
                "lat": (s + n) / 2,
                "lng": (w + e) / 2,
            })
    return cells


def load_reports():
    """Citizen reports saved by the API (data/reports.json). Empty list if none yet."""
    path = DATA / "reports.json"
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def get_weather():
    """Open-Meteo (free, no key): 7 past days + today + 6 forecast days."""
    params = {
        "latitude": CENTER_LAT, "longitude": CENTER_LNG, "timezone": TZ,
        "past_days": 7, "forecast_days": 7,
        "daily": "precipitation_sum,temperature_2m_mean",
        "hourly": "relative_humidity_2m",
    }
    j = requests.get("https://api.open-meteo.com/v1/forecast", params=params, timeout=30).json()
    days = j["daily"]["time"]                        # 14 dates; today is index 7
    rain = [x or 0 for x in j["daily"]["precipitation_sum"]]
    temp = j["daily"]["temperature_2m_mean"]
    hum_by_day = {}
    for t, h in zip(j["hourly"]["time"], j["hourly"]["relative_humidity_2m"]):
        if h is not None:
            hum_by_day.setdefault(t[:10], []).append(h)
    hum = [sum(hum_by_day[d]) / len(hum_by_day[d]) if d in hum_by_day else None for d in days]
    return days, rain, temp, hum


# ---------- Scoring ----------
def rain_score(rain7_mm):
    return clip(rain7_mm / 60)           # assumption: 60 mm in 7 days = "heavy"


def temp_score(t):
    if t is None:
        return 0.5
    if 26 <= t <= 32:                    # assumption: best breeding range
        return 1.0
    return clip((t - 20) / 6) if t < 26 else clip((38 - t) / 6)


def humidity_score(h):
    if h is None:
        return 0.5
    return clip((h - 50) / 30)           # assumption: 80%+ = favourable


def report_info(cell, reports, now):
    """Score from recent, still-open reports that the photo check flagged as standing
    water, within NEAR_M of the cell centre. Returns (score, number_of_reports)."""
    total, n = 0.0, 0
    for r in reports:
        if r.get("status") == "cleared":
            continue
        check = r.get("ai_check") or {}
        if not check.get("is_standing_water"):
            continue
        created = dt.datetime.fromisoformat(r["created_at"])
        if created.tzinfo is None:
            created = created.replace(tzinfo=now.tzinfo)
        if (now - created).days > REPORT_DAYS:
            continue
        if dist_m(cell["lat"], cell["lng"], r["lat"], r["lng"]) <= NEAR_M:
            total += check.get("confidence", 0.5)
            n += 1
    return clip(total / 3), n            # assumption: 3 confident reports nearby = maximum


def level(score):
    return "low" if score < LOW_MAX else ("medium" if score < MEDIUM_MAX else "high")


# ---------- Main ----------
def main():
    cells = build_grid()
    reports = load_reports()
    days, rain, temp, hum = get_weather()
    now_dt = dt.datetime.now(dt.timezone(dt.timedelta(hours=8)))
    now = now_dt.isoformat(timespec="seconds")

    # report score does not change by forecast day, so compute once per cell
    static = {c["cell_id"]: report_info(c, reports, now_dt) for c in cells}

    payloads = []
    for d in range(7):
        i = 7 + d                                    # index of this day in the weather arrays
        rain7 = sum(rain[i - 6:i + 1])               # rainfall over the 7 days ending that day
        rs, ts, hs = rain_score(rain7), temp_score(temp[i]), humidity_score(hum[i])

        out_cells = []
        for c in cells:
            rp, n_reports = static[c["cell_id"]]
            parts = {
                "rain_last_7d_high": (WEIGHTS["rain"] * rs, rs > 0.6),
                "temp_optimal": (WEIGHTS["temp"] * ts, ts > 0.8),
                "humidity_high": (WEIGHTS["humidity"] * hs, hs > 0.6),
            }
            if n_reports:
                parts[f"reports_nearby_{n_reports}"] = (WEIGHTS["reports"] * rp, True)
            score = round(WEIGHTS["rain"] * rs + WEIGHTS["temp"] * ts
                          + WEIGHTS["humidity"] * hs + WEIGHTS["reports"] * rp, 3)
            factors = sorted((k for k, (_, on) in parts.items() if on),
                             key=lambda k: parts[k][0], reverse=True)[:3]
            out_cells.append({
                "cell_id": c["cell_id"],
                "geometry": c["geometry"],
                "risk_score": score,
                "risk_level": level(score),
                "top_factors": factors,
                "confidence": "medium" if d <= 2 else "low",   # assumption: forecasts get less certain
            })
        payloads.append({
            "generated_at": now, "day": d, "horizon_days": 7,
            "model_version": "v0.2-rules", "cells": out_cells,
        })

    (DATA / "risk.json").write_text(json.dumps(payloads), encoding="utf-8")
    (DATA / "model_info.json").write_text(json.dumps({
        "model_version": "v0.2-rules",
        "last_trained": now,
        "data_sources": [
            "Open-Meteo weather (past 7 days and 7-day forecast)",
            "Citizen reports (photo + GPS) screened by an AI photo check",
        ],
        "metrics": [{
            "name": "Validation",
            "value": "Not yet validated",
            "note": "Rule-based risk index; weights and thresholds are assumptions.",
        }],
    }, indent=2), encoding="utf-8")

    counts = {}
    for c in payloads[0]["cells"]:
        counts[c["risk_level"]] = counts.get(c["risk_level"], 0) + 1
    print(f"Done. {len(reports)} reports loaded. Day 0 levels:", counts)


if __name__ == "__main__":
    main()