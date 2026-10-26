/**
 * useMetrics — fetches metric history and latest metric for one server.
 *
 * Features:
 * - Loads data when serverName changes.
 * - Auto-refreshes at the configured interval.
 * - Prevents overlapping requests.
 * - Preserves last good data when a refresh fails.
 * - Cleans up timers on unmount or server change.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMetricHistory, fetchLatestMetric } from '../api/metrics.js';

const DEFAULT_INTERVAL = parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '30000', 10);

export function useMetrics(serverName, refreshInterval = DEFAULT_INTERVAL) {
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isStale, setIsStale] = useState(false);

  const isFetching = useRef(false);
  const isMounted = useRef(true);

  const load = useCallback(async (isFirstLoad = false) => {
    if (!serverName || isFetching.current) return;
    isFetching.current = true;

    if (isFirstLoad) setIsLoading(true);

    try {
      // Fetch both endpoints concurrently.
      const [historyData, latestData] = await Promise.all([
        fetchMetricHistory(serverName),
        fetchLatestMetric(serverName),
      ]);

      if (!isMounted.current) return;
      setHistory(historyData);
      setLatest(latestData);
      setLastRefreshed(new Date());
      setError(null);
      setIsStale(false);
    } catch (err) {
      if (!isMounted.current) return;
      if (!isFirstLoad) {
        setIsStale(true);
      } else {
        setHistory([]);
        setLatest(null);
      }
      setError(err);
    } finally {
      if (isMounted.current) setIsLoading(false);
      isFetching.current = false;
    }
  }, [serverName]);

  // Load fresh when serverName changes.
  useEffect(() => {
    isMounted.current = true;
    setHistory([]);
    setLatest(null);
    setError(null);
    setIsStale(false);
    load(true);
    return () => { isMounted.current = false; };
  }, [load]);

  // Auto-refresh.
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0 || !serverName) return;
    const timerId = setInterval(() => load(false), refreshInterval);
    return () => clearInterval(timerId);
  }, [load, refreshInterval, serverName]);

  const refresh = useCallback(() => load(false), [load]);

  return { history, latest, isLoading, error, lastRefreshed, isStale, refresh };
}
