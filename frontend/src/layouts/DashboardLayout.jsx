/**
 * DashboardLayout — wraps all authenticated dashboard pages.
 * Provides the Sidebar and Topbar shell.
 */
import React from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';

export default function DashboardLayout({
  children,
  title,
  breadcrumb,
  lastRefreshed,
  isStale,
  onRefresh,
  isRefreshing,
  onLogout,
}) {
  return (
    <div className="app-shell">
      <Sidebar onLogout={onLogout} />
      <div className="main-area">
        <Topbar
          title={title}
          breadcrumb={breadcrumb}
          lastRefreshed={lastRefreshed}
          isStale={isStale}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        <main className="page-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
