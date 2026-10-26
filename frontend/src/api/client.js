/**
 * Centralized API client for ServerPulse backend.
 *
 * All fetch calls go through this module so error handling, credential
 * management, and base-URL configuration are in one place.
 *
 * Authentication: HTTP Basic credentials are stored in memory only
 * (never localStorage). They are cleared on page reload — this is the
 * safest option when the backend does not support session cookies or tokens.
 *
 * The Vite dev proxy (vite.config.js) forwards /api/* to localhost:8080,
 * so during development no CORS preflight issues occur and credentials do
 * not travel to a third-party host.
 */

// Base URL — empty string uses relative paths (works with the Vite proxy and
// with production deployments where the API lives on the same origin).
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// ---------------------------------------------------------------------------
// In-memory credential store.
// Credentials are held only for the lifetime of the current page.
// They are never written to localStorage, sessionStorage, or cookies.
// ---------------------------------------------------------------------------
let _credentials = null; // { username: string, password: string } | null

export function setCredentials(username, password) {
  _credentials = { username, password };
}

export function clearCredentials() {
  _credentials = null;
}

export function hasCredentials() {
  return _credentials !== null;
}

/**
 * Builds the Authorization header value for HTTP Basic auth.
 * Returns null when no credentials are stored.
 */
function buildAuthHeader() {
  if (!_credentials) return null;
  const encoded = btoa(`${_credentials.username}:${_credentials.password}`);
  return `Basic ${encoded}`;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Performs a GET request and returns parsed JSON.
 *
 * Throws an ApiError for non-2xx responses so callers can catch
 * and render appropriate UI states (401, 403, 404, network error, etc.).
 *
 * @param {string} path   - URL path, e.g. "/api/servers"
 * @returns {Promise<any>}
 */
export async function apiFetch(path) {
  const url = `${API_BASE}${path}`;

  const headers = { Accept: 'application/json' };
  const authHeader = buildAuthHeader();
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  let response;
  try {
    response = await fetch(url, { headers });
  } catch (networkError) {
    throw new ApiError('Network error — cannot reach the backend.', 0, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      // Spring Boot may return a JSON error body
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // Non-JSON body — use status text
      message = response.statusText || message;
    }

    switch (response.status) {
      case 401:
        throw new ApiError('Authentication required. Please log in.', 401, 'UNAUTHORIZED');
      case 403:
        throw new ApiError('Access denied. You do not have permission.', 403, 'FORBIDDEN');
      case 404:
        throw new ApiError(message, 404, 'NOT_FOUND');
      default:
        throw new ApiError(message, response.status, 'SERVER_ERROR');
    }
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError('Unexpected response format from server.', response.status, 'PARSE_ERROR');
  }
}

/**
 * Custom error class so callers can distinguish API errors from
 * programmer errors.
 */
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;  // HTTP status code (0 for network errors)
    this.code = code;      // Symbolic code: UNAUTHORIZED, NOT_FOUND, etc.
  }
}
