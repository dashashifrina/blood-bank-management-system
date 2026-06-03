# Codebase Map

| Directory | Purpose |
|---|---|
| `backend` | Express/Node.js REST API — auth, donor, facility, admin, blood-lab, hospital routes |
| `backend/routes` | Route definitions: auth, donor, admin, facility, blood-lab, hospital, camp |
| `backend/controllers` | Request handlers for each route domain |
| `backend/models` | Mongoose ODM models: User, Admin, Donor, Facility, BloodModel, BloodRequest, Camp |
| `backend/middleware` | JWT auth middleware, request validation |
| `backend/config` | Database connection and app config |
| `backend/openapi` | Swagger/OpenAPI spec and swagger-ui-express setup |
| `frontend` | React 19 + Vite 7 SPA — role-based dashboards for Admin, Donor, Hospital, Blood Lab |
| `frontend/src/pages` | Page components organized by role: admin, donor, hospital, bloodlab, auth |
| `frontend/src/components` | Shared UI components, layout wrappers (DashboardLayout) |
| `frontend/src/utils` | Utility helpers (API base URL, token handling) |
