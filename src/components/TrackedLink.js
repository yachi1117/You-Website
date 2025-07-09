import React from 'react';
import { logEvent } from '../utils/analytics';

function TrackedLink({ href, category, label, children, className }) {
  const handleClick = () => {
    logEvent(category, 'External Link Click', label || href);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

export default TrackedLink; 