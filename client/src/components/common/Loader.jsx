import React from 'react';

export default function Loader({ size = 'md', color, className = '', style = {} }) {
  const sizeClass = `spinner-${size}`;
  const colorClass = color ? `spinner-${color}` : '';
  return (
    <span
      className={`spinner ${sizeClass} ${colorClass} ${className}`}
      style={style}
      role="status"
      aria-label="Loading"
    />
  );
}
