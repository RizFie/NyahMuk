# NyahMuk: Prediction and Prevention of Mosquitoes

A web platform that predicts mosquito breeding hotspots in a township, lets residents report possible breeding sites with a photo and GPS, and gives management a prioritised action list.

Built for the Sime Darby Property University Hackathon 2026, "Township of Tomorrow".
Proposed track: People, Community wellbeing (confirm before submission).

## Team

| Role | Name | Works in |
|---|---|---|
| Frontend + integration | [name] | `frontend/` |
| ML + backend | [name] | `backend/` |
| Research, survey, pitch | [names] | `docs/` |

## Folder structure

```
nyahmuk/
├── README.md              # this file: the plan and the API contract
├── .gitignore
├── docs/
│   └── ai-usage-log.md    # hackathon T&C: log every AI tool we use
│
├── frontend/              # Next.js app
│   ├── app/
│   │   ├── page.tsx           # dashboard: risk map, priority areas, reports table (home)
│   │   ├── report/page.tsx    # citizen report form
│   │   ├── about-model/page.tsx
│   │   └── api/               # mock API (used when NEXT_PUBLIC_API_MODE is not "real")
│   ├── components/        # RiskMap, ReportForm, Navbar, etc.
│   ├── lib/
│   │   ├── api.ts             # functions that call the backend
│   │   ├── types.ts           # types matching the API contract below
│   │   ├── config.ts, risk.ts, time.ts  # township + map centre, risk colours and factor text, relative time
│   │   └── mock-data.ts       # fake data for the mock API
│   ├── public/
│   └── .env.local.example     # NEXT_PUBLIC_API_MODE=real, BACKEND_URL=http://localhost:8000
│
└── backend/               # Python FastAPI, kept deliberately small
    ├── main.py                # the whole API (5 endpoints)
    ├── risk.py                # rule-based risk scoring, find_cell(lat, lng), rebuilds data/risk.json
    ├── photo_check.py         # check_photo(path) -> label, is_standing_water, confidence (YOLO models)
    ├── make_grid.py           # run once: creates data/grid.geojson
    ├── make_risk_json.py      # run daily: fetches weather, caches it, rebuilds data/risk.json
    ├── make_osm_features.py   # optional, run once: marks cells near water or construction (OpenStreetMap)
    ├── evaluate_my_photos.py  # tests the photo models on our own photos and helps pick thresholds
    ├── test_backend.py        # self-test, needs no models or internet
    ├── requirements.txt
    ├── models/                # model1_best.pt, model2_water_best.pt (not in git)
    ├── data/
    │   ├── grid.geojson           # township grid (from make_grid.py)
    │   ├── weather_cache.json     # last weather fetch
    │   ├── cell_features.json     # optional, from make_osm_features.py
    │   ├── risk.json              # precomputed predictions, days 0 to 6
    │   ├── model_info.json        # version, data sources, measured metrics
    │   └── reports.json           # citizen reports (written by the API)
    ├── uploads/               # report photos (not in git)
    └── notebooks/             # training and experiments
```

How it fits together: `make_grid.py` creates the grid once. `make_risk_json.py` fetches and caches the weather, and `risk.py` turns weather, nearby places and citizen reports into `data/risk.json` -> `main.py` serves it -> the frontend draws it on a map. A new report goes the other way: the frontend uploads a photo -> `photo_check.py` labels it -> the API saves it to `reports.json` (with its `cell_id`) and rebuilds the map straight away from the cached weather, so no internet call is needed. Status changes (assigned, cleared) rebuild it too. There is no database. The API reads and writes JSON files.

## API contract (the single source of truth)

Both sides build to these shapes. Tell each other before changing anything, then update `frontend/lib/types.ts` and `backend/main.py` to match.

**`GET /risk?day=0..6`**
```json
{
  "generated_at": "2026-10-15T06:00:00+08:00",
  "day": 0,
  "horizon_days": 7,
  "model_version": "v0.1-rules",
  "cells": [
    {
      "cell_id": "A12",
      "geometry": { "type": "Polygon", "coordinates": [[[101.1,4.2],[101.1,4.21],[101.11,4.21],[101.11,4.2],[101.1,4.2]]] },
      "risk_score": 0.82,
      "risk_level": "high",
      "top_factors": ["rain_last_7d_high", "reports_nearby_2"],
      "confidence": "medium"
    }
  ]
}
```
- `risk_level`: `low`, `medium` or `high`. `confidence`: `low`, `medium` or `high`.
- Factor codes: `rain_last_7d_high`, `temp_optimal`, `humidity_high`, `reports_nearby_N`. (`near_water_body` and `near_construction_site` only appear after `make_osm_features.py` has been run.)
- Always return all cells. A cell with no data is low risk with low confidence.

