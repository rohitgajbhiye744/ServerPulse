/**
 * StatusBadge — displays a coloured badge for server/metric status.
 *
 * @param {'healthy'|'warning'|'critical'|'inactive'|'unknown'} status
 */
import React from 'react';

const DOT_COLORS = {
  healthy:  'var(--color-healthy)',
  warning:  'var(--color-warning)',
  critical: 'var(--color-critical)',
  inactive: 'var(--color-text-faint)',
  unknown:  'var(--color-text-faint)',
  offline: 'var(--color-critical)',
};

const LABELS = {
  healthy:  'Healthy',
  warning:  'Warning',
  critical: 'Critical',
  inactive: 'Inactive',
  unknown:  'Unknown',
  offline: 'Offline',
};

export default function StatusBadge({ status = 'unknown', label }) {
  const badgeClass =
    status === 'healthy'  ? 'badge badge-healthy'  :
    status === 'warning'  ? 'badge badge-warning'  :
    status === 'critical' || status === 'offline' ? 'badge badge-critical' :
    'badge badge-neutral';

  return (
    <span className={badgeClass} aria-label={`Status: ${label || LABELS[status]}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: DOT_COLORS[status] || DOT_COLORS.unknown,
          display: 'inline-block',
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      {label || LABELS[status]}
    </span>
  );
}
