/**
 * AlertsPage — displays persisted alerts from the ServerPulse backend.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Bell, RefreshCw, Server } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { fetchAlerts } from '../api/alerts.js';
import { useServerData } from '../hooks/useServerData.js';
import { useSettings } from '../hooks/useSettings.js';
import { formatPercent, formatTimestamp, timeAgo } from '../utils/format.js';

const DEFAULT_INTERVAL = parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '30000', 10);

function metricLabel(metricType) {
  return {
    CPU: 'CPU usage',
    MEMORY: 'Memory usage',
    DISK: 'Disk usage',
  }[metricType] || metricType || 'Metric';
}

function formatMetricValue(alert) {
  return `${formatPercent(alert.observedValue)} / ${formatPercent(alert.thresholdValue)}`;
}

function AlertRow({ alert }) {
  const severity = String(alert.severity || '').toLowerCase();
  const isResolved = alert.status === 'RESOLVED';

  return (
    <tr>
      <td>
        <StatusBadge
          status={severity === 'critical' ? 'critical' : 'warning'}
          label={alert.severity || 'Unknown'}
        />
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Server size={14} color="var(--color-text-faint)" aria-hidden="true" />
          <span style={{ fontWeight: 500 }}>{alert.serverName}</span>
        </div>
      </td>
      <td>{metricLabel(alert.metricType)}</td>
      <td>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
          {formatMetricValue(alert)}
        </span>
        <div className="text-faint text-xs">observed / threshold</div>
      </td>
      <td>
        <StatusBadge
          status={isResolved ? 'inactive' : 'healthy'}
          label={alert.status || 'Unknown'}
        />
      </td>
      <td>
        <span title={alert.createdAt || ''}>{formatTimestamp(alert.createdAt)}</span>
        <div className="text-faint text-xs">{timeAgo(alert.createdAt)}</div>
      </td>
      <td>
        {alert.resolvedAt ? (
          <>
            <span>{formatTimestamp(alert.resolvedAt)}</span>
            <div className="text-faint text-xs">{timeAgo(alert.resolvedAt)}</div>
          </>
        ) : (
          <span className="text-faint">—</span>
        )}
      </td>
    </tr>
  );
}

export default function AlertsPage({ onLogout }) {
  const { settings } = useSettings();
  const refreshInterval = settings.refreshInterval ?? DEFAULT_INTERVAL;
  const { servers } = useServerData(refreshInterval);
  const [filters, setFilters] = useState({
    serverName: '',
    severity: '',
    status: '',
  });
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const isFetching = useRef(false);
  const isMounted = useRef(true);

  const load = useCallback(async (initial = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    if (initial) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await fetchAlerts(filters);
      if (!isMounted.current) return;
      setAlerts(data);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      if (!isMounted.current) return;
      setError(err);
    } finally {
      isFetching.current = false;
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    isMounted.current = true;
    load(true);
    return () => { isMounted.current = false; };
  }, [load]);

  useEffect(() => {
    if (refreshInterval <= 0) return undefined;
    const timerId = setInterval(() => load(false), refreshInterval);
    return () => clearInterval(timerId);
  }, [load, refreshInterval]);

  const updateFilter = (name, value) => {
    setFilters(previous => ({ ...previous, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ serverName: '', severity: '', status: '' });
  };

  return (
    <DashboardLayout
      title="Alerts"
      onLogout={onLogout}
      lastRefreshed={lastRefreshed}
      isStale={Boolean(error && alerts.length)}
      onRefresh={() => load(false)}
      isRefreshing={isRefreshing}
    >
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <Bell size={18} color="var(--color-accent)" aria-hidden="true" />
          <div>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Persisted Alerts</h2>
            <p className="text-muted text-sm">
              Alerts are generated and stored by the backend from submitted metrics.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'end' }}>
          <label className="text-xs text-muted" htmlFor="alerts-server-filter">
            Server
            <select
              id="alerts-server-filter"
              className="settings-input"
              value={filters.serverName}
              onChange={event => updateFilter('serverName', event.target.value)}
              style={{ display: 'block', minWidth: 180, marginTop: 4 }}
            >
              <option value="">All servers</option>
              {servers.map(server => (
                <option key={server.id} value={server.name}>{server.name}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted" htmlFor="alerts-severity-filter">
            Severity
            <select
              id="alerts-severity-filter"
              className="settings-input"
              value={filters.severity}
              onChange={event => updateFilter('severity', event.target.value)}
              style={{ display: 'block', minWidth: 140, marginTop: 4 }}
            >
              <option value="">All severities</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </label>
          <label className="text-xs text-muted" htmlFor="alerts-status-filter">
            Status
            <select
              id="alerts-status-filter"
              className="settings-input"
              value={filters.status}
              onChange={event => updateFilter('status', event.target.value)}
              style={{ display: 'block', minWidth: 140, marginTop: 4 }}
            >
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </label>
          <button className="btn btn-ghost btn-sm" onClick={clearFilters} type="button">
            Clear filters
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => load(false)}
            disabled={isRefreshing}
            type="button"
            aria-label="Refresh alerts"
          >
            <RefreshCw size={13} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading alerts…" />
      ) : error && alerts.length === 0 ? (
        <ErrorState error={error} onRetry={() => load(true)} />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={error ? AlertCircle : Bell}
          title={error ? 'Unable to load alerts' : 'No alerts found'}
          description={error
            ? 'The backend alert API could not be reached. No sample or browser-generated alerts are shown.'
            : 'No persisted alerts match the selected filters.'}
        />
      ) : (
        <div className="table-wrapper">
          <table aria-label="Persisted alerts">
            <thead>
              <tr>
                <th scope="col">Severity</th>
                <th scope="col">Server</th>
                <th scope="col">Metric</th>
                <th scope="col">Value / Threshold</th>
                <th scope="col">Status</th>
                <th scope="col">Created</th>
                <th scope="col">Resolved</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => <AlertRow key={alert.id} alert={alert} />)}
            </tbody>
          </table>
        </div>
      )}

      {error && alerts.length > 0 && (
        <p className="text-muted text-xs" role="status" style={{ marginTop: 'var(--space-3)' }}>
          The latest refresh failed; showing the last successful alert data.
        </p>
      )}
    </DashboardLayout>
  );
}
