# Codebase Map

| Directory | Purpose |
|---|---|
| `backend` | Express/Node.js REST API — auth, donor, facility, admin, blood-lab, hospital routes; ESM (`"type": "module"`) |
| `backend/routes` | Route definitions: auth, donor, admin, facility, blood-lab, hospital, camp |
| `backend/controllers` | Request handlers for each route domain |
| `backend/models` | Mongoose ODM models: User, Admin, Donor, Facility, BloodModel, BloodRequest, Camp |
| `backend/middleware` + `backend/middlewares` | JWT auth + role middlewares (both spellings exist; `middleware/auth.js` is the shared JWT verifier) |
| `backend/config` | Database connection (`db.js`) |
| `backend/openapi` | Swagger/OpenAPI spec and swagger-ui-express setup (served at `/api/doc`) |
| `backend/tests` | Vitest suites: auth, admin, donor, bloodTypeCompatibility + `testApp.js`/`setup.js` harness (mongodb-memory-server) |
| `frontend` | React 19 + Vite 7 SPA — role-based dashboards |
| `frontend/src/pages` | Page components by role: `admin/`, `donor/`, `hospital/`, `bloodlab/`, `auth/`, `user/` + Landing, Profile, ForgotPassword |
| `frontend/src/components` | Shared UI components and layout wrappers (`layouts/DashboardLayout.jsx`) |
| `frontend/src/utils` | Utility helpers (API base URL, token handling) |
