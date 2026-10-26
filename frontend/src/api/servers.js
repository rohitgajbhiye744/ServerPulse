/**
 * API functions for registered server data.
 *
 * Endpoint: GET /api/servers
 * Auth: HTTP Basic (ADMIN role required)
 *
 * Response shape (array of ServerResponse DTOs):
 *   [ { id: number, name: string, active: boolean }, ... ]
 */

import { apiFetch } from './client.js';

/**
 * Fetches all registered servers.
 * @returns {Promise<Array<{id: number, name: string, active: boolean}>>}
 */
export async function fetchServers() {
  const data = await apiFetch('/api/servers');
  if (!Array.isArray(data)) {
    throw new Error('Unexpected response shape: expected an array of servers.');
  }
  return data;
}
