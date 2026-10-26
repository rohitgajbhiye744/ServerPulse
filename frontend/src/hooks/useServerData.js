/**
 * useServerData — fetches the registered server list with auto-refresh.
 *
 * Features:
 * - Loads data immediately on mount.
 * - Automatically refreshes at the configured interval.
 * - Prevents overlapping requests.
 * - Preserves last successful data when a refresh fails (stale-data warning).
 * - Cleans up timers on unmount.
 * - Exposes a manual refresh trigger.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchServers } from '../api/servers.js';

const DEFAULT_INTERVAL = parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '30000', 10);

export function useServerData(refreshInterval = DEFAULT_INTERVAL) {
  const [servers, setServers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isStale, setIsStale] = useState(false);

  // Guard against overlapping in-flight requests.
  const isFetching = useRef(false);
  // Guard against state updates after unmount.
  const isMounted = useRef(true);

  const load = useCallback(async (isFirstLoad = false) => {
    if (isFetching.current) return;
    isFetching.current = true;

    if (isFirstLoad) setIsLoading(true);

    try {
      const data = await fetchServers();
      if (!isMounted.current) return;
      setServers(data);
      setLastRefreshed(new Date());
      setError(null);
      setIsStale(false);
    } catch (err) {
      if (!isMounted.current) return;
      // Preserve last good data, mark it as stale.
      if (!isFirstLoad) {
        setIsStale(true);
      } else {
        setServers([]);
      }
      setError(err);
    } finally {
      if (isMounted.current) setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Initial load.
  useEffect(() => {
    isMounted.current = true;
    load(true);
    return () => { isMounted.current = false; };
  }, [load]);

  // Auto-refresh.
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;
    const timerId = setInterval(() => load(false), refreshInterval);
    return () => clearInterval(timerId);
  }, [load, refreshInterval]);

  const refresh = useCallback(() => load(false), [load]);

  return { servers, isLoading, error, lastRefreshed, isStale, refresh };
}
