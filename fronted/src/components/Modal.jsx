import React, { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`
        relative z-50 w-full max-w-lg rounded-2xl border border-[var(--border)] 
        bg-[var(--background)] p-6 shadow-2xl animate-in zoom-in-95 duration-200
        ${className}
      `}>
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <button 
              onClick={onClose}
              className="rounded-full p-1 hover:bg-[var(--secondary)] transition-colors"
            >
              <svg className="h-5 w-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};
