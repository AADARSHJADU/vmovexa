import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white hover:opacity-95 shadow-lg shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 focus:ring-[#1C68FD]",
    gradient: "bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white hover:opacity-95 shadow-lg shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 focus:ring-[#1C68FD]",
    secondary: "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)] focus:ring-[var(--border)]",
    outline: "border-2 border-[var(--border)] bg-transparent text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] focus:ring-[var(--primary)]",
    ghost: "bg-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] focus:ring-[var(--secondary)]",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
