/**
 * Checks backend connectivity using the Spring Actuator health endpoint.
 * This endpoint is publicly accessible (no auth required).
 *
 * Returns: { status: 'UP' | 'DOWN' | 'UNKNOWN', reachable: boolean }
 */

import { apiFetch } from './client.js';

export async function checkHealth() {
  try {
    const data = await apiFetch('/actuator/health');
    return { reachable: true, status: data?.status ?? 'UNKNOWN' };
  } catch {
    return { reachable: false, status: 'DOWN' };
  }
}
