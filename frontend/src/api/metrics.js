/**
 * API functions for server metric data.
 *
 * Endpoints:
 *   GET /api/servers/{serverName}/metrics  — up to 100 recent metrics (desc order)
 *   GET /api/servers/{serverName}/latest   — single most recent metric
 *
 * Auth: HTTP Basic (ADMIN role required)
 *
 * ServerMetric response shape:
 * {
 *   id:            number,
 *   serverName:    string,
 *   cpuUsage:      number,   // 0–100 %
 *   memoryUsage:   number,   // 0–100 %
 *   diskUsage:     number,   // 0–100 %
 *   loadAverage:   number,   // >= 0
 *   logErrorCount: number,   // >= 0 integer
 *   recordedAt:    string,   // ISO 8601 Instant, e.g. "2024-01-15T12:34:56Z"
 * }
 */

import { apiFetch } from './client.js';

/**
 * Fetches up to 100 recent metrics for a server, returned in
 * chronological order (oldest first) — the backend returns newest-first,
 * so this function reverses the array.
 *
 * @param {string} serverName
 * @returns {Promise<Array>}
 */
export async function fetchMetricHistory(serverName) {
  const encoded = encodeURIComponent(serverName);
  const data = await apiFetch(`/api/servers/${encoded}/metrics`);
  if (!Array.isArray(data)) {
    throw new Error('Unexpected response: expected an array of metrics.');
  }
  // Backend returns newest-first; reverse for chronological chart display.
  return [...data].reverse();
}

/**
 * Fetches the latest available metric for a server.
 * Returns null when no metric is available (404).
 *
 * @param {string} serverName
 * @returns {Promise<object|null>}
 */
export async function fetchLatestMetric(serverName) {
  const encoded = encodeURIComponent(serverName);
  try {
    return await apiFetch(`/api/servers/${encoded}/latest`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}
