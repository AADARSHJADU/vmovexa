import React from 'react';

export const Checkbox = React.forwardRef(({ className = '', label, description, ...props }, ref) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-5 items-center">
        <input
          type="checkbox"
          ref={ref}
          className={`
            peer h-5 w-5 appearance-none rounded border border-[var(--border)] 
            bg-transparent transition-all checked:border-[var(--primary)] 
            checked:bg-[var(--primary)] hover:border-[var(--primary)] focus:outline-none 
            focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `}
          {...props}
        />
        {/* Custom checkmark icon that shows when checked */}
        <svg
          className="absolute h-5 w-5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity p-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label className="text-sm font-medium text-[var(--foreground)] cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-[var(--muted)] mt-0.5">{description}</p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
