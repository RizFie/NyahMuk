# NyahMuk: Prediction and Prevention of Mosquitoes

A web platform that predicts mosquito breeding hotspots in a township, lets residents report possible breeding sites with a photo and GPS, and gives management a prioritised action list.

Built for the Sime Darby Property University Hackathon 2026, "Township of Tomorrow".
Proposed track: People, Community wellbeing (confirm before submission).

## Frontend quick start

From `frontend/`:

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The local frontend uses
`NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` from `.env.local` by default.
Browser requests remain same-origin at `/api/*`; Next.js proxies them to the
configured backend. This avoids browser mixed-content/CORS issues when the
frontend is opened over HTTPS on a phone. To use the built-in mock handlers,
leave that variable empty. The mock routes are `/api/risk`,
`/api/model-info`, and `/api/reports`.

When testing from another device, bind the Next.js dev server to the host
machine's network interface and make sure the backend is running on the same
host. For example:

```bash
npm run dev -- --hostname 0.0.0.0
```

Build and serve the production app with:

```bash
npm run build
npm run start
```

Frontend libraries: Next.js App Router, React, TypeScript, Tailwind CSS v4,
`next/font` (Inter), TanStack Query, Leaflet, and react-leaflet.

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
│   │   ├── page.tsx           # risk map (home)
│   │   ├── report/page.tsx    # citizen report form
│   │   ├── dashboard/page.tsx # management action board
│   │   ├── about-model/page.tsx
│   │   └── api/               # mock API (used until the real backend is ready)
│   ├── components/        # RiskMap, ReportForm, Navbar, etc.
│   ├── lib/
│   │   ├── api.ts             # functions that call the backend
│   │   ├── types.ts           # types matching the API contract below
│   │   └── mock-data.ts       # fake data for the mock API
│   ├── public/
│   └── .env.local.example     # NEXT_PUBLIC_API_BASE_URL=
│
└── backend/               # Python FastAPI, kept deliberately small
    ├── main.py            # the whole API (about 5 endpoints)
    ├── photo_check.py     # check_photo(path) -> label, is_standing_water, confidence
    ├── make_risk_json.py  # builds the grid (build_grid), scores risk from weather + reports, writes data/risk.json
    ├── requirements.txt
    ├── data/
    │   ├── risk.json          # precomputed predictions, days 0 to 6
    │   ├── model_info.json    # version, data sources, metrics
    │   └── reports.json       # citizen reports (written by the API, read by make_risk_json.py)
    ├── uploads/           # report photos (not in git)
    └── notebooks/         # training and experiments
```

How it fits together: `make_risk_json.py` builds `data/risk.json` from weather and from the citizen reports in `data/reports.json` -> `main.py` serves it -> the frontend draws it on a map. A new report goes the other way: the frontend uploads a photo -> `photo_check.py` labels it -> the API saves it to `reports.json` (with its `cell_id`) -> `make_risk_json.py` is re-run so the map updates. There is no database. The API reads and writes JSON files.

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
- Factor codes: `rain_last_7d_high`, `temp_optimal`, `humidity_high`, `reports_nearby_N`. (`near_water_body` and `near_construction_site` are reserved for later and not produced yet.)
- Always return all cells. A cell with no data is low risk with low confidence.

**`GET /model-info`**: `{ model_version, last_trained, data_sources: [], metrics: [{ name, value, note }] }`

**`GET /reports`**: `[{ id, lat, lng, photo_url, note, location_label?, created_at, status, assigned_to, ai_check: { label, is_standing_water, confidence }, cell_id }]`
- `status`: `new`, `assigned` or `cleared`.
- `ai_check.confidence` is a number from 0 to 1. `is_standing_water` is `true` only when the photo check is confident enough to count the report.
- `make_risk_json.py` reads `status`, `created_at`, `lat`, `lng`, `ai_check.is_standing_water` and `ai_check.confidence` from `data/reports.json`, so keep those names and types exactly. `created_at` must include a timezone. `cell_id` comes from `build_grid()` in `make_risk_json.py` plus shapely (point in polygon).
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
python make_risk_json.py          # builds data/risk.json (needed before the first run)
uvicorn main:app --reload
```
Open http://localhost:8000/docs to see and test the API.

**Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local   # leave the API URL empty to use the mock API
npm run dev
```
Open http://localhost:3000.

To use the real backend, set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in `frontend/.env.local`.

### `backend/requirements.txt`

Start with this. Python 3.11 is a safe version to use for everything below.

```
# --- Core API (needed from day 1) ---
fastapi
uvicorn[standard]
python-multipart      # lets the API accept photo uploads
requests              # calls the Open-Meteo weather API
pillow                # opens and saves report photos
shapely               # finds which grid cell a GPS point is in

# --- Risk scoring (add when you start make_risk_json.py) ---
pandas
numpy

# --- Photo check (add when you start photo_check.py) ---
# torch               # large download: install the CPU version on a laptop
# transformers        # loads the CLIP model from Hugging Face
# scikit-learn        # linear probe on CLIP embeddings

# --- Only if training on dengue data (notebooks) ---
# lightgbm
# matplotlib
# jupyter
```

Uncomment a section only when you need it, then run `pip install -r requirements.txt` again.

Tips:
- Once everything works on the ML engineer's machine, run `pip freeze > requirements.txt` to lock the exact versions, so it installs the same way for everyone and on the hosting service.
- `torch` and `transformers` are big (several GB with the model). Free hosting tiers may not have enough memory to run them, so test early. If it doesn't fit, run the photo check on a host with more memory (Hugging Face Spaces has more on its free tier, as far as I know) or run the backend from a laptop for the demo.
- `osmnx` (OpenStreetMap data) is deliberately left out because it pulls in many heavy dependencies. Run it once in a notebook, save the water-body and construction-site locations to `data/`, and let the API read the saved file.

## Build order

1. **Backend:** get a "hello world" API running, then make `GET /risk` return a hand-written sample file and share the URL. This unblocks the frontend.
2. **Frontend:** map with mock data, then legend, cell pop-up and day slider.
3. **Backend:** reports endpoints, then the photo check.
4. **Frontend:** report form and dashboard.
5. **Backend:** replace sample `risk.json` with real output from `make_risk_json.py`, and re-run it (from the API, as a background task) after every new report or status change so the map reflects it.
6. **Everyone:** test on a phone, record a backup demo video, rehearse the pitch.

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
- **Only put measured numbers in the proposal.** Mark assumptions as assumptions, and label any sample reports as demo data.
- **Present yourselves as students on a course project**, not as representatives of Sime Darby Property.

## Key dates

- 21 Oct 2026: registration closes
- 23 Oct 2026: proposal submission
- 24 to 28 Oct 2026: judging, Top 10 announced 28 Oct
- 2 to 6 Nov: mentoring sprint (Top 10 only)
- 11 Nov: final submission; 14 Nov: Top 10 pitch day
- 3 Dec: final presentation and awards