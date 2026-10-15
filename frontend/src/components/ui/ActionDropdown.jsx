import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FleetIcons } from '../FleetIcons';

/**
 * Global Portaled ActionDropdown component.
 * Avoids any table overflow clipping (overflow-x-auto / overflow-hidden)
 * by rendering the dropdown menu into document.body via React Portal.
 */
export const ActionDropdown = ({
  items,
  children,
  trigger,
  buttonClassName = '',
  buttonTitle = 'More Options',
  menuWidth = 'w-48',
  align = 'right', // 'right' | 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const buttonRef = useRef(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 220 && rect.top > 220;

    setCoords({
      top: openUpward ? null : rect.bottom + 6,
      bottom: openUpward ? window.innerHeight - rect.top + 6 : null,
      left: align === 'left' ? Math.max(8, rect.left) : null,
      right: align === 'right' ? Math.max(8, window.innerWidth - rect.right) : null,
      openUpward,
    });
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
    } else {
      updatePosition();
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <div className="relative inline-flex items-center">
        {trigger ? (
          <div ref={buttonRef} onClick={handleToggle} className="cursor-pointer inline-flex items-center">
            {trigger}
          </div>
        ) : (
          <button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isOpen
                ? 'bg-slate-100 dark:bg-zinc-700 text-blue-600 dark:text-blue-400'
                : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            } ${buttonClassName}`}
            title={buttonTitle}
          >
            <FleetIcons.MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && coords && createPortal(
        <>
          {/* Transparent Backdrop to close when clicking outside */}
          <div
            className="fixed inset-0 z-[9998] bg-transparent"
            onClick={handleClose}
          />

          {/* Floating Dropdown Menu */}
          <div
            className={`fixed ${menuWidth} bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-xl shadow-slate-900/10 py-1 text-left font-medium z-[9999] transition-all duration-150 animate-in fade-in zoom-in-95`}
            style={{
              ...(coords.top !== null ? { top: `${coords.top}px` } : {}),
              ...(coords.bottom !== null ? { bottom: `${coords.bottom}px` } : {}),
              ...(coords.left !== null ? { left: `${coords.left}px` } : {}),
              ...(coords.right !== null ? { right: `${coords.right}px` } : {}),
              maxHeight: 'calc(100vh - 24px)',
              maxWidth: 'calc(100vw - 16px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {items && Array.isArray(items)
              ? items.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                      if (item.onClick) item.onClick();
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors ${
                      item.danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40' : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {item.icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                ))
              : typeof children === 'function'
              ? children({ close: handleClose })
              : children}
          </div>
        </>,
        document.body
      )}
    </>
  );
};
