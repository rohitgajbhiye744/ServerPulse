/**
 * useAuth — manages admin credentials in memory for the current session.
 *
 * Important security notes:
 * - Credentials are stored only in React state (in-memory).
 * - They are cleared when the page reloads.
 * - They are NEVER written to localStorage, sessionStorage, or cookies.
 * - The Vite dev proxy forwards requests to the backend, so credentials
 *   travel only between the browser and localhost.
 *
 * Authentication model:
 * - The backend uses HTTP Basic authentication.
 * - The user enters their admin username and password in the login form.
 * - On submit, the credentials are stored via setCredentials() from the
 *   API client and verified with a real API call.
 * - If the call succeeds, isAuthenticated becomes true and the dashboard loads.
 */

import { useState, useCallback } from 'react';
import { setCredentials, clearCredentials } from '../api/client.js';
import { fetchServers } from '../api/servers.js';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Attempts to log in with the provided credentials.
   * Makes a real API call to verify them against the backend.
   *
   * @param {string} username
   * @param {string} password
   * @returns {Promise<boolean>} true if login succeeded
   */
  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);

    // Store credentials so the API client sends them with the next request.
    setCredentials(username, password);

    try {
      // Verify by fetching the server list — requires ADMIN auth.
      await fetchServers();
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      // Clear invalid credentials immediately.
      clearCredentials();
      setIsAuthenticated(false);
      setIsLoading(false);

      if (err.status === 401 || err.status === 403) {
        setError('Invalid username or password.');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Cannot reach the backend. Make sure it is running.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearCredentials();
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return { isAuthenticated, isLoading, error, login, logout };
}
