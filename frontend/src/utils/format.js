/**
 * Formatting utilities shared across components.
 * Keep display logic here so components stay focused on structure.
 */

/**
 * Formats a percentage number for display.
 * e.g. 72.456 → "72.5%"
 *
 * @param {number|null|undefined} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Formats a load average number.
 * e.g. 1.234567 → "1.23"
 *
 * @param {number|null|undefined} value
 * @returns {string}
 */
export function formatLoadAverage(value) {
  if (value == null || isNaN(value)) return '—';
  return Number(value).toFixed(2);
}

/**
 * Returns a short human-readable time string relative to now.
 * e.g. "2 minutes ago", "just now", "3 hours ago"
 *
 * @param {string|Date|null} timestamp - ISO string or Date object
 * @returns {string}
 */
export function timeAgo(timestamp) {
  if (!timestamp) return '—';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return '—';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Formats a timestamp for chart axis labels (HH:MM format).
 * @param {string} isoString
 * @returns {string}
 */
export function formatChartTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Formats a timestamp for chart tooltips (full date + time).
 * @param {string} isoString
 * @returns {string}
 */
export function formatTooltipTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Formats a full timestamp for display in the UI.
 * e.g. "Oct 15, 14:32:05"
 *
 * @param {string|Date|null} timestamp
 * @returns {string}
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return '—';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Returns the status level for a metric value based on thresholds.
 * These are client-side display thresholds only — not backend alerts.
 *
 * @param {number} value         - metric value
 * @param {number} [warn=70]     - warning threshold
 * @param {number} [critical=90] - critical threshold
 * @returns {'healthy'|'warning'|'critical'}
 */
export function getStatusLevel(value, warn = 70, critical = 90) {
  if (value == null || isNaN(value)) return 'healthy';
  if (value >= critical) return 'critical';
  if (value >= warn) return 'warning';
  return 'healthy';
}

/**
 * Computes average of an array of numbers, ignoring null/undefined/NaN.
 * Returns null if the array is empty or all values are invalid.
 *
 * @param {Array<number>} values
 * @returns {number|null}
 */
export function average(values) {
  const valid = values.filter(v => v != null && !isNaN(v));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}