**`GET /model-info`**: `{ model_version, last_trained, data_sources: [], metrics: [{ name, value, note }] }`

**`GET /reports`**: `[{ id, lat, lng, photo_url, note, location_label?, created_at, status, assigned_to, ai_check: { label, is_standing_water, confidence }, cell_id }]`
- `status`: `new`, `assigned` or `cleared`.
- `id` is a string like `"r_1a2b3c4d"`, not a number. `photo_url` is a full URL. `cell_id` looks like `"A1"` (column letters, then row number).
- `ai_check.label` is one of `tyre`, `drain`, `flowerpot`, `bottle`, `coconut_shell`, `none` or `unknown`. `is_standing_water` is `true` when the water model sees water. `confidence` is a number from 0 to 1 for the label (or for the water when the label is `none`). Both models only say "possible breeding site", never "larvae found".
- A report counts toward risk when it is not `cleared`, is under 14 days old, has a `cell_id`, and the photo check found water or an object (`label` is not `none` or `unknown`). It raises the risk of its own cell and the cells around it.
- `location_label` is optional. If it is missing, the frontend shows "Cell A12".

**`POST /reports`** (multipart: `photo`, `lat`, `lng`, optional `note`): returns the created report.

**`PATCH /reports/{id}`** (JSON: `{ status, assigned_to? }`): returns the updated report.

Rules: GeoJSON coordinates are `[lng, lat]`. Timestamps include a timezone (`+08:00`). No `NaN` in JSON. Errors look like `{ "error": "message" }`.

## Run it locally

**Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python make_grid.py               # once: creates data/grid.geojson
python make_risk_json.py          # fetches weather and builds data/risk.json
uvicorn main:app --reload --port 8000
```
Optional: `python make_osm_features.py` (marks cells near water or construction) and `python test_backend.py` (self-test, needs no models or internet). Put the model weights in `backend/models/` first, or `check_photo` returns the label `unknown`.
Open http://localhost:8000/docs to see and test the API.

**Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local   # real backend by default; delete NEXT_PUBLIC_API_MODE to use the mock API
npm run dev
```
Open http://localhost:3000.

To use the real backend, set `NEXT_PUBLIC_API_MODE=real` and `BACKEND_URL=http://localhost:8000` in `frontend/.env.local`, then rebuild.

