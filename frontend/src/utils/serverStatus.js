import { getStatusLevel } from './format.js';

export const SERVER_OFFLINE_THRESHOLD_MS = 2 * 60 * 1000;

export function deriveServerStatus(server, latest) {
  if (!server.active) return 'inactive';
  if (!latest) return 'unknown';

  const lastSeen = new Date(latest.recordedAt).getTime();
  if (!Number.isFinite(lastSeen) || Date.now() - lastSeen > SERVER_OFFLINE_THRESHOLD_MS) {
    return 'offline';
  }

  const levels = [
    getStatusLevel(latest.cpuUsage),
    getStatusLevel(latest.memoryUsage),
    getStatusLevel(latest.diskUsage, 80, 95),
  ];
  if (levels.includes('critical')) return 'critical';
  if (levels.includes('warning')) return 'warning';
  return 'healthy';
}
