# Backend interface artifacts

This folder contains interface-related artifacts used by the frontend.

- `backend_openapi.json`: downloaded from the running FastAPI backend `/openapi.json`.

Note: the current OpenAPI in this environment only includes the `/` health check. When the backend is implemented, re-download the OpenAPI spec and update frontend contract assumptions in `src/api/contracts.js`.
