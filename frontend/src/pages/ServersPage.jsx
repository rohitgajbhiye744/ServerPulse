/**
 * ServersPage — full server inventory with a detail panel.
 *
 * Lists all registered servers. Clicking a server opens its latest metric
 * snapshot in a side panel. A link navigates to the full Metrics page.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, BarChart2, Clock, Cpu, MemoryStick, HardDrive, Activity, AlertCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { useServerData } from '../hooks/useServerData.js';
import { fetchLatestMetric } from '../api/metrics.js';
import {
  formatPercent,
  formatLoadAverage,
  formatTimestamp,
  timeAgo,
  getStatusLevel,
} from '../utils/format.js';
import { deriveServerStatus } from '../utils/serverStatus.js';

function ServerDetail({ server, onViewMetrics }) {
  const [latest, setLatest] = useState(undefined); // undefined=loading, null=no data
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!server) return;
    let cancelled = false;
    setLatest(undefined);
    setFetchError(null);

    fetchLatestMetric(server.name)
      .then(m => { if (!cancelled) setLatest(m); })
      .catch(err => { if (!cancelled) { setFetchError(err); setLatest(null); } });

    return () => { cancelled = true; };
  }, [server]);

  if (!server) {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <p className="text-muted text-sm">Select a server to view details</p>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Server size={16} color="var(--color-accent)" aria-hidden="true" />
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{server.name}</h2>
          </div>
          <StatusBadge status={deriveServerStatus(server, latest)} />
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onViewMetrics(server.name)}
          id={`view-metrics-${server.id}`}
          aria-label={`View full metrics for ${server.name}`}
        >
          <BarChart2 size={13} aria-hidden="true" />
          Full Metrics
        </button>
      </div>

      {/* Latest metrics */}
      {latest === undefined ? (
        <LoadingState message="Fetching latest metrics…" />
      ) : fetchError ? (
        <ErrorState error={fetchError} />
      ) : latest === null ? (
        <div className="state-container" style={{ padding: 'var(--space-6) 0' }}>
          <Clock size={28} className="state-icon" aria-hidden="true" />
          <p className="state-title" style={{ fontSize: 'var(--text-base)' }}>No metrics yet</p>
          <p className="state-description">
            This server is registered but has not submitted any metric data.
            Make sure the monitoring agent is running.
          </p>
        </div>
      ) : (
        <>
          <div className="metric-row">
            <span className="metric-label"><Clock size={13} aria-hidden="true" /> Last reported</span>
            <span className="metric-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
              {formatTimestamp(latest.recordedAt)}{' '}
              <span className="text-faint">({timeAgo(latest.recordedAt)})</span>
            </span>
          </div>

          {[
            { label: 'CPU Usage',    key: 'cpuUsage',    Icon: Cpu,         unit: '%', format: formatPercent },
            { label: 'Memory Usage', key: 'memoryUsage', Icon: MemoryStick, unit: '%', format: formatPercent },
            { label: 'Disk Usage',   key: 'diskUsage',   Icon: HardDrive,   unit: '%', format: formatPercent, warn: 80, crit: 95 },
            { label: 'Load Average', key: 'loadAverage', Icon: Activity,    unit: '',  format: formatLoadAverage },
            { label: 'Log Errors',   key: 'logErrorCount', Icon: AlertCircle, unit: '', format: v => String(v) },
          ].map(({ label, key, Icon, format, warn = 70, crit = 90 }) => {
            const val = latest[key];
            const level = typeof val === 'number' ? getStatusLevel(val, warn, crit) : 'healthy';
            const color = level === 'critical' ? 'var(--color-critical)' : level === 'warning' ? 'var(--color-warning)' : 'var(--color-text)';

            return (
              <div key={key} className="metric-row">
                <span className="metric-label">
                  <Icon size={13} aria-hidden="true" />
                  {label}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div className="metric-value" style={{ color }}>{format(val)}</div>
                  {(key === 'cpuUsage' || key === 'memoryUsage' || key === 'diskUsage') && (
                    <div style={{ width: 80, marginTop: 4 }}>
                      <ProgressBar value={val} warn={warn} critical={crit} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default function ServersPage({ onLogout }) {
  const { servers, isLoading, error, lastRefreshed, isStale, refresh } = useServerData();
  const [selected, setSelected] = useState(null);
  const [latestMetrics, setLatestMetrics] = useState({});
  const navigate = useNavigate();

  // Auto-select first server when list loads.
  useEffect(() => {
    if (servers.length > 0 && !selected) {
      setSelected(servers[0]);
    }
  }, [servers, selected]);

  // Keep list statuses in sync with the latest metric received from each agent.
  useEffect(() => {
    if (servers.length === 0) {
      setLatestMetrics({});
      return undefined;
    }

    let cancelled = false;
    Promise.allSettled(
      servers.map(server =>
        fetchLatestMetric(server.name).then(metric => ({ name: server.name, metric }))
      )
    ).then(results => {
      if (cancelled) return;
      const metrics = {};
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.metric) {
          metrics[result.value.name] = result.value.metric;
        }
      });
      setLatestMetrics(metrics);
    });

    return () => { cancelled = true; };
  }, [servers]);

  // Replace the selected object after a refresh so its active flag stays current.
  useEffect(() => {
    if (!selected) return;
    const current = servers.find(server => server.id === selected.id);
    if (current && current !== selected) setSelected(current);
  }, [servers, selected]);

  const handleViewMetrics = (serverName) => {
    navigate(`/metrics?server=${encodeURIComponent(serverName)}`);
  };

  return (
    <DashboardLayout
      title="Servers"
      onLogout={onLogout}
      lastRefreshed={lastRefreshed}
      isStale={isStale}
      onRefresh={refresh}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-4)', alignItems: 'start' }}>
        {/* Server list */}
        <div>
          <h2 className="section-heading">
            <Server size={16} aria-hidden="true" color="var(--color-text-muted)" />
            Registered Servers
          </h2>

          {isLoading ? (
            <LoadingState message="Loading servers…" />
          ) : error ? (
            <ErrorState error={error} onRetry={refresh} />
          ) : servers.length === 0 ? (
            <EmptyState
              icon={Server}
              title="No servers registered"
              description="Use the backend admin API to register a server. It will appear here once registered."
            />
          ) : (
            <div className="table-wrapper">
              <table aria-label="Server list">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">ID</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {servers.map(server => {
                    const status = deriveServerStatus(server, latestMetrics[server.name]);
                    return (
                      <tr
                        key={server.id}
                        className="clickable"
                        onClick={() => setSelected(server)}
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter') setSelected(server); }}
                        aria-selected={selected?.id === server.id}
                        style={{
                          background: selected?.id === server.id ? 'var(--color-accent-dim)' : undefined,
                        }}
                      >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Server size={13} color="var(--color-text-faint)" aria-hidden="true" />
                          <span style={{ fontWeight: 500 }}>{server.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-muted">#{server.id}</span>
                      </td>
                        <td>
                          <StatusBadge status={status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div>
          <h2 className="section-heading">
            <BarChart2 size={16} aria-hidden="true" color="var(--color-text-muted)" />
            Latest Snapshot
          </h2>
          <ServerDetail server={selected} onViewMetrics={handleViewMetrics} />
        </div>
      </div>

      {/* Note about active status */}
      {!isLoading && !error && servers.length > 0 && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 'var(--space-6)' }}>
          &ldquo;Offline&rdquo; means no metric has been received for more than two minutes.
          &ldquo;Inactive&rdquo; means the server was disabled in the database.
        </p>
      )}
    </DashboardLayout>
  );
}
