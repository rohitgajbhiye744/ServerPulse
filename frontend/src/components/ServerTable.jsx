/**
 * ServerTable — a responsive table of registered servers.
 * Clicking a row navigates to the server detail / metrics page.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import ProgressBar from './ProgressBar.jsx';
import EmptyState from './EmptyState.jsx';
import { formatPercent, formatTimestamp } from '../utils/format.js';
import { deriveServerStatus } from '../utils/serverStatus.js';

export default function ServerTable({ servers, latestMetrics = {} }) {
  const navigate = useNavigate();

  if (servers.length === 0) {
    return (
      <EmptyState
        icon={Server}
        title="No servers registered"
        description="Register a server with the backend admin API to start monitoring it."
      />
    );
  }

  return (
    <div className="table-wrapper">
      <table aria-label="Registered servers">
        <thead>
          <tr>
            <th scope="col">Server</th>
            <th scope="col">Status</th>
            <th scope="col">CPU</th>
            <th scope="col">Memory</th>
            <th scope="col">Disk</th>
            <th scope="col">Last Seen</th>
            <th scope="col" aria-label="View details" />
          </tr>
        </thead>
        <tbody>
          {servers.map(server => {
            const latest = latestMetrics[server.name];
            const status = deriveServerStatus(server, latest);

            return (
              <tr
                key={server.id}
                className="clickable"
                onClick={() => navigate(`/servers/${encodeURIComponent(server.name)}`)}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/servers/${encodeURIComponent(server.name)}`);
                  }
                }}
                aria-label={`View details for ${server.name}`}
              >
                {/* Server name */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Server size={14} color="var(--color-text-faint)" aria-hidden="true" />
                    <span style={{ fontWeight: 500 }}>{server.name}</span>
                  </div>
                </td>

                {/* Status */}
                <td>
                  <StatusBadge status={status} />
                  {status === 'unknown' && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 2 }}>
                      No metrics yet
                    </div>
                  )}
                </td>

                {/* CPU */}
                <td>
                  {latest ? (
                    <div style={{ minWidth: 80 }}>
                      <div style={{ marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                        {formatPercent(latest.cpuUsage)}
                      </div>
                      <ProgressBar value={latest.cpuUsage} />
                    </div>
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </td>

                {/* Memory */}
                <td>
                  {latest ? (
                    <div style={{ minWidth: 80 }}>
                      <div style={{ marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                        {formatPercent(latest.memoryUsage)}
                      </div>
                      <ProgressBar value={latest.memoryUsage} />
                    </div>
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </td>

                {/* Disk */}
                <td>
                  {latest ? (
                    <div style={{ minWidth: 80 }}>
                      <div style={{ marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                        {formatPercent(latest.diskUsage)}
                      </div>
                      <ProgressBar value={latest.diskUsage} warn={80} critical={95} />
                    </div>
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </td>

                {/* Last seen */}
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                    {latest ? formatTimestamp(latest.recordedAt) : '—'}
                  </span>
                </td>

                {/* Chevron */}
                <td style={{ width: 32, textAlign: 'center' }}>
                  <ChevronRight size={14} color="var(--color-text-faint)" aria-hidden="true" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
