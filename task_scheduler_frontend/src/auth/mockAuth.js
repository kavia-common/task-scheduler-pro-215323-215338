/**
 * Mock authentication system for frontend-only mode.
 * Stores users and sessions in localStorage without backend dependency.
 */

const USERS_KEY = "task_scheduler_users";
const SESSION_KEY = "task_scheduler_session";
const TOKEN_KEY = "task_scheduler_token";

/**
 * Generate a simple mock JWT-like token
 */
function generateMockToken(userId) {
  const payload = { userId, exp: Date.now() + 24 * 60 * 60 * 1000 }; // 24h expiry
  return btoa(JSON.stringify(payload));
}

/**
 * Decode mock token
 */
function decodeMockToken(token) {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export const mockAuth = {
  /**
   * Register a new user (frontend-only)
   */
  register({ email, password, name }) {
    try {
      // Get existing users
      const usersJson = localStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      // Check if user already exists
      const existing = users.find((u) => u.email === email);
      if (existing) {
        throw new Error("User with this email already exists");
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name,
        password, // In real app, this would be hashed
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      // Create session
      const token = generateMockToken(newUser.id);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          userId: newUser.id,
          email: newUser.email,
          name: newUser.name,
        })
      );

      return {
        access_token: token,
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
      };
    } catch (e) {
      throw e;
    }
  },

  /**
   * Login user (frontend-only)
   */
  login({ email, password }) {
    try {
      // Get existing users
      const usersJson = localStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      // Find user
      const user = users.find((u) => u.email === email && u.password === password);
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Create session
      const token = generateMockToken(user.id);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name,
        })
      );

      return {
        access_token: token,
        user: { id: user.id, email: user.email, name: user.name },
      };
    } catch (e) {
      throw e;
    }
  },

  /**
   * Logout user
   */
  logout() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  },

  /**
   * Get current user from session
   */
  getCurrentUser() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;

      // Validate token
      const decoded = decodeMockToken(token);
      if (!decoded || decoded.exp < Date.now()) {
        // Token expired
        this.logout();
        return null;
      }

      const sessionJson = localStorage.getItem(SESSION_KEY);
      if (!sessionJson) return null;

      return JSON.parse(sessionJson);
    } catch {
      return null;
    }
  },

  /**
   * Validate current session
   */
  isAuthenticated() {
    const user = this.getCurrentUser();
    return user !== null;
  },

  /**
   * Get token
   */
  getToken() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;

      // Validate token expiry
      const decoded = decodeMockToken(token);
      if (!decoded || decoded.exp < Date.now()) {
        this.logout();
        return null;
      }

      return token;
    } catch {
      return null;
    }
  },
};
