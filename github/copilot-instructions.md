# NyahMuk frontend rules
- Stack: Next.js (App Router) + TypeScript + Tailwind CSS. No component library (no shadcn). react-leaflet + Leaflet (OpenStreetMap) loaded with next/dynamic and ssr:false. TanStack Query for fetching.
- Design source of truth: docs/design-reference/index.html, nyahMuk_report.html, style.css. Match it exactly. Dark theme only.
- API contract: README.md, section "API contract". Never change response shapes. Types live in frontend/lib/types.ts.
- Report id is a string like "r_1a2b3c4d". cell_id looks like "A1". photo_url is a full URL (prefix the API base if it starts with "/").
- API base URL from NEXT_PUBLIC_API_BASE_URL. If empty, use mock route handlers under app/api.
- Township: Bandar Bukit Raja, map centre lat 3.0874, lng 101.4334 (lib/config.ts). Grid: 12x12 cells of 0.005 degrees from lat 3.0574, lng 101.4034, ids A1 to L12.
- AI result wording: "possible breeding site", never "larvae".
- Mobile-first. Breakpoints 1100px and 680px as in style.css. Add loading, empty and error states.
- Work only inside frontend/. Run `npm run build` after changes and fix errors.