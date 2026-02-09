/**
 * This file documents the REST endpoints this frontend expects.
 * Update this contract to match your FastAPI backend routes once implemented.
 *
 * AUTH
 *  - POST /auth/signup { email, password, name } -> { access_token }
 *  - POST /auth/login  { email, password }       -> { access_token }
 *  - GET  /auth/me      (Authorization: Bearer)  -> { id, email, name }
 *
 * TASKS
 *  - GET    /tasks                                -> { items: Task[] } OR Task[]
 *  - POST   /tasks       TaskCreate               -> Task
 *  - PUT    /tasks/{id}  TaskUpdate               -> Task
 *  - PATCH  /tasks/{id}  { completed: boolean }   -> Task
 *  - DELETE /tasks/{id}                           -> { ok: true } OR empty
 *
 * Task shape used in UI (flexible):
 *  - id: string|number
 *  - title: string
 *  - description?: string
 *  - due_at?: ISO string
 *  - priority?: "low"|"medium"|"high"
 *  - completed?: boolean
 */
export {};
