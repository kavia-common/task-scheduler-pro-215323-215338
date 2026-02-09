const TOKEN_KEY = "task_scheduler_token";

// PUBLIC_INTERFACE
export const authStorage = {
  /** Get persisted auth token (JWT/Bearer). */
  getToken() {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
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
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};
