---
name: local-dev
version: 2.0.0
description: Bring this repo's local dev environment up from scratch.
category: local-dev
triggers:
  - local dev setup
  - run repo locally
  - start dev server
  - bring up local stack
author: autobuild-setup
created: 2026-06-03
updated: 2026-08-21
---

## Prerequisites

- Node.js v20.x (verified: v20.20.2) + npm v10.x (verified: 10.8.2)
- Internet access (npm registry + mongodb-memory-server binary download)
- Docker NOT required (unavailable in sandbox; compose path documented below for machines that have it)

## Install

    cd backend && npm ci
    cd frontend && npm ci

## Environment

backend/.env (gitignored):

    MONGO_URI=mongodb://127.0.0.1:27017/bbms
    JWT_SECRET=<any long random string, e.g. openssl rand -hex 32>
    PORT=5000

frontend/.env (gitignored):

    VITE_API_URL=http://localhost:5000
    VITE_WEBSITE_NAME=BBMS

## Start (no Docker — verified 2026-08-21)

1. Start MongoDB on :27017 using mongodb-memory-server (already a backend devDependency — downloads the mongod binary on first run):

       cd backend && node -e "const {MongoMemoryServer}=require('mongodb-memory-server');(async()=>{const m=await MongoMemoryServer.create({instance:{port:27017,ip:'127.0.0.1',dbName:'bbms'}});console.log('MONGO READY',m.getUri());setInterval(()=>{},1<<30);})().catch(e=>{console.error(e);process.exit(1)})" > /tmp/mongo.log 2>&1 &

   Wait for `MONGO READY` in /tmp/mongo.log (first run downloads ~70 MB mongod).

2. Seed admin (first time only): `cd backend && node seedAdmin.js`
3. Start backend: `cd backend && npm start` (nodemon) → http://localhost:5000 — expect "Server running on port 5000" + "MongoDB Connected"
4. Start frontend: `cd frontend && npm run dev` → http://localhost:5173

Admin login: suraj@admin.com / bbms@admin

NOTE on backgrounding inside the agent sandbox: redirect ALL fds of the background process
(`> log 2>&1 < /dev/null`) and keep it out of the tool call's stdout pipe, or the exec call
hangs until its timeout (the process still starts — only the call is delayed).

## Start (Docker, when available)

    docker compose up --build
    # frontend -> http://localhost (port 80), backend -> http://localhost:3000
    # seed admin: docker exec -it backend node seedAdmin.js

## Verify Primary User Flow (verified 2026-08-21)

API:
    curl -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' \
      -d '{"email":"suraj@admin.com","password":"bbms@admin"}'
    # -> 200 {"success":true,"token":"...","user":{"role":"admin"},"redirect":"/admin"}
    # GET /api/auth/profile with Bearer token -> 200; wrong password -> 401

UI (Playwright + headless Chromium; deps via `sudo npx playwright install-deps chromium`):
1. http://localhost:5173/ → landing renders (h1 "BBMS")
2. /login → fill input[type=email] + input[type=password] → button[type=submit]
3. Redirects to /admin, JWT in localStorage, 0 console errors

Evidence captured 2026-08-21 (sandbox /tmp/pw/shots/): 01-landing.png, 02-login.png,
03-admin-dashboard.png; API login/profile/401 checks; backend 62/62 tests green.

## Verified Commands

- Test: `cd backend && npm test` — 62/62 passed (vitest + supertest + mongodb-memory-server; no running services needed)
- Lint: `cd frontend && npm run lint` — runs; 5 errors + 9 warnings, all pre-existing in repo source
- Build: `cd frontend && npm run build` — succeeds (chunk-size warning only)
- Typecheck: not_supported (no TypeScript in repo)
- Scoped lint: `cd frontend && npx eslint src/path/to/file.jsx`
- Scoped test: `cd backend && npx vitest run tests/auth.test.js`

## Sandbox Snapshot

- snapshotId: s31f3xkqek037e09s16q:default
- Captured: 2026-08-21T17:36:11.348Z
- Restoring this snapshot reproduces the verified-healthy state (deps installed, env files written, Mongo + backend + frontend running).

## Known Blockers / Workarounds

1. Docker unavailable in sandbox — workaround: mongodb-memory-server provides standalone mongod on :27017. Stack fully healthy without Docker.
2. Frontend lint has 5 pre-existing errors + 9 warnings (react-hooks/exhaustive-deps, no-unused-vars) — not introduced by setup; do not "fix" incidentally in unrelated PRs.
3. No TypeScript / no typecheck target in repo — typecheck is not_supported, not a failure.
4. Backend has no dedicated /health endpoint — use GET /api/doc (200) or POST /api/auth/login as liveness probes.
