/**
 * MetricsPage — detailed metric exploration for a selected server.
 *
 * - Server is selected via URL query param (?server=name) or a dropdown.
 * - Displays all five metric charts using historical data.
 * - Shows data freshness and handles servers with no metrics.
 *
 * Note: The backend returns the 100 most recent metric records.
 * This page displays all of them in chronological order.
 * Arbitrary date range queries are not supported by the backend.
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart2, Server, Info, Clock } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import MetricChartsGrid from '../components/charts/MetricChartsGrid.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useServerData } from '../hooks/useServerData.js';
import { useMetrics } from '../hooks/useMetrics.js';
import { useSettings } from '../hooks/useSettings.js';
import { formatTimestamp, timeAgo } from '../utils/format.js';

export default function MetricsPage({ onLogout }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { servers, isLoading: serversLoading } = useServerData();
  const { settings } = useSettings();

  // The currently selected server name (from URL or default to first server).
  const urlServer = searchParams.get('server') || '';
  const [selectedServer, setSelectedServer] = useState(urlServer);

  // Once servers load, default to first active server if none selected.
  useEffect(() => {
    if (!selectedServer && servers.length > 0) {
      const first = servers.find(s => s.active) || servers[0];
      setSelectedServer(first.name);
      setSearchParams({ server: first.name }, { replace: true });
    }
  }, [servers, selectedServer, setSearchParams]);

  const { history, latest, isLoading: metricsLoading, error, lastRefreshed, isStale, refresh } =
    useMetrics(selectedServer, settings.refreshInterval);

  const handleServerChange = (e) => {
    const name = e.target.value;
    setSelectedServer(name);
    setSearchParams({ server: name });
  };

  return (
    <DashboardLayout
      title="Metrics"
      onLogout={onLogout}
      lastRefreshed={lastRefreshed}
      isStale={isStale}
      onRefresh={refresh}
    >
      {/* Server selector */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label htmlFor="metrics-server-select" className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
          Select Server
        </label>
        {serversLoading ? (
          <div style={{ height: 36, width: 200, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }} aria-label="Loading servers" />
        ) : (
          <select
            id="metrics-server-select"
            className="server-selector"
            value={selectedServer}
            onChange={handleServerChange}
            disabled={servers.length === 0}
            aria-label="Choose a server to view metrics for"
          >
            {servers.length === 0 && <option value="">No servers registered</option>}
            {servers.map(s => (
              <option key={s.id} value={s.name}>
                {s.name}{!s.active ? ' (inactive)' : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* No server registered */}
      {!serversLoading && servers.length === 0 && (
        <EmptyState
          icon={Server}
          title="No servers registered"
          description="Register a server with the backend admin API first."
        />
      )}

      {/* Metric content */}
      {selectedServer && (
        <>
          {/* Data range notice */}
          <div className="alert-banner info" role="note" style={{ marginBottom: 'var(--space-4)' }}>
            <Info size={14} aria-hidden="true" />
            <span>
              Showing the <strong>100 most recent metric records</strong> for{' '}
              <strong>{selectedServer}</strong>. The backend does not support arbitrary date-range
              queries — all available history is displayed.
            </span>
          </div>

          {/* Latest snapshot */}
          {latest && (
            <div className="card card-sm" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} color="var(--color-text-muted)" aria-hidden="true" />
                <span className="text-muted text-xs">Last metric received:</span>
                <span className="font-mono text-xs">{formatTimestamp(latest.recordedAt)}</span>
                <span className="text-faint text-xs">({timeAgo(latest.recordedAt)})</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <span className="text-xs"><span className="text-muted">CPU:</span> <span className="font-mono">{latest.cpuUsage?.toFixed(1)}%</span></span>
                <span className="text-xs"><span className="text-muted">Mem:</span> <span className="font-mono">{latest.memoryUsage?.toFixed(1)}%</span></span>
                <span className="text-xs"><span className="text-muted">Disk:</span> <span className="font-mono">{latest.diskUsage?.toFixed(1)}%</span></span>
                <span className="text-xs"><span className="text-muted">Load:</span> <span className="font-mono">{latest.loadAverage?.toFixed(2)}</span></span>
                <span className="text-xs"><span className="text-muted">Errors:</span> <span className="font-mono">{latest.logErrorCount}</span></span>
              </div>
            </div>
          )}

          {/* Charts */}
          {metricsLoading ? (
            <LoadingState message={`Loading metrics for ${selectedServer}…`} />
          ) : error ? (
            <ErrorState error={error} onRetry={refresh} />
          ) : history.length === 0 ? (
            <EmptyState
              icon={BarChart2}
              title="No metric data"
              description={`${selectedServer} is registered but has not submitted any metrics yet. Ensure the monitoring agent is running.`}
            />
          ) : (
            <MetricChartsGrid history={history} settings={settings} />
          )}

          {/* Record count */}
          {!metricsLoading && !error && history.length > 0 && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 'var(--space-2)' }}>
              {history.length} record{history.length !== 1 ? 's' : ''} displayed
              {history.length >= 100 ? ' (maximum — older records not available via the current API)' : ''}.
            </p>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
