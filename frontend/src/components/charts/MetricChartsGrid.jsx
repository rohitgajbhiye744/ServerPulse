/**
 * MetricChartsGrid — renders all five metric charts for a selected server.
 * Accepts metric history data and settings (for threshold lines).
 */
import React from 'react';
import { Cpu, MemoryStick, HardDrive, Activity, AlertCircle } from 'lucide-react';
import MetricLineChart from './MetricLineChart.jsx';
import { formatLoadAverage } from '../../utils/format.js';

const CHARTS = [
  {
    key:       'cpuUsage',
    label:     'CPU Usage',
    unit:      '%',
    color:     'var(--chart-cpu)',
    Icon:      Cpu,
    yDomain:   [0, 100],
    warnKey:   'cpuWarnThreshold',
    critKey:   'cpuCriticalThreshold',
  },
  {
    key:       'memoryUsage',
    label:     'Memory Usage',
    unit:      '%',
    color:     'var(--chart-memory)',
    Icon:      MemoryStick,
    yDomain:   [0, 100],
    warnKey:   'memWarnThreshold',
    critKey:   'memCriticalThreshold',
  },
  {
    key:       'diskUsage',
    label:     'Disk Usage',
    unit:      '%',
    color:     'var(--chart-disk)',
    Icon:      HardDrive,
    yDomain:   [0, 100],
    warnKey:   'diskWarnThreshold',
    critKey:   'diskCriticalThreshold',
  },
  {
    key:          'loadAverage',
    label:        'Load Average',
    unit:         '',
    color:        'var(--chart-load)',
    Icon:         Activity,
    yDomain:      [0, 'auto'],
    formatValue:  v => formatLoadAverage(v),
  },
  {
    key:          'logErrorCount',
    label:        'Log Error Count',
    unit:         '',
    color:        'var(--chart-errors)',
    Icon:         AlertCircle,
    yDomain:      [0, 'auto'],
    formatValue:  v => v?.toFixed(0),
  },
];

export default function MetricChartsGrid({ history, settings }) {
  return (
    <div className="charts-grid">
      {CHARTS.map(({ key, label, unit, color, Icon, yDomain, formatValue, warnKey, critKey }) => (
        <div key={key} className="chart-card">
          <div className="chart-title">
            <Icon size={14} aria-hidden="true" color={color} />
            {label}
          </div>
          <MetricLineChart
            data={history}
            dataKey={key}
            color={color}
            unit={unit}
            yDomain={yDomain}
            formatValue={formatValue}
            warnThreshold={settings && warnKey ? settings[warnKey] : undefined}
            criticalThreshold={settings && critKey ? settings[critKey] : undefined}
          />
        </div>
      ))}
    </div>
  );
}
