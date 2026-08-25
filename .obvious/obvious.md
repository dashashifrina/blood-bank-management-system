# Repo guidance — blood-bank-management-system (BBMS)

Full-stack blood bank management app: Express/MongoDB API + React/Vite SPA with role-based dashboards (Admin, Donor, Hospital, Blood Lab, Facility).

## Stack

| Layer | Tech | Port (local dev) |
|---|---|---|
| Backend API | Node.js 20, Express 5, Mongoose 8, JWT auth, Swagger UI | 5000 |
| Frontend | React 19, Vite 7, Tailwind CSS 4, React Router 7 | 5173 |
| Database | MongoDB 8.x (local `mongod`, db `bbms`) | 27017 |

## Commands

```bash
# Backend (from backend/)
npm install
node seedAdmin.js        # first time only — creates admin suraj@admin.com / bbms@admin
npm start                # nodemon server.js → http://localhost:5000

# Frontend (from frontend/)
npm install
npm run dev              # vite → http://localhost:5173
npm run build            # production build (dist/)
npm run lint             # eslint

# Tests (from backend/)
npm test                 # vitest — 62 tests, uses mongodb-memory-server (no external DB needed)
```

Swagger UI: http://localhost:5000/api/doc/

## Codebase Map

See `.obvious/codebase-map.md`.

## Rules

<!-- synthesized from: README.md, CONTRIBUTING.md — agent-relevant rules only -->

- **Commit messages:** Use meaningful commit messages (see CONTRIBUTING.md)
- **Branch naming:** Use descriptive feature branch names (`feature-branch-name`)
- **No secrets:** Never push `.env` or sensitive data to git
- **Folder structure:** Follow the existing `backend/` and `frontend/` separation
- **Code quality:** Write clean, readable code; add comments where needed
- **PR descriptions:** Write PR descriptions clearly
- **Stack:** Backend = Node.js/Express/MongoDB; Frontend = React/Vite/Tailwind
- **Docker:** `docker compose up --build` is the README-recommended path when Docker is available (frontend :80 → backend :3000); the sandbox has no Docker — use the native procedure in `.obvious/skills/local-dev/SKILL.md`
- **Admin seed:** Run `node seedAdmin.js` from `backend/` on first setup to create the admin user
- **Frontend env:** `frontend/.env` must set `VITE_API_URL=http://localhost:5000` — without it the SPA calls same-origin `/api/*` on the Vite server and every login fails with 404

## Local Verification

> **Warning:** Running full-repo typecheck, lint, or tests may OOM or timeout in the sandbox for large repos.
> Use the scoped commands below when verifying changes.

### Verified Commands

<!-- local-verification-summary:v1 -->
- **Typecheck command:** not_applicable (no TypeScript in repo — plain JS + JSX)
- **Lint command:** `cd frontend && npx eslint .` | verified (exits 0; 5 errors + 9 warnings, all pre-existing)
- **Test command:** `cd backend && npm test` | verified (vitest, 4 files, 62/62 passed, ~7s, self-contained via mongodb-memory-server)
- **Build command:** `cd frontend && npm run build` | verified (Vite build succeeds in ~3s; >500 kB chunk warning is pre-existing)
- **Scoped typecheck:** not_supported
- **Scoped lint:** `cd frontend && npx eslint src/path/to/file.jsx` | supported
- **Scoped test:** `cd backend && npx vitest run tests/auth.test.js` | supported
- **Full-repo check safe:** yes — small repo, suite is fast
<!-- /local-verification-summary -->

### Scoped Workflow

Run these commands to verify changed files without triggering a full-repo scan:

1. **Lint changed files:** `cd frontend && npx eslint <path/to/changed/file.jsx>`
2. **Test changed domain:** `cd backend && npx vitest run tests/<domain>.test.js`

## Sandbox Snapshot

- **Snapshot ID:** `s6tmh4urdg6nm9cjl678:default`
- **Captured:** `2026-08-25T17:40:24.027Z`
- **Dev stack healthy:** yes — MongoDB :27017, backend :5000, Vite :5173 all verified responding; admin login flow exercised end-to-end in a real browser

Restoring this snapshot reproduces the verified-healthy state (deps installed, env files written, admin seeded). See `.obvious/skills/local-dev/SKILL.md` to (re)start services.

## Bibliography

4 nodes upserted (prior run):
- `bbms-app` (system) — Blood Bank Management System root
- `bbms-backend` (system, child of bbms-app) — Express/Node API
- `bbms-frontend` (system, child of bbms-app) — React/Vite frontend
- `bbms-mongodb` (infrastructure, child of bbms-app) — MongoDB database

## Security Scan

> **Status:** security_scan_queued — the scan runs asynchronously. Results will appear in Product Atlas when complete.

## Runbooks

[Populated by autobuild-runbooks skill when requested. See `.obvious/runbooks/` after that skill runs.]
