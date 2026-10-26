/**
 * EmptyState — shown when data loads successfully but the list is empty.
 */
import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="state-container">
      {Icon && <Icon size={40} className="state-icon" aria-hidden="true" />}
      <h3 className="state-title">{title}</h3>
      {description && <p className="state-description">{description}</p>}
      {action}
    </div>
  );
}
