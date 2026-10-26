/**
 * SettingsPage — user-facing display preferences.
 *
 * All settings are stored in the browser's localStorage — nothing is sent
 * to the backend. Changes apply immediately.
 */
import React from 'react';
import { Settings, RotateCcw, Info } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { useSettings } from '../hooks/useSettings.js';

function SettingRow({ label, description, children }) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-row-label">{label}</div>
        {description && <div className="settings-row-description">{description}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function NumberInput({ id, value, min, max, step = 1, onChange, unit }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        id={id}
        type="number"
        className="settings-input"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => {
          const v = Number(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        aria-label={`${id} value`}
      />
      {unit && <span className="text-xs text-muted">{unit}</span>}
    </div>
  );
}

export default function SettingsPage({ onLogout }) {
  const { settings, updateSetting, resetSettings } = useSettings();

  return (
    <DashboardLayout title="Settings" onLogout={onLogout}>
      {/* Local storage note */}
      <div className="alert-banner info" role="note" style={{ marginBottom: 'var(--space-6)' }}>
        <Info size={14} aria-hidden="true" />
        <span>
          These preferences are saved in your browser&apos;s <code>localStorage</code> only.
          They are not sent to the backend and reset if you clear your browser storage.
        </span>
      </div>

      {/* Refresh settings */}
      <div className="settings-section">
        <div className="settings-section-title">Data Refresh</div>
        <div className="card">
          <SettingRow
            label="Auto-refresh interval"
            description="How often to automatically refetch server and metric data. Set to 0 to disable."
          >
            <NumberInput
              id="setting-refresh-interval"
              value={Math.round(settings.refreshInterval / 1000)}
              min={0}
              max={300}
              onChange={v => updateSetting('refreshInterval', v * 1000)}
              unit="seconds"
            />
          </SettingRow>
        </div>
      </div>

      {/* Threshold settings */}
      <div className="settings-section">
        <div className="settings-section-title">Client-Side Alert Thresholds</div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
          These thresholds control the colour coding and warnings shown on the Alerts page.
          They are <strong>display-only</strong> — the backend does not use them.
        </p>
        <div className="card">
          <SettingRow
            label="CPU Warning"
            description="Show a warning when CPU usage exceeds this value."
          >
            <NumberInput
              id="setting-cpu-warn"
              value={settings.cpuWarnThreshold}
              min={1}
              max={99}
              onChange={v => updateSetting('cpuWarnThreshold', v)}
              unit="%"
            />
          </SettingRow>
          <SettingRow
            label="CPU Critical"
            description="Show a critical alert when CPU usage exceeds this value."
          >
            <NumberInput
              id="setting-cpu-crit"
              value={settings.cpuCriticalThreshold}
              min={1}
              max={100}
              onChange={v => updateSetting('cpuCriticalThreshold', v)}
              unit="%"
            />
          </SettingRow>

          <div className="divider" />

          <SettingRow
            label="Memory Warning"
            description="Show a warning when memory usage exceeds this value."
          >
            <NumberInput
              id="setting-mem-warn"
              value={settings.memWarnThreshold}
              min={1}
              max={99}
              onChange={v => updateSetting('memWarnThreshold', v)}
              unit="%"
            />
          </SettingRow>
          <SettingRow
            label="Memory Critical"
            description="Show a critical alert when memory usage exceeds this value."
          >
            <NumberInput
              id="setting-mem-crit"
              value={settings.memCriticalThreshold}
              min={1}
              max={100}
              onChange={v => updateSetting('memCriticalThreshold', v)}
              unit="%"
            />
          </SettingRow>

          <div className="divider" />

          <SettingRow
            label="Disk Warning"
            description="Show a warning when disk usage exceeds this value."
          >
            <NumberInput
              id="setting-disk-warn"
              value={settings.diskWarnThreshold}
              min={1}
              max={99}
              onChange={v => updateSetting('diskWarnThreshold', v)}
              unit="%"
            />
          </SettingRow>
          <SettingRow
            label="Disk Critical"
            description="Show a critical alert when disk usage exceeds this value."
          >
            <NumberInput
              id="setting-disk-crit"
              value={settings.diskCriticalThreshold}
              min={1}
              max={100}
              onChange={v => updateSetting('diskCriticalThreshold', v)}
              unit="%"
            />
          </SettingRow>
        </div>
      </div>

      {/* Backend info */}
      <div className="settings-section">
        <div className="settings-section-title">Backend Information</div>
        <div className="card">
          <SettingRow label="Backend URL" description="Configured via VITE_API_BASE_URL (empty = same origin / Vite proxy).">
            <code className="font-mono text-xs text-muted">
              {import.meta.env.VITE_API_BASE_URL || '(relative — Vite proxy)'}
            </code>
          </SettingRow>
          <SettingRow label="API endpoints used" description="">
            <div style={{ textAlign: 'right', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
              <div>GET /api/servers</div>
              <div>GET /api/servers/&#123;name&#125;/metrics</div>
              <div>GET /api/servers/&#123;name&#125;/latest</div>
              <div>GET /actuator/health</div>
            </div>
          </SettingRow>
        </div>
      </div>

      {/* Reset */}
      <div style={{ marginTop: 'var(--space-4)' }}>
        <button
          className="btn btn-ghost"
          onClick={resetSettings}
          id="settings-reset-btn"
          aria-label="Reset all settings to defaults"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Reset to defaults
        </button>
      </div>
    </DashboardLayout>
  );
}
