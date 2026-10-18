# NyahMuk backend (FastAPI)

## Run it (laptop, CPU is fine)
```
cd backend
python -m venv .venv && .venv\Scripts\activate        # Windows  (Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt
python make_grid.py          # defaults = Bandar Bukit Raja, Klang. Other area: --lat <SW lat> --lng <SW lng> --cols 12 --rows 12 --cell 0.005
python make_risk_json.py                                # needs internet (Open-Meteo); run daily
uvicorn main:app --reload --port 8000
```
Open http://localhost:8000/docs to try every endpoint. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in the frontend.

## Put the models here (not in git)
- `models/model1_best.pt`        <- Drive: runs/model1_vistext_det_v1/weights/best.pt
- `models/model2_water_best.pt`  <- Drive: runs/model2_water_only_v2/weights/best.pt
Without them the API still works; reports get `label: "unknown"`.

## Tune the thresholds on your own photos
`python evaluate_my_photos.py --photos ../my_photos`, then set `NYAHMUK_CONF_WATER` / `NYAHMUK_CONF_OBJECT`, and fill the
"Malaysian photo test" line in `data/model_info.json`.

## Optional: mark cells near water / construction (OpenStreetMap)
`python make_osm_features.py` (needs internet, run once).

## Self-test (no models, no internet)
`python test_backend.py`

## How the risk score works (v0.1-rules, NOT trained)
score = 0.10 base + rain (up to 0.30, 7-day rain, full at 80 mm) + 0.10 temp 25-32 C + 0.10 humidity >= 75%
+ 0.10 near water + 0.10 near construction + 0.10 per nearby report (max 0.30). low < 0.35 <= medium < 0.60 <= high.
Nearby = same cell or the 8 neighbours, reports from the last 14 days, not cleared, AI saw water or an object.
All weights are in risk.py (top of file). They are assumptions, not fitted. Confidence is never above "medium".

## Files
main.py (API) | risk.py (scoring + find_cell) | photo_check.py (the two YOLO models) | make_risk_json.py (daily job)
make_grid.py | make_osm_features.py | evaluate_my_photos.py | test_backend.py | data/ | uploads/ | models/ | notebooks/
