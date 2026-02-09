/**
 * Frontend-only API client (mock storage).
 * No backend dependency - all data stored in localStorage.
 */

import { mockAuth } from "../auth/mockAuth";
import { mockTasks } from "../auth/mockTasks";

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns mock indicator since we're frontend-only. */
  return "frontend-only (localStorage)";
}

// PUBLIC_INTERFACE
export async function apiRequest({ path, method, headers = {}, body }) {
  /**
   * Mock API request handler using localStorage.
   * @param {string} path - URL path, e.g. "/tasks" or "/auth/login"
   * @param {string} method - HTTP method
   * @param {object} headers - Request headers (for token extraction)
   * @param {any} body - JS object body
   * @returns {Promise<any>} - Mock response
   */

  // Simulate network delay for realism
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

  try {
    // Extract user ID from token if present
    let userId = null;
    const authHeader = headers.Authorization || headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = mockAuth.getToken() === token ? mockAuth.getCurrentUser() : null;
      userId = decoded?.userId || null;
    }

    // Route handling
    if (path === "/auth/signup" && method === "POST") {
      const result = mockAuth.register(body);
      return result;
    }

    if (path === "/auth/login" && method === "POST") {
      const result = mockAuth.login(body);
      return result;
    }

    if (path === "/auth/me" && method === "GET") {
      const user = mockAuth.getCurrentUser();
      if (!user) {
        const err = new Error("Unauthorized");
        err.status = 401;
        throw err;
      }
      return { id: user.userId, email: user.email, name: user.name };
    }

    if (path === "/tasks" && method === "GET") {
      if (!userId) {
        const err = new Error("Unauthorized");
        err.status = 401;
        throw err;
      }
      const tasks = mockTasks.getTasks(userId);
      return { items: tasks };
    }

    if (path === "/tasks" && method === "POST") {
      if (!userId) {
        const err = new Error("Unauthorized");
        err.status = 401;
        throw err;
      }
      const task = mockTasks.createTask(userId, body);
      return task;
    }

    if (path.startsWith("/tasks/") && method === "PUT") {
      if (!userId) {
        const err = new Error("Unauthorized");
        err.status = 401;
        throw err;
      }
      const taskId = path.split("/")[2];
      const task = mockTasks.updateTask(userId, taskId, body);
      return task;
    }

    if (path.startsWith("/tasks/") && method === "PATCH") {
      if (!userId) {
        const err = new Error("Unauthorized");
        err.status = 401;
        throw err;
      }
      const taskId = path.split("/")[2];
      const task = mockTasks.patchTask(userId, taskId, body);
      return task;
    }

    if (path.startsWith("/tasks/") && method === "DELETE") {
      if (!userId) {
        const err = new Error("Unauthorized");
        err.status = 401;
        throw err;
      }
      const taskId = path.split("/")[2];
      const result = mockTasks.deleteTask(userId, taskId);
      return result;
    }

    // Default 404
    const err = new Error("Not found");
    err.status = 404;
    throw err;
  } catch (e) {
    throw e;
  }
}
