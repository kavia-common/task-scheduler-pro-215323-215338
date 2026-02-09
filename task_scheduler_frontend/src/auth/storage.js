import { mockAuth } from "./mockAuth";

const TOKEN_KEY = "task_scheduler_token";

// PUBLIC_INTERFACE
export const authStorage = {
  /** Get persisted auth token (JWT/Bearer). */
  getToken() {
    return mockAuth.getToken();
  },

  /** Persist auth token (JWT/Bearer). */
  setToken(token) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  },

  /** Clear persisted token. */
  clearToken() {
    mockAuth.logout();
  },
};
