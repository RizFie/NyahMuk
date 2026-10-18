"""Run daily:  python make_risk_json.py
Fetches weather (Open-Meteo, free, no key) for the grid centre, caches it, and writes data/risk.json.
If the network fails it reuses the cached weather. With no cache it writes a neutral low-confidence map.
"""
import json
import sys
import urllib.parse
import urllib.request
from datetime import datetime

import risk


def fetch_weather(lat, lng):
    q = urllib.parse.urlencode({
        "latitude": lat, "longitude": lng, "timezone": "Asia/Kuala_Lumpur",
        "daily": "precipitation_sum,temperature_2m_mean", "hourly": "relative_humidity_2m",
        "past_days": 7, "forecast_days": 7})
    with urllib.request.urlopen("https://api.open-meteo.com/v1/forecast?" + q, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def load_reports():
    return risk._read("reports.json", [])


if __name__ == "__main__":
    m = risk.load_grid()["meta"]
    lat, lng = m["origin_lat"] + m["nrows"] * m["dlat"] / 2, m["origin_lng"] + m["ncols"] * m["dlng"] / 2
    try:
        weather = risk.parse_open_meteo(fetch_weather(lat, lng), datetime.now(risk.TZ))
        risk._write("weather_cache.json", weather)
        print("weather fetched:", len(weather["daily"]), "days")
    except Exception as e:
        print("WARNING: weather fetch failed:", e, file=sys.stderr)
    doc = risk.rebuild(load_reports())
    print("wrote data/risk.json | weather_ok =", doc["weather_ok"], "| generated_at", doc["generated_at"])
