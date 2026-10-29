import React from 'react';

export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
    secondary: "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]",
    outline: "text-[var(--foreground)] border border-[var(--border)]",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500/10 text-green-500 border border-green-500/20",
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
