# AI usage, provenance and licensing log

Last updated: 2026-10-23

## AI tools used

Material AI assistance must be disclosed. The project was built from scratch for this submission; no code was copied from earlier projects or coursework.

| Date | Tool | Use |
|---|---|---|
| 2026-10-23 | VS Code GitHub Copilot (Copilot SDK in VS Code) | Updated this disclosure log and checked the repository's documented models, datasets and dependencies. |
| 2026-10-22 | VS Code GitHub Copilot (Copilot SDK in VS Code) | Implemented the Resident view / Management view prototype, session-state switch, resident report filtering, and dashboard presentation changes. |
| 2026-10-22 | VS Code GitHub Copilot (Copilot SDK in VS Code) | Implemented the separate camera/gallery upload controls and verified the mobile file-input behaviour. |
| 2026-10-20 | VS Code GitHub Copilot (Copilot SDK in VS Code) | Implemented the EXIF-first photo-location flow, device-GPS fallback, dropped-pin map fallback, draggable marker and township warning. |
| 2026-10-20 to 2026-10-23 | Claude | Planning and discussing implementation and documentation requirements. No Claude-generated code is claimed as copied from another project. |
| Date not recorded | Google Antigravity | Initial conversion of the design references into the Next.js UI. The team must retain the tool history/output if the organisers request an audit. |

The dates above are the dates known from the project record. Any team member who used another AI tool must add it here before submission.

## Build and ownership declarations

- The application was built from scratch for this submission. The team did not intentionally reuse code from earlier projects or coursework.
- SDP owns the submission and everything developed for it, subject to the applicable hackathon and institutional terms.
- The team must check with the lecturer about intellectual-property ownership and rights before registering or submitting the project.
- The Resident view / Management view switch is a demo presentation switch, not authentication or access control. A real deployment needs login, role-based access control and server-side filtering.

## Open-source libraries and licences

These are the direct libraries declared in `frontend/package.json` and `backend/requirements.txt`. Transitive dependencies (including PyTorch installed by Ultralytics) must also be reviewed from the resolved lockfiles/environment before a public or commercial deployment.

| Library | Area | Licence / status |
|---|---|---|
| Next.js | Frontend | MIT |
| React and React DOM | Frontend | MIT |
| React Leaflet | Frontend | MIT |
| Leaflet | Frontend maps | BSD-2-Clause |
| TanStack React Query | Frontend data fetching | MIT |
| exifr | Frontend EXIF parsing | MIT |
| TypeScript | Build tooling | Apache-2.0 |
| Tailwind CSS | Frontend styling | MIT |
| ESLint and eslint-config-next | Frontend tooling | MIT |
| `@types/*` packages | Type declarations | Individual package licences; generally MIT, verify each resolved package |
| FastAPI | Backend | MIT |
| Uvicorn | Backend server | BSD-3-Clause |
| python-multipart | Backend uploads | Apache-2.0 |
| Pillow | Backend image handling | HPND licence |
| tzdata | Time-zone data | Apache-2.0 |
| httpx | Backend tests/HTTP | BSD-3-Clause |
| pi-heif | HEIF image support | BSD-3-Clause; verify the resolved release |
| Ultralytics | Backend YOLO inference/training | AGPL-3.0; confirm with the lecturer/organisers before registration or distribution |
| PyTorch | Installed/used through Ultralytics | BSD-3-Clause; verify the resolved version and its bundled components |

Licence names are recorded from the projects' published metadata as understood at the time of writing. Keep the package manifests, lockfiles and licence notices with the submission, and verify the exact resolved versions before release.

## Models and model-related provenance

| Model or component | Use | Licence / provenance status |
|---|---|---|
| `backend/models/model1_best.pt` (Model 1) | YOLO object detector for possible breeding-site objects | Team-provided trained weight; original training checkpoint/provenance and licence are not recorded in this repository. Confirm the training data rights, base-model terms and redistribution permission with the lecturer/organisers. |
| `backend/models/model2_water_best.pt` (Model 2) | YOLO detector for visible water/wet surfaces | Team-provided trained weight; original training checkpoint/provenance and licence are not recorded in this repository. Confirm the training data rights, base-model terms and redistribution permission with the lecturer/organisers. |
| Ultralytics YOLO runtime | Loads and runs the two weights | AGPL-3.0. This is a material compliance item; obtain lecturer/organiser advice before registering, distributing or deploying the project. |
| `backend/risk.py` rule-based risk score | Combines weather, map features and reports | Not a pretrained model and not a trained model. Its weights and thresholds are assumptions from general Aedes ecology, not measured validation. |

The current model information records these measured values:

- Model 1 mAP50: **0.917** on the stated VisText-Mosquito test split.
- Model 1 precision / recall: **0.872 / 0.880** on the stated test split.
- Model 2 mAP50: **0.225** on the stated Stagnant Water and Wet Surface test split.
- Malaysian photo test: **pending**, so no result is claimed.

These measurements are limited to the documented test splits and must not be presented as Malaysian deployment performance. Any proposal number not directly measured must be labelled **assumption**, **estimate**, or **demo data**.

## Datasets and other data sources

| Source | Use | Licence / status |
|---|---|---|
| VisText-Mosquito (Mendeley Data) | Training/test data for Model 1 | Licence is not recorded in this repository; verify the exact Mendeley record licence and attribution requirements before submission. |
| Stagnant Water and Wet Surface Dataset (Mendeley Data) | Training/test data for Model 2 | Licence is not recorded in this repository; verify the exact Mendeley record licence and attribution requirements before submission. |
| Open-Meteo | Rainfall, temperature and humidity inputs | Open-Meteo attribution/licence terms apply; verify the current terms and include attribution in deployment materials. |
| OpenStreetMap | Map features such as water bodies, drains and construction sites | OpenStreetMap data is generally available under the Open Database License (ODbL); provide required attribution and verify the source/extract terms. |
| Team's own Malaysian test photos | Local evaluation of the photo models | Team-owned or permission-based data only. Record consent and usage restrictions before publication. The evaluation result is currently pending. |
| Citizen reports submitted through the app | Demo/application inputs | Obtain consent and define retention/access rules before any real deployment. Do not treat demo records as representative research data. |
| `backend/data/grid.geojson`, `risk.json`, and mock report records | Prototype map and UI data | Generated or demo data. The three sample reports are **demo data**, not measured community reports, and must be labelled as such or removed for a final submission. |

## Proposal-number rule

Only measured numbers may appear in the proposal. The following are measured only where the source and test split are stated above. Rule-based risk weights, thresholds, expected impact, coverage, future performance, sample counts, and deployment claims are assumptions unless the team supplies a reproducible measurement; label them explicitly as **assumptions**. Any screenshots, sample reports or seeded records must be labelled **demo data**.

## Rights checklist before registration

1. Ask the lecturer to confirm whether SDP's ownership terms and the hackathon terms permit the proposed registration.
2. Confirm the AGPL-3.0 implications of Ultralytics YOLO for the intended submission and deployment.
3. Obtain and record the exact licences/attributions for both Mendeley datasets and the two trained weight files.
4. Review the resolved frontend and Python dependency licences, including transitive dependencies.
5. Confirm consent and retention rules for team photos and any future citizen reports.