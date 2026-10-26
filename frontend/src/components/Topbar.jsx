/**
 * Topbar — the sticky top navigation bar.
 * Shows page title, backend connectivity, last refresh time, and refresh button.
 */
import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { checkHealth } from '../api/health.js';
import { timeAgo } from '../utils/format.js';

export default function Topbar({ title, breadcrumb, lastRefreshed, isStale, onRefresh, isRefreshing }) {
  const [health, setHealth] = useState({ reachable: null, status: null });

  // Check backend health on mount and every 30 seconds.
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const result = await checkHealth();
      if (mounted) setHealth(result);
    };
    check();
    const id = setInterval(check, 30_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const isUp = health.reachable === true;
  const isDown = health.reachable === false;

  return (
    <header className="topbar" role="banner">
      {/* Title / breadcrumb */}
      <div>
        {breadcrumb ? (
          <div className="topbar-breadcrumb" aria-label="Breadcrumb">
            {breadcrumb}
          </div>
        ) : (
          <h1 className="topbar-title">{title}</h1>
        )}
      </div>

      {/* Right-side controls */}
      <div className="topbar-right">
        {/* Stale data warning */}
        {isStale && (
          <div className="stale-warning" role="status" aria-live="polite">
            <AlertTriangle size={12} aria-hidden="true" />
            <span>Data may be outdated</span>
          </div>
        )}

        {/* Last refresh time */}
        {lastRefreshed && (
          <div className="refresh-info" aria-label={`Last refreshed: ${timeAgo(lastRefreshed)}`}>
            <Clock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} aria-hidden="true" />
            {timeAgo(lastRefreshed)}
          </div>
        )}

        {/* Backend connectivity indicator */}
        <div className="connectivity-indicator" aria-label={`Backend: ${isUp ? 'reachable' : isDown ? 'unreachable' : 'checking'}`}>
          {isUp && <CheckCircle2 size={13} color="var(--color-healthy)" aria-hidden="true" />}
          {isDown && <XCircle size={13} color="var(--color-critical)" aria-hidden="true" />}
          {health.reachable === null && <span className="connectivity-dot" aria-hidden="true" />}
          <span className="text-xs">
            {isUp ? 'Backend up' : isDown ? 'Backend down' : 'Checking…'}
          </span>
        </div>

        {/* Manual refresh button */}
        {onRefresh && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            id="topbar-refresh-btn"
            aria-label="Refresh data"
          >
            <RefreshCw
              size={13}
              aria-hidden="true"
              style={{ animation: isRefreshing ? 'spin 0.7s linear infinite' : 'none' }}
            />
            Refresh
          </button>
        )}
      </div>
    </header>
  );
}
