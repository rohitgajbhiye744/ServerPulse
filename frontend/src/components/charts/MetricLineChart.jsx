/**
 * MetricLineChart — a reusable Recharts line chart for a single metric over time.
 *
 * Props:
 *   data         - array of ServerMetric objects (chronological order)
 *   dataKey      - field name in each metric object, e.g. 'cpuUsage'
 *   label        - human-readable label, e.g. 'CPU Usage'
 *   color        - line color, e.g. 'var(--chart-cpu)'
 *   unit         - value unit suffix, e.g. '%'
 *   yDomain      - [min, max] for Y axis, default [0, 100]
 *   formatValue  - optional function to format tooltip value
 */
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { formatChartTime, formatTooltipTime } from '../../utils/format.js';

// Custom tooltip component for consistent styling.
function CustomTooltip({ active, payload, label, unit, formatValue }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  const displayValue = formatValue ? formatValue(value) : value?.toFixed(2);

  return (
    <div
      style={{
        background: 'var(--color-surface-3)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        fontSize: 'var(--text-xs)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>
        {formatTooltipTime(label)}
      </div>
      <div style={{ color: payload[0]?.color, fontWeight: 600 }}>
        {displayValue}{unit}
      </div>
    </div>
  );
}

export default function MetricLineChart({
  data,
  dataKey,
  color,
  unit = '%',
  yDomain = [0, 100],
  formatValue,
  warnThreshold,
  criticalThreshold,
}) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-faint)',
          fontSize: 'var(--text-sm)',
        }}
      >
        No data available
      </div>
    );
  }

  // Prepare data for Recharts — use recordedAt as the time key.
  const chartData = data.map(m => ({
    time: m.recordedAt,
    value: m[dataKey],
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="time"
          tickFormatter={formatChartTime}
          tick={{ fill: 'var(--color-text-faint)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={60}
        />
        <YAxis
          domain={yDomain}
          tick={{ fill: 'var(--color-text-faint)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}${unit}`}
          width={44}
        />
        <Tooltip
          content={<CustomTooltip unit={unit} formatValue={formatValue} />}
          cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
        />
        {/* Optional threshold reference lines */}
        {warnThreshold != null && (
          <ReferenceLine
            y={warnThreshold}
            stroke="var(--color-warning)"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
          />
        )}
        {criticalThreshold != null && (
          <ReferenceLine
            y={criticalThreshold}
            stroke="var(--color-critical)"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
