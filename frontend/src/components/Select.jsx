import React from 'react';

export const Select = React.forwardRef(({ className = '', label, options = [], leftIcon, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-white">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#8a8a8a] pointer-events-none z-10">
            {leftIcon}
          </div>
        )}
        <select
          ref={ref}
          className={`
            appearance-none flex h-11 w-full rounded-xl border border-[#2a2a2a] 
            bg-[#121212] px-4 py-2 pr-10 text-xs font-medium text-white transition-colors duration-200 
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer
            ${leftIcon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((opt, i) => (
            <option 
              key={i} 
              value={opt.value}
              className="bg-[#121212] text-white py-2"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#8a8a8a]">
          <svg className="h-4 w-4 fill-current opacity-70" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
});

Select.displayName = 'Select';
