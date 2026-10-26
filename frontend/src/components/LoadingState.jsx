/**
 * LoadingState — shown while data is being fetched.
 */
import React from 'react';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="state-container">
      <div className="spinner" aria-label="Loading" />
      <p className="text-muted text-sm">{message}</p>
    </div>
  );
}
