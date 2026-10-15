import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div 
      className={`
        glass-card
        ${hover ? 'hover:-translate-y-2 hover:shadow-2xl hover:border-[var(--primary)]/30' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
