/**
 * App.jsx — root component.
 *
 * Handles:
 * - Authentication gate (Login page vs. Dashboard)
 * - React Router routes for all dashboard pages
 * - Passing logout handler through to all pages
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import LoginPage       from './pages/LoginPage.jsx';
import OverviewPage    from './pages/OverviewPage.jsx';
import ServersPage     from './pages/ServersPage.jsx';
import ServerDetailPage from './pages/ServerDetailPage.jsx';
import MetricsPage     from './pages/MetricsPage.jsx';
import AlertsPage      from './pages/AlertsPage.jsx';
import SettingsPage    from './pages/SettingsPage.jsx';

export default function App() {
  const { isAuthenticated, isLoading, error, login, logout } = useAuth();

  // Not logged in — show login page.
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={login}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to overview */}
        <Route path="/" element={<Navigate to="/overview" replace />} />

        <Route path="/overview" element={<OverviewPage onLogout={logout} />} />
        <Route path="/servers"  element={<ServersPage  onLogout={logout} />} />
        <Route path="/servers/:serverName" element={<ServerDetailPage onLogout={logout} />} />
        <Route path="/metrics"  element={<MetricsPage  onLogout={logout} />} />
        <Route path="/alerts"   element={<AlertsPage   onLogout={logout} />} />
        <Route path="/settings" element={<SettingsPage onLogout={logout} />} />

        {/* Fallback — redirect unknown paths to overview */}
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
