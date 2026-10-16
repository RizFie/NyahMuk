# NyahMuk Frontend

Mosquito breeding-risk prediction and community reporting dashboard — built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** — utility-first styling, no component library
- **react-leaflet** + **Leaflet** — interactive risk map with OpenStreetMap tiles
- **@tanstack/react-query** — data fetching and cache management
- **next/font/google (Inter)** — optimised web font loading

## Getting Started

```bash
# Install dependencies
npm install

# Copy env example and configure (optional)
cp .env.local.example .env.local

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the backend API. Leave empty to use built-in mock API routes with demo data. |

## Folder Structure

```
frontend/
├── app/
│   ├── page.tsx                    # Dashboard (/)
│   ├── report/page.tsx             # Report a Breeding Site (/report)
│   ├── about-model/page.tsx        # About the Model (/about-model)
│   ├── layout.tsx                  # Root layout with font + providers
│   ├── globals.css                 # Tailwind import + Leaflet dark theme
│   └── api/                        # Mock API route handlers
│       ├── risk/route.ts           # GET /api/risk?day=0..6
│       ├── reports/route.ts        # GET/POST /api/reports
│       ├── reports/[id]/route.ts   # PATCH /api/reports/:id
│       └── model-info/route.ts     # GET /api/model-info
├── components/
│   ├── Topbar.tsx                  # Top navigation bar
│   ├── Sidebar.tsx                 # Desktop sidebar navigation
│   ├── StatCard.tsx                # Dashboard statistic card
│   ├── RiskMap.tsx                 # Dynamic Leaflet map wrapper
│   ├── RiskMapInner.tsx            # Leaflet map with risk grid + reports
│   ├── ReportMap.tsx               # Dynamic map for report GPS fallback
│   ├── ReportMapInner.tsx          # Clickable map for location selection
│   ├── Legend.tsx                  # Risk level legend
│   ├── DaySlider.tsx               # Day forecast selector
│   ├── PriorityList.tsx            # Priority areas list
│   ├── ReportsTable.tsx            # Community reports table with actions
│   ├── ReportForm.tsx              # Report submission form
│   ├── BottomNav.tsx               # Mobile bottom navigation
│   ├── StatusTag.tsx               # Status badge component
│   └── Providers.tsx               # TanStack Query provider
├── lib/
│   ├── api.ts                      # API client functions
│   ├── types.ts                    # TypeScript type definitions
│   ├── config.ts                   # App configuration constants
│   ├── risk.ts                     # Risk colours and factor labels
│   ├── time.ts                     # Relative time formatting
│   └── mock-data.ts                # In-memory mock data store
├── public/                         # Static assets
├── .env.local.example              # Environment variable template
└── package.json
```

## API Contract

### GET `/api/risk?day=0..6`
Returns predicted risk grid cells for the given day.

### GET `/api/reports`
Returns all community reports sorted by newest first.

### POST `/api/reports` (multipart)
Submit a new breeding site report with photo, GPS coordinates, and optional note.

### PATCH `/api/reports/:id`
Update a report's status (`assigned`, `cleared`) and optionally assign a team.

### GET `/api/model-info`
Returns model version, training date, data sources, and performance metrics.

## Open Source Libraries

- [Next.js](https://nextjs.org/) — MIT
- [React](https://react.dev/) — MIT
- [Tailwind CSS](https://tailwindcss.com/) — MIT
- [Leaflet](https://leafletjs.com/) — BSD-2-Clause
- [react-leaflet](https://react-leaflet.js.org/) — Hippocratic-2.1
- [TanStack Query](https://tanstack.com/query) — MIT

## License

University hackathon project — NyahMuk.