**How the frontend reaches the backend**
- `frontend/.env.local` has two settings: `NEXT_PUBLIC_API_MODE=real` and `BACKEND_URL=http://localhost:8000` (the backend's address as seen by the Next.js server). Delete `NEXT_PUBLIC_API_MODE` to use the built-in mock API instead.
- In real mode the browser calls the frontend's own `/backend/...` and `next.config` forwards it to `${BACKEND_URL}/...`. In mock mode it calls `/api/...`, which are the mock handlers under `app/api`. The two paths never overlap.
- A footer badge shows "API: real" or "API: mock". If it says mock, the data is not coming from the backend.
- The setting is read at build time, so run `npm run build` again after changing it.

**Testing on a phone (same Wi-Fi)**
- Run `npm run build && npm run start` (not `npm run dev`, which is slow and can hang on phones) and open `http://<laptop-IP>:3000`. The phone only needs to reach the frontend (port 3000).
- Check that it really reaches the backend: the footer badge says "API: real", `http://localhost:3000/backend/risk?day=0` matches `http://localhost:8000/risk?day=0`, and a report submitted from the phone appears at `http://localhost:8000/reports`.
- Report photos must be shown through `/backend/uploads/...`, not `http://localhost:8000/...`, or they will not load on the phone.
- Phones only give GPS to HTTPS pages, so over plain HTTP use the tap-to-drop-pin fallback on `/report`. HTTPS is on hold for now.

### `backend/requirements.txt`

Python 3.11 is a safe version to use.

```
fastapi
uvicorn[standard]
python-multipart      # photo uploads
pillow                # reads and re-saves report photos
ultralytics           # runs the two YOLO photo models (installs PyTorch, a large download)
# httpx               # only needed to run test_backend.py
```

Once everything works on the ML engineer's machine, run `pip freeze > requirements.txt` to lock the exact versions.

Tips:
- `ultralytics` and PyTorch are big. Free hosting tiers may not have enough memory, so test early. If it doesn't fit, run the backend from a laptop for the demo, or use a host with more memory.
- When deployed behind a proxy (Render, Railway), start uvicorn with `--proxy-headers --forwarded-allow-ips="*"`. Otherwise photo URLs come back as `http://` and an `https://` frontend will refuse to load them.

## Build order

1. **Backend:** get a "hello world" API running, then make `GET /risk` return a hand-written sample file and share the URL. This unblocks the frontend.
2. **Frontend:** map with mock data, then legend, cell pop-up and day slider.
3. **Backend:** reports endpoints, then the photo check.
4. **Frontend:** report form and dashboard.
5. **Backend:** run `make_risk_json.py` daily for fresh weather. The API rebuilds the map by itself after every new report or status change.
6. **Everyone:** test on a phone, record a backup demo video, rehearse the pitch.

## Status and open items

Update this table whenever something changes. It is how the two sides see what the other is waiting for.

**Frontend (done)**

| Item | Status |
|---|---|
| Stages 1 to 4: shell, risk map, report form, about page, real backend hookup | Done |
| Mobile fixes: Clear form, "Reports" nav freeze, cross-origin dev access | Done |
| Real backend connection through the `/backend` proxy, with the "API: real / mock" badge | Verified on the laptop. Phone re-test of report upload and photos still to do |
| HTTPS so phones can give GPS automatically | On hold (tap-to-drop-pin works) |
| Final check against the design at 1280px, 768px, 375px, then `frontend/README.md` | To do |

**Waiting on backend (in priority order)**

| # | Item | Why it matters |
|---|---|---|
| 1 | Share `models/model1_best.pt` and `models/model2_water_best.pt` (not in git, so use Drive or USB) and run `pip install ultralytics` | Without them every photo returns `unknown`, so the frontend can't show real AI results or reports raising the map |
| 2 | In `risk.py` set `LEVELS = (0.35, 0.65)`, then rerun `python make_risk_json.py` and `python test_backend.py` | 7-day rain was 103 mm, so weather alone gives every cell 0.60 and the whole map is "high". With the change, weather alone caps at "medium" and "high" needs local evidence |
| 3 | Run `evaluate_my_photos.py` on our own Malaysian photos, set `NYAHMUK_CONF_OBJECT` and `NYAHMUK_CONF_WATER`, and put the measured results in `data/model_info.json` | Real numbers are our best evidence. Only put measured results there |
| 4 | Commit `data/grid.geojson`, `data/model_info.json` and `data/reports.json`. Label the 3 sample reports as demo data, or remove them (and update `test_backend.py`) | The T&C ban misleading information, and sample reports raise risk scores |
| 5 | Write the model and dataset sources and licences in `docs/ai-usage-log.md` (Ultralytics is AGPL-3.0 as far as I know; check with the lecturer) | T&C: AI-use disclosure and rights warranties |
| 6 | Demo-day runbook: start command, and run `make_risk_json.py` that morning for fresh weather | Avoids surprises on the day |
| 7 | Optional: run `make_osm_features.py` and check it doesn't flag too many cells | Makes `near_water_body` and `near_construction_site` informative |

**Everyone**

- Test the whole flow on a phone, record a backup demo video, and rehearse the pitch.

## Git rules for the team

- `main` must always run. Never push broken code to it.
- Work on your own branch (`git checkout -b frontend-map`) and merge into `main` when it works.
- Only edit files in your own folder. If you need a change elsewhere, ask.
- `git pull` before you start. Commit small and often: `git add . && git commit -m "what you did" && git push`.

## Do not commit

Add this to `.gitignore`:
```
node_modules/
.next/
.env
.env.local
__pycache__/
venv/
backend/uploads/
my_photos/
my_photos_eval.csv
notebooks/data/
*.pt
*.ckpt
.DS_Store
```
Also keep out of the repo: the raw survey CSV (it has contact details), API keys, and photos of people's faces. Only aggregated survey results belong in the proposal.

## Hackathon rules to remember (from the T&C)

- **Log every AI tool you use** in `docs/ai-usage-log.md`: which tool, what for, and the date. Material AI use must be disclosed.
- **Build from scratch.** Do not reuse code from earlier projects or coursework. List the open-source libraries used.
- **SDP owns the submission and everything developed for it.** Check with your lecturer about IP before registering.
- **List every pretrained model, dataset and library with its licence** in `docs/ai-usage-log.md`. Ultralytics YOLO is AGPL-3.0 as far as I know, so check it with your lecturer or the organisers.
- **Only put measured numbers in the proposal.** Mark assumptions as assumptions, and label any sample reports as demo data.
- **Present yourselves as students on a course project**, not as representatives of Sime Darby Property.

## Key dates

- 21 Oct 2026: registration closes
- 23 Oct 2026: proposal submission
- 24 to 28 Oct 2026: judging, Top 10 announced 28 Oct
- 2 to 6 Nov: mentoring sprint (Top 10 only)
- 11 Nov: final submission; 14 Nov: Top 10 pitch day
- 3 Dec: final presentation and awards