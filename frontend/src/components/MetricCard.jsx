/**
 * MetricCard — displays a single summary metric (e.g. total servers, avg CPU).
 */
import React from 'react';

export default function MetricCard({ label, value, subValue, icon: Icon, iconBg, isLoading }) {
  return (
    <div className="summary-card">
      <div className="summary-card-header">
        <span className="summary-card-label">{label}</span>
        {Icon && (
          <div
            className="summary-card-icon"
            style={{ background: iconBg || 'var(--color-accent-dim)' }}
            aria-hidden="true"
          >
            <Icon size={16} color={iconBg ? '#fff' : 'var(--color-accent)'} />
          </div>
        )}
      </div>

      {isLoading ? (
        <div
          style={{
            height: 36,
            width: 80,
            background: 'var(--color-surface-2)',
            borderRadius: 'var(--radius-sm)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
          aria-label="Loading"
        />
      ) : (
        <div className="summary-card-value">{value ?? '—'}</div>
      )}

      {subValue && <div className="summary-card-sub">{subValue}</div>}
    </div>
  );
}
