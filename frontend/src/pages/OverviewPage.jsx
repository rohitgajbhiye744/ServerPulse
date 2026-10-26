/**
 * OverviewPage — the main monitoring dashboard.
 *
 * Displays:
 * - Summary cards: total servers, active servers, avg CPU, avg memory.
 * - Server inventory table with latest metrics.
 * - A quick chart for the first active server (if any).
 */
import React, { useEffect, useState } from 'react';
import { Server, Activity, Cpu, MemoryStick } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import MetricCard from '../components/MetricCard.jsx';
import ServerTable from '../components/ServerTable.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useServerData } from '../hooks/useServerData.js';
import { fetchLatestMetric } from '../api/metrics.js';
import { formatPercent, average } from '../utils/format.js';

export default function OverviewPage({ onLogout }) {
  const { servers, isLoading, error, lastRefreshed, isStale, refresh } = useServerData();

  // Fetch latest metric for each server to populate the table and summary cards.
  const [latestMetrics, setLatestMetrics] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(false);

  useEffect(() => {
    if (!servers || servers.length === 0) {
      setLatestMetrics({});
      return;
    }

    let cancelled = false;
    setMetricsLoading(true);

    // Fetch all servers' latest metrics concurrently.
    Promise.allSettled(
      servers.map(s => fetchLatestMetric(s.name).then(m => ({ name: s.name, metric: m })))
    ).then(results => {
      if (cancelled) return;
      const map = {};
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value.metric) {
          map[r.value.name] = r.value.metric;
        }
      });
      setLatestMetrics(map);
      setMetricsLoading(false);
    });

    return () => { cancelled = true; };
  }, [servers]);

  // Re-fetch latest metrics when manual refresh triggered.
  const handleRefresh = () => {
    refresh();
  };

  // Summary calculations.
  const totalServers  = servers.length;
  const activeServers = servers.filter(s => s.active).length;

  const metricsValues = Object.values(latestMetrics);
  const avgCpu = average(metricsValues.map(m => m.cpuUsage));
  const avgMem = average(metricsValues.map(m => m.memoryUsage));

  const isDataLoading = isLoading || metricsLoading;

  return (
    <DashboardLayout
      title="Overview"
      onLogout={onLogout}
      lastRefreshed={lastRefreshed}
      isStale={isStale}
      onRefresh={handleRefresh}
    >
      {/* Summary cards */}
      <div className="summary-grid" aria-label="Summary metrics">
        <MetricCard
          label="Total Servers"
          value={isLoading ? undefined : totalServers}
          subValue="Registered"
          icon={Server}
          iconBg="rgba(59, 130, 246, 0.2)"
          isLoading={isLoading}
        />
        <MetricCard
          label="Active Servers"
          value={isLoading ? undefined : activeServers}
          subValue={isLoading ? undefined : `${totalServers - activeServers} inactive`}
          icon={Activity}
          iconBg="rgba(34, 197, 94, 0.2)"
          isLoading={isLoading}
        />
        <MetricCard
          label="Avg CPU"
          value={isDataLoading ? undefined : (avgCpu != null ? formatPercent(avgCpu) : '—')}
          subValue={avgCpu == null && !isDataLoading ? 'No metric data' : 'Across reporting servers'}
          icon={Cpu}
          iconBg="rgba(139, 92, 246, 0.2)"
          isLoading={isDataLoading}
        />
        <MetricCard
          label="Avg Memory"
          value={isDataLoading ? undefined : (avgMem != null ? formatPercent(avgMem) : '—')}
          subValue={avgMem == null && !isDataLoading ? 'No metric data' : 'Across reporting servers'}
          icon={MemoryStick}
          iconBg="rgba(6, 182, 212, 0.2)"
          isLoading={isDataLoading}
        />
      </div>

      {/* Server inventory */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h2 className="section-heading">
          <Server size={16} aria-hidden="true" color="var(--color-text-muted)" />
          Server Inventory
        </h2>

        {isLoading ? (
          <LoadingState message="Loading servers…" />
        ) : error ? (
          <ErrorState error={error} onRetry={handleRefresh} />
        ) : (
          <ServerTable servers={servers} latestMetrics={latestMetrics} />
        )}
      </div>

      {/* Data note */}
      {!isLoading && !error && servers.length > 0 && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 'var(--space-4)' }}>
          Click a server row to view its metric history and charts.
          &ldquo;Active&rdquo; means the server record is not deactivated — it does not confirm
          the remote agent is currently running.
        </p>
      )}
    </DashboardLayout>
  );
}
