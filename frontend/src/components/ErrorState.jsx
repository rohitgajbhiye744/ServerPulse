/**
 * ErrorState — shown when an API call fails.
 * Displays an appropriate message based on the error type.
 */
import React from 'react';
import { AlertCircle, WifiOff, Lock, RefreshCw } from 'lucide-react';
import { ApiError } from '../api/client.js';

export default function ErrorState({ error, onRetry }) {
  let Icon = AlertCircle;
  let title = 'Something went wrong';
  let description = 'An unexpected error occurred.';

  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        Icon = WifiOff;
        title = 'Backend unavailable';
        description = 'Cannot reach the ServerPulse backend. Make sure it is running on port 8080.';
        break;
      case 'UNAUTHORIZED':
        Icon = Lock;
        title = 'Authentication required';
        description = 'Your session may have expired. Please log in again.';
        break;
      case 'FORBIDDEN':
        Icon = Lock;
        title = 'Access denied';
        description = 'You do not have permission to view this resource.';
        break;
      case 'NOT_FOUND':
        title = 'Not found';
        description = error.message || 'The requested resource does not exist.';
        break;
      default:
        description = error.message || description;
    }
  } else if (error?.message) {
    description = error.message;
  }

  return (
    <div className="state-container">
      <Icon size={40} className="state-icon" aria-hidden="true" />
      <h3 className="state-title">{title}</h3>
      <p className="state-description">{description}</p>
      {onRetry && (
        <button
          className="btn btn-ghost"
          onClick={onRetry}
          id="error-retry-btn"
          aria-label="Retry loading data"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
