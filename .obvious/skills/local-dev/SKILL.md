---
name: local-dev
version: 2.0.0
description: Bring this repo's local dev environment up from scratch (no Docker required).
category: local-dev
triggers:
  - local dev setup
  - run repo locally
  - start dev server
  - bring up local stack
author: autobuild-setup
created: 2026-08-25
---

Verified 2026-08-25 on sandbox `cmp_PWNZEagr`. Stack: MongoDB 8.2.6 :27017, Express :5000, Vite :5173.

## Prerequisites

- Node.js v20.x (verified: v20.20.2) + npm v10.x (verified: v10.8.2)
- Docker is NOT available in this sandbox — use the native procedure below
- tmux (installed) for long-running services

## Install

```bash
cd backend  && npm install   # also caches a mongod binary, see below
cd frontend && npm install
```

## Start MongoDB (no system mongod, no Docker)

`backend/npm install` pulls `mongodb-memory-server`, whose postinstall caches a real
mongod binary. Run it as a normal standalone daemon:

```bash
MONGOD=backend/node_modules/.cache/mongodb-memory-server/mongod-x64-debian-8.2.6
mkdir -p ~/bbms-mongo-data
$MONGOD --dbpath ~/bbms-mongo-data --port 27017 --bind_ip 127.0.0.1 \
  --fork --logpath ~/bbms-mongo-data/mongod.log
```

Verify: `echo > /dev/tcp/127.0.0.1/27017 && echo up`

## Environment

`backend/.env` (gitignored — create it):
```
MONGO_URI=mongodb://127.0.0.1:27017/bbms
JWT_SECRET=dev-local-secret-do-not-use-in-production
PORT=5000
```

`frontend/.env` (gitignored — create it; **required**, see Gotcha 1):
```
VITE_API_URL=http://localhost:5000
```

## Start services (tmux)

```bash
cd backend && node seedAdmin.js    # first time only → suraj@admin.com / bbms@admin
tmux new-session -d -s backend 'cd backend  && exec node server.js > /tmp/backend.log 2>&1'
tmux new-session -d -s vite    'cd frontend && exec npm run dev   > /tmp/frontend.log 2>&1'
```

Backend CORS already allows http://localhost:5173. Logs: `tail /tmp/backend.log /tmp/frontend.log`.

## Verify Primary User Flow

Browser (agent-browser, Chrome engine — installed globally with `--with-deps`):

1. `agent-browser --engine chrome --args "--no-sandbox --disable-setuid-sandbox" open http://localhost:5173/` → landing page ("Blood Management System", nav with Login)
2. Login link → /login → fill `suraj@admin.com` / `bbms@admin` → submit
3. Redirects to `/admin` → header "Suraj Savle / Admin", sidebar Overview/Verification/Facilities/Donors, live stats from Mongo (e.g. `upcomingCamps: 3`)

API shortcut:
```bash
curl -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"suraj@admin.com","password":"bbms@admin"}'   # → success:true, token, redirect:/admin
```

Evidence captured 2026-08-25 (~/work/evidence/): 01-landing.png, 02-login.png,
03-post-login.png, 04-admin-dashboard.png, 05-admin-donors.png.

## Verified Commands

- Lint: `cd frontend && npx eslint .` — exit 0 (5 errors + 9 warnings pre-existing)
- Tests: `cd backend && npm test` — 62/62 passed, self-contained (mongodb-memory-server)
- Build: `cd frontend && npm run build` — succeeds (~3s)
- Typecheck: not applicable (no TypeScript)

## Sandbox Snapshot

- snapshotId: `s6tmh4urdg6nm9cjl678:default`
- Captured: 2026-08-25T17:40:24.027Z
- Restoring this snapshot reproduces the verified-healthy state (deps + env + seeded admin).
- After a sandbox restart the tmux sessions/mongod may be down: re-run "Start MongoDB" and "Start services" above (data in ~/bbms-mongo-data persists in the snapshot).

## Gotchas

1. **`frontend/.env` is mandatory.** Without `VITE_API_URL` the SPA fetches same-origin
   `/api/*` from the Vite dev server (no proxy configured in `vite.config.js`) and login
   fails with "Server error: 404". Vite reads `.env` at startup only — restart `npm run dev`
   after creating it.
2. **Docker unavailable** in this sandbox — `docker compose up` is not an option here.
3. **Do not `pkill -f` broadly** in the exec channel: patterns like `server.js`/`vite` match
   the wrapper shell and kill the command session. Kill by PID or use tmux.
4. Pre-existing ESLint errors (5) + warnings (9) — not introduced by setup; CI lint step is
   `continue-on-error` by design.
5. CI comment "graceful until vitest test suite lands" is stale — the suite exists and passes
   (62/62). The `continue-on-error` on the backend test step can be safely removed.
