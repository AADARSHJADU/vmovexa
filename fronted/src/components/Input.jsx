import React from 'react';

export const Input = React.forwardRef(({ className = '', label, error, leftIcon, rightIcon, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#8a8a8a] pointer-events-none z-10">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            flex h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#121212] px-4 py-2 
            text-xs text-white transition-colors duration-200 placeholder:text-[#6a6a6a]
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 
            disabled:cursor-not-allowed disabled:opacity-50
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-[#8a8a8a] flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
