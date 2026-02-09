/**
 * Lightweight API client (fetch wrapper).
 * Uses REACT_APP_API_BASE_URL for configuration.
 */

const DEFAULT_TIMEOUT_MS = 15000;

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Base URL of backend API. Must be set in environment. */
  return (process.env.REACT_APP_API_BASE_URL || "http://localhost:3001").replace(/\/+$/, "");
}

function timeoutSignal(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

// PUBLIC_INTERFACE
export async function apiRequest({ path, method, headers = {}, body }) {
  /**
   * Perform an HTTP request to backend API.
   * @param {string} path - URL path, e.g. "/tasks"
   * @param {string} method - HTTP method
   * @param {object} headers - Request headers
   * @param {any} body - JS object body, will be JSON.stringified
   * @returns {Promise<any>} - Parsed JSON response (or {} for empty)
   */
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const hasBody = body !== undefined && body !== null;
  const reqHeaders = {
    Accept: "application/json",
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  const { signal, cancel } = timeoutSignal(DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method,
      headers: reqHeaders,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal,
      // Explicitly avoid cookie-based flows; this app uses Bearer tokens.
      credentials: "omit",
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    let payload = null;
    if (isJson) {
      // If response is empty, json() throws; guard by reading text first.
      const text = await res.text();
      payload = text ? JSON.parse(text) : {};
    } else {
      payload = await res.text();
    }

    if (!res.ok) {
      // FastAPI commonly returns {"detail": "..."} or {"detail":[{msg:...}]}
      let msg = `Request failed (${res.status})`;
      if (payload && typeof payload === "object") {
        const detail = payload.detail ?? payload.message;
        if (typeof detail === "string") msg = detail;
        else if (Array.isArray(detail) && detail.length && detail[0]?.msg) msg = detail[0].msg;
      } else if (typeof payload === "string" && payload) {
        msg = payload;
      }

      const err = new Error(msg);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }

    return payload ?? {};
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("Request timed out. Check backend availability.");
    }
    throw e;
  } finally {
    cancel();
  }
}
