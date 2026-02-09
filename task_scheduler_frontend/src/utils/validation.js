/** Simple validation helpers (frontend only). */

// PUBLIC_INTERFACE
export function validateRequired(value) {
  /** Return true if value is non-empty after trim. */
  return Boolean(String(value ?? "").trim());
}

// PUBLIC_INTERFACE
export function validateEmail(email) {
  /** Basic email validation; sufficient for client-side pre-check. */
  const v = String(email ?? "").trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// PUBLIC_INTERFACE
export function validatePassword(password) {
  /** Password must be at least 8 chars. (backend may enforce additional rules) */
  return String(password ?? "").length >= 8;
}
