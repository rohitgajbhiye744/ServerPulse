/**
 * useSettings — manages user-facing dashboard preferences.
 *
 * Settings are persisted in localStorage for convenience.
 * These are display-only preferences — nothing is sent to the backend.
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'serverpulse_settings';

const DEFAULT_SETTINGS = {
  refreshInterval: parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '30000', 10),
  cpuWarnThreshold: 70,
  cpuCriticalThreshold: 90,
  memWarnThreshold: 75,
  memCriticalThreshold: 90,
  diskWarnThreshold: 80,
  diskCriticalThreshold: 95,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSettings() {
  const [settings, setSettingsState] = useState(loadSettings);

  // Persist to localStorage whenever settings change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage may be unavailable in some environments — ignore.
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettingsState(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettingsState(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  };

  return { settings, updateSetting, resetSettings, DEFAULT_SETTINGS };
}
