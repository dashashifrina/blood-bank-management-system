# Codebase Map

Folder-level overview, depth cap 2.

| Directory | Purpose |
|---|---|
| `backend/` | Express 5 REST API (ESM) — domains: auth, donor, facility, admin, blood-lab, hospital |
| `backend/routes/` | Route definitions per domain: authRoutes, donorRoutes, adminRoutes, facilityRoutes, bloodLabRoutes, hospitalRoutes, campRoutes |
| `backend/controllers/` | Request handlers per domain (`authContoller.js` typo is original) |
| `backend/models/` | Mongoose models: Admin, Donor, Facility, User, Blood, BloodRequest, Camp |
| `backend/middleware/` + `backend/middlewares/` | JWT `protect` + role middlewares (admin, donor, facility) — two dirs, legacy split |
| `backend/config/` | DB connection helper |
| `backend/openapi/` | swagger-jsdoc spec + swagger-ui-express mount at `/api/doc` |
| `backend/tests/` | vitest + supertest suites (auth, admin, donor, bloodTypeCompatibility) on mongodb-memory-server |
| `backend/utils/` | bloodTypeCompatibility helper |
| `backend/seedAdmin.js` | Seeds admin user (`suraj@admin.com`) — run once from `backend/` |
| `frontend/` | React 19 + Vite 7 SPA with role-based dashboards |
| `frontend/src/pages/` | Pages by role: `auth/`, `admin/`, `donor/`, `hospital/`, `bloodlab/`, `user/` + Landing, Profile, ForgotPassword |
| `frontend/src/components/` | Shared components (Header, Footer, ProtectedRoute) + `layouts/DashboardLayout` |
| `frontend/src/utils/` | `auth.js` — token validation + authenticated fetch helper |
| `frontend/nginx.conf`, `frontend/Dockerfile` | Production container config for the compose path |
| `docker-compose.yml` | backend (:3000→5000) + frontend (:80, nginx) + mongodb (:27017) |
