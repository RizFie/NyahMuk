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
    ├── risk.py            # risk scoring / ML code + find_cell(lat, lng)
    ├── photo_check.py     # check_photo(path) -> label, is_standing_water, confidence
    ├── make_risk_json.py  # run daily: writes data/risk.json
    ├── requirements.txt
    ├── data/
    │   ├── grid.geojson       # township grid cells
    │   ├── risk.json          # precomputed predictions, days 0 to 6
    │   ├── model_info.json    # version, data sources, metrics
    │   └── reports.json       # citizen reports (keep a few sample ones)
    ├── uploads/           # report photos (not in git)
    └── notebooks/         # training and experiments
```

How it fits together: `make_risk_json.py` builds `data/risk.json` -> `main.py` serves it -> the frontend draws it on a map. There is no database. The API reads and writes JSON files.

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
- Factor codes: `rain_last_7d_high`, `temp_optimal`, `humidity_high`, `near_water_body`, `near_construction_site`, `reports_nearby_N`.
- Always return all cells. A cell with no data is low risk with low confidence.

**`GET /model-info`**: `{ model_version, last_trained, data_sources: [], metrics: [{ name, value, note }] }`

**`GET /reports`**: `[{ id, lat, lng, photo_url, note, created_at, status, assigned_to, ai_check: { label, is_standing_water, confidence }, cell_id }]`
- `status`: `new`, `assigned` or `cleared`.

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

Starter `backend/requirements.txt`: `fastapi`, `uvicorn[standard]`, `python-multipart`, `requests`, `shapely`, `pillow`. Add `scikit-learn`, `lightgbm`, `torch` and `transformers` only when needed.

## Build order

1. **Backend:** get a "hello world" API running, then make `GET /risk` return a hand-written sample file and share the URL. This unblocks the frontend.
2. **Frontend:** map with mock data, then legend, cell pop-up and day slider.
3. **Backend:** reports endpoints, then the photo check.
4. **Frontend:** report form and dashboard.
5. **Backend:** replace sample `risk.json` with real output from `make_risk_json.py`.
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
- **Only put measured numbers in the proposal.** Mark assumptions as assumptions.
- **Present yourselves as students on a course project**, not as representatives of Sime Darby Property.

## Key dates

- 21 Oct 2026: registration closes
- 23 Oct 2026: proposal submission
- 24 to 28 Oct 2026: judging, Top 10 announced 28 Oct
- 2 to 6 Nov: mentoring sprint (Top 10 only)
- 11 Nov: final submission; 14 Nov: Top 10 pitch day
- 3 Dec: final presentation and awards
