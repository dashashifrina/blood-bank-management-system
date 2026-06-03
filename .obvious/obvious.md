# Repo guidance

## Codebase Map

See `.obvious/codebase-map.md`.

## Rules

<!-- synthesized from: README.md, CONTRIBUTING.md (files found in SCAN) — agent-relevant rules only -->

- **Commit messages:** Use meaningful commit messages (see CONTRIBUTING.md)
- **Branch naming:** Use descriptive feature branch names (`feature-branch-name`)
- **No secrets:** Never push `.env` or sensitive data to git
- **Folder structure:** Follow the existing `backend/` and `frontend/` separation
- **Code quality:** Write clean, readable code; add comments where needed
- **PR descriptions:** Write PR descriptions clearly
- **Stack:** Backend = Node.js/Express/MongoDB; Frontend = React/Vite/Tailwind
- **Docker:** Docker Compose is the recommended run approach (when Docker is available)
- **Admin seed:** Run `node seedAdmin.js` from `backend/` on first setup to create admin user

## Local Verification

> **Warning:** Running full-repo typecheck, lint, or tests may OOM or timeout in the sandbox for large repos.
> Use the scoped commands below when verifying changes.

### Verified Commands

<!-- local-verification-summary:v1 -->
- **Typecheck command:** not_discovered
- **Lint command:** `cd frontend && npx eslint .` | verified (exits 0; 6 errors + 9 warnings are pre-existing)
- **Test command:** not_discovered (backend: placeholder only — `echo "Error: no test specified"`)
- **Scoped typecheck:** not_supported
- **Scoped lint:** `cd frontend && npx eslint src/path/to/file.jsx` | supported
- **Scoped test:** not_supported
- **Full-repo check safe:** yes — no monorepo, suite is fast
- **Scoped alternatives discovered:** yes — eslint supports file paths
<!-- /local-verification-summary -->

### Scoped Workflow

Run these commands to verify changed files without triggering a full-repo scan:

1. **Lint changed files:** `cd frontend && npx eslint <path/to/changed/file.jsx>`

## Sandbox Snapshot

- **Snapshot ID:** `3rkceahecrrhsu4wr59f:default`
- **Captured:** `2026-06-03T15:14:03.049Z`
- **Dev stack healthy:** yes

## Bibliography

4 nodes upserted (0 reused from prior runs):
- `bbms-app` (system) — Blood Bank Management System root
- `bbms-backend` (system, child of bbms-app) — Express/Node API
- `bbms-frontend` (system, child of bbms-app) — React/Vite frontend
- `bbms-mongodb` (infrastructure, child of bbms-app) — MongoDB database

## Security Scan

> **Status:** security_scan_queued — the scan runs asynchronously. Results will appear in Product Atlas when complete.

## Runbooks

[Populated by autobuild-runbooks skill when requested. See `.obvious/runbooks/` after that skill runs.]
