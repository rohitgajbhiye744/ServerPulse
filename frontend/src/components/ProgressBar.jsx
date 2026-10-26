/**
 * ProgressBar — a visual percentage bar with status-aware coloring.
 */
import React from 'react';
import { getStatusLevel } from '../utils/format.js';

export default function ProgressBar({ value, warn = 70, critical = 90 }) {
  const level = getStatusLevel(value, warn, critical);
  const width = Math.min(Math.max(value || 0, 0), 100);

  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${value?.toFixed(1)}%`}
    >
      <div
        className={`progress-fill ${level}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
