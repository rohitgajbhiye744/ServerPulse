/**
 * LoginPage — collects admin credentials and verifies them with the backend.
 *
 * Security notes:
 * - This form does NOT store credentials in localStorage.
 * - On submit, it calls the backend immediately to verify them.
 * - If verification fails, credentials are discarded.
 * - The browser may offer to save the password via its built-in manager — this
 *   is acceptable and controlled by the user's browser settings.
 *
 * Authentication model:
 * The backend uses HTTP Basic authentication. Admin credentials are created
 * from the SERVERPULSE_ADMIN_USERNAME and SERVERPULSE_ADMIN_PASSWORD
 * environment variables when the backend starts.
 */
import React, { useState } from 'react';
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLogin, isLoading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    onLogin(username.trim(), password);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon" aria-hidden="true">
            <Zap size={22} color="#fff" />
          </div>
          <div>
            <div className="login-title">
              Server<span>Pulse</span>
            </div>
          </div>
        </div>

        <p className="login-subtitle">
          Sign in with your admin credentials to access the dashboard.
        </p>

        {/* Error message */}
        {error && (
          <div className="form-error" role="alert" aria-live="assertive">
            <AlertCircle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} noValidate aria-label="Login form">
          <div className="form-group">
            <label htmlFor="login-username" className="form-label">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              autoFocus
              required
              disabled={isLoading}
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={isLoading}
                aria-required="true"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-faint)',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPassword
                  ? <EyeOff size={15} aria-hidden="true" />
                  : <Eye size={15} aria-hidden="true" />
                }
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '10px 16px' }}
            disabled={isLoading || !username.trim() || !password}
            id="login-submit-btn"
          >
            {isLoading ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} aria-hidden="true" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Hint */}
        <p style={{ marginTop: 24, fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textAlign: 'center', lineHeight: 1.5 }}>
          Admin credentials are set via the{' '}
          <code style={{ fontFamily: 'var(--font-mono)' }}>SERVERPULSE_ADMIN_USERNAME</code> and{' '}
          <code style={{ fontFamily: 'var(--font-mono)' }}>SERVERPULSE_ADMIN_PASSWORD</code>{' '}
          environment variables when the backend starts.
        </p>
      </div>
    </div>
  );
}
