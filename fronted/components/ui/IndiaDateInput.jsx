import { useRef, useId } from 'react';
import { FleetIcons } from '../FleetIcons';

/**
 * IndiaDateInput — a date field that ALWAYS displays dd/mm/yyyy (Indian format),
 * independent of the browser/OS locale (native <input type="date"> otherwise shows
 * mm/dd/yyyy on US-locale browsers).
 *
 * Contract: value and onChange use the ISO "YYYY-MM-DD" string, exactly like a native
 * date input, so no parent logic/backend changes are required.
 *
 * Props: value (YYYY-MM-DD), onChange(isoString), min, max, disabled, className, id
 */
function isoToDisplay(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return '';
  const [y, m, d] = parts;
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

export const IndiaDateInput = ({
  value = '',
  onChange,
  min,
  max,
  disabled = false,
  className = '',
  id,
  placeholder = 'DD/MM/YYYY',
}) => {
  const nativeRef = useRef(null);
  const autoId = useId();
  const inputId = id || `india-date-${autoId}`;

  const openPicker = () => {
    const el = nativeRef.current;
    if (!el || disabled) return;
    if (typeof el.showPicker === 'function') {
      try { el.showPicker(); return; } catch { /* fall through */ }
    }
    el.focus();
    el.click();
  };

  const display = isoToDisplay(value);

  return (
    <div className={`relative ${className}`}>
      {/* Visible text showing dd/mm/yyyy (read-only; editing happens via the native picker) */}
      <input
        type="text"
        readOnly
        value={display}
        placeholder={placeholder}
        onClick={openPicker}
        disabled={disabled}
        aria-label="Date (DD/MM/YYYY)"
        className="w-full px-3 py-2 pr-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      />

      {/* Calendar icon button that opens the native picker */}
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        tabIndex={-1}
        aria-label="Open date picker"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <FleetIcons.Calendar className="w-4 h-4" />
      </button>

      {/* Hidden native date input — holds the real ISO value and provides the calendar UI */}
      <input
        ref={nativeRef}
        id={inputId}
        type="date"
        value={value || ''}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
};

export default IndiaDateInput;
