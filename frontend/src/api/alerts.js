/**
 * API functions for persisted backend alerts.
 *
 * Endpoint: GET /api/alerts
 * Auth: HTTP Basic (authenticated dashboard user)
 */

import { apiFetch } from './client.js';

/**
 * Fetches alerts newest first, optionally filtered by server, severity, and status.
 *
 * @param {{serverName?: string, severity?: string, status?: string}} filters
 * @returns {Promise<Array>}
 */
export async function fetchAlerts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.serverName) params.set('serverName', filters.serverName);
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.status) params.set('status', filters.status);

  const query = params.toString();
  const data = await apiFetch(`/api/alerts${query ? `?${query}` : ''}`);
  if (!Array.isArray(data)) {
    throw new Error('Unexpected response shape: expected an array of alerts.');
  }
  return data;
}
