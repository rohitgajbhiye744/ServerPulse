/**
 * Sidebar — the primary navigation panel.
 * Highlights the active route automatically via NavLink.
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Server,
  BarChart2,
  Bell,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/overview', icon: Activity,  label: 'Overview' },
  { to: '/servers',  icon: Server,    label: 'Servers'  },
  { to: '/metrics',  icon: BarChart2, label: 'Metrics'  },
  { to: '/alerts',   icon: Bell,      label: 'Alerts'   },
  { to: '/settings', icon: Settings,  label: 'Settings' },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Logo */}
      <NavLink to="/overview" className="sidebar-logo" aria-label="ServerPulse — go to Overview">
        <div className="sidebar-logo-icon" aria-hidden="true">
          <Zap size={18} color="#fff" />
        </div>
        <span className="sidebar-wordmark">
          Server<span>Pulse</span>
        </span>
      </NavLink>

      {/* Navigation links */}
      <nav className="sidebar-nav" aria-label="Dashboard pages">
        <span className="sidebar-section-label">Dashboard</span>

        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${label.toLowerCase()}`}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            aria-label={label}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer — logout */}
      <div className="sidebar-footer">
        <button
          className="nav-link btn"
          style={{ width: '100%', border: 'none', background: 'transparent', padding: '8px 12px' }}
          onClick={onLogout}
          id="sidebar-logout-btn"
          aria-label="Log out"
        >
          <LogOut size={16} aria-hidden="true" />
          Log out
        </button>
      </div>
    </aside>
  );
}
