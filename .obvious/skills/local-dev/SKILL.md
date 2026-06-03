---
name: local-dev
version: 1.0.0
description: Bring this repo local dev environment up from scratch.
category: local-dev
triggers:
  - local dev setup
  - run repo locally
  - start dev server
  - bring up local stack
author: autobuild-setup
created: 2026-06-03
---

## Prerequisites

- Node.js v20.x (verified: v20.20.2)
- npm v10.x (verified: v10.8.2)
- MongoDB v8.0 (install via apt if not present)
- Docker (optional): Docker Compose recommended when available

## Install

MongoDB 8.0 on Linux:
  sudo bash apt install mongodb-org -- see README for full apt command

Backend: cd backend && npm install
Frontend: cd frontend && npm install

## Environment

backend/.env:
  MONGO_URI=mongodb://127.0.0.1:27017/bbms
  JWT_SECRET=dev-local-secret-do-not-use-in-production
  PORT=5000

frontend/.env:
  VITE_API_URL=http://localhost:5000
  VITE_WEBSITE_NAME=Blood Bank Management System

## Start

Without Docker:
  1. sudo mkdir -p /data/db && sudo chown USER /data/db
  2. mongod --dbpath /data/db --fork --logpath /var/log/mongodb/mongod.log --bind_ip 127.0.0.1
  3. cd backend && node seedAdmin.js   # first time only
  4. cd backend && nohup node server.js > /tmp/backend.log 2>&1 &
  5. cd frontend && nohup npm run dev > /tmp/frontend.log 2>&1 &
  Admin: suraj@admin.com / bbms@admin

Docker (when available):
  docker compose up --build -d
  Frontend -> http://localhost (port 80)
  Backend  -> http://localhost:3000
  Seed:    docker exec -it backend node seedAdmin.js

## Verify Primary User Flow

1. Open http://localhost:5173/ -> landing page with BBMS branding
2. Click Login -> suraj@admin.com / bbms@admin -> submit
3. Redirected to /admin -> sidebar: Overview, Verification, Facilities, Donors
4. Header shows Suraj Savle / Admin

API check: POST to http://localhost:5000/api/auth/login
  body: email=suraj@admin.com password=bbms@admin
  response: success=true redirect=/admin token=...

Evidence (2026-06-03):
  tc-1 fl_tGnEw6S7 landing page
  tc-2 fl_pKtTpE2i login page
  tc-3 fl_no7zwq2d post-login admin
  tc-4 fl_cbMg6Pkc admin dashboard
  tc-5 fl_iCQyrztW admin donors

## Verified Commands

- Typecheck: not_discovered
- Lint: cd frontend && npx eslint . (exits 0; 6 pre-existing errors + 9 warnings)
- Test: not_discovered (backend placeholder test only)
- Scoped lint: cd frontend && npx eslint src/path/to/changed/file.jsx

## Sandbox Snapshot

- snapshotId: 3rkceahecrrhsu4wr59f:default
- Captured: 2026-06-03T15:14:03.049Z
- Restoring this snapshot reproduces the verified-healthy state.

## Known Blockers / Workarounds

1. Docker unavailable in sandbox -- workaround: MongoDB via apt, node directly. Stack healthy.
2. Pre-existing syntax error in frontend/src/components/layouts/DashboardLayout.jsx
   lines 206-207: duplicate const res line removed during setup (committed in setup PR).
3. Admin stats widget shows Failed to load dashboard -- AdminDashboard.jsx uses hardcoded
   /api/admin/dashboard without VITE_API_URL prefix. Pre-existing code issue, not blocking.
4. ESLint 6 errors 9 warnings -- all pre-existing. Not introduced by setup.
