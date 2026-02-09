/**
 * FRONTEND-ONLY MODE (No Backend)
 * 
 * This frontend now operates without a backend using localStorage for all data.
 * All authentication and task management is handled client-side via mock storage.
 *
 * MOCK AUTH ENDPOINTS (simulated in src/api/client.js)
 *  - POST /auth/signup { email, password, name } -> { access_token, user }
 *  - POST /auth/login  { email, password }       -> { access_token, user }
 *  - GET  /auth/me      (Authorization: Bearer)  -> { id, email, name }
 *
 * MOCK TASK ENDPOINTS (simulated in src/api/client.js)
 *  - GET    /tasks                                -> { items: Task[] }
 *  - POST   /tasks       TaskCreate               -> Task
 *  - PUT    /tasks/{id}  TaskUpdate               -> Task
 *  - PATCH  /tasks/{id}  { completed: boolean }   -> Task
 *  - DELETE /tasks/{id}                           -> { ok: true }
 *
 * Task shape used in UI:
 *  - id: string
 *  - userId: string
 *  - title: string
 *  - description?: string
 *  - due_at?: ISO string
 *  - priority?: "low"|"medium"|"high"
 *  - completed: boolean
 *  - createdAt: ISO string
 *  - updatedAt: ISO string
 *
 * Data Storage:
 *  - Users: localStorage key "task_scheduler_users"
 *  - Tasks: localStorage key "task_scheduler_tasks"
 *  - Session: localStorage key "task_scheduler_session"
 *  - Token: localStorage key "task_scheduler_token"
 */
export {};
