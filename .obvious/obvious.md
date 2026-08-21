# Blood Bank Management System (BBMS) — Repo Guidance

Web platform for managing blood donations, hospital requests, and inventory tracking. Role-based access (admin / donor / hospital / blood-lab) with JWT auth.

## Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20 (ESM), Express 5, Mongoose 8, JWT (jsonwebtoken), bcryptjs, Swagger UI at `/api/doc` |
| Frontend | React 19, Vite 7, Tailwind CSS 4, react-router-dom 7, axios, react-hot-toast |
| Database | MongoDB (required) |
| Infra | Docker Compose (backend :3000→5000, frontend :80, mongo :27017) — optional; sandbox runs services directly |

## Commands

Run from repo root unless noted.

| Action | Command |
|---|---|
| Install backend deps | `cd backend && npm ci` |
| Install frontend deps | `cd frontend && npm ci` |
| Start MongoDB (no Docker) | one-liner in `.obvious/skills/local-dev/SKILL.md` (mongodb-memory-server, :27017) |
| Seed admin (first run) | `cd backend && node seedAdmin.js` |
| Start backend (dev) | `cd backend && npm start` → http://localhost:5000 (nodemon) |
| Start frontend (dev) | `cd frontend && npm run dev` → http://localhost:5173 |
| Backend tests | `cd backend && npm test` (vitest + in-memory Mongo — no running services needed) |
| Frontend lint | `cd frontend && npm run lint` |
| Frontend build | `cd frontend && npm run build` |
| Full stack via Docker | `docker compose up --build` (frontend :80, backend :3000) |

## Environment

`backend/.env` (from `backend/.env.example`; gitignored):
- `MONGO_URI` — e.g. `mongodb://127.0.0.1:27017/bbms`
- `JWT_SECRET` — any long random string for local dev
- `PORT` — default `5000`

`frontend/.env` (gitignored):
- `VITE_API_URL` — e.g. `http://localhost:5000` (unset = same-origin; set it when dev servers run split)
- `VITE_WEBSITE_NAME` — optional header site name

Seeded admin login: `suraj@admin.com` / `bbms@admin` (hardcoded in `backend/seedAdmin.js`).

## Codebase Map

See `.obvious/codebase-map.md`.

## Rules

- Meaningful commit messages; descriptive branch names (`feature-branch-name`) — see CONTRIBUTING.md
- Never push `.env` or secrets (already gitignored)
- Keep the `backend/` / `frontend/` separation
- Run `node seedAdmin.js` from `backend/` on first setup
- Backend CORS allows only origins `http://localhost:5173` and `:5174`

## Local Verification

> **Warning:** Full-repo checks are safe here (small repo, fast suite), but scoped commands are cheaper.

### Verified Commands
<!-- local-verification-summary:v1 -->
- **Typecheck command:** not_supported (no TypeScript / no tsc config in repo)
- **Lint command:** `cd frontend && npm run lint` | runs; 5 errors + 9 warnings are PRE-EXISTING in repo source — not new breakage
- **Test command:** `cd backend && npm test` | verified 2026-08-21 — 62/62 passed (4 files)
- **Scoped lint:** `cd frontend && npx eslint src/path/to/file.jsx` | supported
- **Scoped test:** `cd backend && npx vitest run tests/auth.test.js` | supported
- **Build command:** `cd frontend && npm run build` | verified 2026-08-21 — succeeds (chunk-size warning only)
- **Full-repo check safe:** yes
<!-- /local-verification-summary -->

### Primary Flow (verified 2026-08-21)
1. API: `POST /api/auth/login` (seeded admin) → 200 + JWT; `GET /api/auth/profile` with Bearer token → 200; wrong password → 401
2. UI (Playwright + headless Chromium): landing `/` renders BBMS branding → `/login` → admin login → redirect to `/admin`, JWT in localStorage, 0 console errors

## Sandbox Snapshot

- **Snapshot ID:** `s31f3xkqek037e09s16q:default`
- **Captured:** `2026-08-21T17:36:11.348Z`
- **Dev stack healthy:** yes — MongoDB :27017, backend :5000, frontend :5173 running and verified at capture time
- Restoring this snapshot reproduces the verified-healthy state.

## Setup Details

See `.obvious/skills/local-dev/SKILL.md` for the full from-scratch onboarding record (verified 2026-08-21).
