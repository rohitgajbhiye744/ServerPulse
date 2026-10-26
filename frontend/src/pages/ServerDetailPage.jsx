/**
 * ServerDetailPage — shown when the user navigates to /servers/:serverName
 * from the server table in the Overview or Servers page.
 *
 * Displays the latest metric snapshot + full chart history for one server.
 */
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Server, BarChart2, ChevronLeft, Clock, Cpu, MemoryStick, HardDrive, Activity, AlertCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import MetricChartsGrid from '../components/charts/MetricChartsGrid.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { useMetrics } from '../hooks/useMetrics.js';
import { useSettings } from '../hooks/useSettings.js';
import { formatPercent, formatLoadAverage, formatTimestamp, timeAgo, getStatusLevel } from '../utils/format.js';

export default function ServerDetailPage({ onLogout }) {
  const { serverName } = useParams();
  const { settings } = useSettings();
  const { history, latest, isLoading, error, lastRefreshed, isStale, refresh } =
    useMetrics(serverName, settings.refreshInterval);

  const decodedName = decodeURIComponent(serverName || '');

  const breadcrumb = (
    <>
      <Link to="/servers" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
        <ChevronLeft size={14} style={{ display: 'inline', verticalAlign: 'middle' }} aria-hidden="true" />
        Servers
      </Link>
      <span style={{ color: 'var(--color-text-faint)' }}>›</span>
      <span style={{ color: 'var(--color-text)' }}>{decodedName}</span>
    </>
  );

  return (
    <DashboardLayout
      title={decodedName}
      breadcrumb={breadcrumb}
      onLogout={onLogout}
      lastRefreshed={lastRefreshed}
      isStale={isStale}
      onRefresh={refresh}
    >
      {/* Latest metrics panel */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
          <Server size={18} color="var(--color-accent)" aria-hidden="true" />
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>{decodedName}</h2>
          {latest && <StatusBadge status="healthy" label="Reporting" />}
          {!latest && !isLoading && <StatusBadge status="unknown" label="No metrics" />}
        </div>

        {isLoading ? (
          <LoadingState message="Fetching latest metrics…" />
        ) : error ? (
          <ErrorState error={error} onRetry={refresh} />
        ) : latest === null ? (
          <div className="state-container" style={{ padding: 'var(--space-6) 0' }}>
            <Clock size={28} className="state-icon" aria-hidden="true" />
            <h3 className="state-title">No metrics yet</h3>
            <p className="state-description">
              {decodedName} is registered but no metric data has been received.
              Start the monitoring agent on that server.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            {[
              { label: 'CPU Usage',    value: formatPercent(latest.cpuUsage),    raw: latest.cpuUsage,    Icon: Cpu,          warn: settings.cpuWarnThreshold,  crit: settings.cpuCriticalThreshold, showBar: true },
              { label: 'Memory Usage', value: formatPercent(latest.memoryUsage), raw: latest.memoryUsage, Icon: MemoryStick,  warn: settings.memWarnThreshold,  crit: settings.memCriticalThreshold, showBar: true },
              { label: 'Disk Usage',   value: formatPercent(latest.diskUsage),   raw: latest.diskUsage,   Icon: HardDrive,    warn: settings.diskWarnThreshold, crit: settings.diskCriticalThreshold, showBar: true },
              { label: 'Load Avg',     value: formatLoadAverage(latest.loadAverage), raw: null,            Icon: Activity,    warn: null, crit: null, showBar: false },
              { label: 'Log Errors',   value: String(latest.logErrorCount),          raw: null,            Icon: AlertCircle, warn: null, crit: null, showBar: false },
            ].map(({ label, value, raw, Icon, warn, crit, showBar }) => {
              const level = raw != null ? getStatusLevel(raw, warn, crit) : 'healthy';
              const textColor = level === 'critical' ? 'var(--color-critical)' : level === 'warning' ? 'var(--color-warning)' : 'var(--color-text)';
              return (
                <div key={label} style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Icon size={13} color="var(--color-text-muted)" aria-hidden="true" />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
                  </div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: textColor }}>
                    {value}
                  </div>
                  {showBar && raw != null && (
                    <div style={{ marginTop: 8 }}>
                      <ProgressBar value={raw} warn={warn} critical={crit} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {latest && (
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={12} color="var(--color-text-faint)" aria-hidden="true" />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
              Last reported: {formatTimestamp(latest.recordedAt)} ({timeAgo(latest.recordedAt)})
            </span>
          </div>
        )}
      </div>

      {/* Chart history */}
      <h2 className="section-heading">
        <BarChart2 size={16} aria-hidden="true" color="var(--color-text-muted)" />
        Metric History
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontWeight: 400, marginLeft: 'auto' }}>
          Up to 100 most recent records
        </span>
      </h2>

      {isLoading ? (
        <LoadingState message="Loading metric history…" />
      ) : error ? (
        <ErrorState error={error} onRetry={refresh} />
      ) : history.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No history available"
          description="No metric data has been recorded for this server yet."
        />
      ) : (
        <>
          <MetricChartsGrid history={history} settings={settings} />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 4 }}>
            {history.length} records displayed{history.length >= 100 ? ' (maximum)' : ''}.
            Threshold reference lines reflect your Settings configuration.
          </p>
        </>
      )}
    </DashboardLayout>
  );
}
