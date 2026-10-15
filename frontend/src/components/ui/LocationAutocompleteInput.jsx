import React, { useState, useEffect, useRef } from 'react';
import { googleApisService } from '../../api/services/googleApis.service';

export const LocationAutocompleteInput = ({
  label,
  value = '',
  onChange,
  coords = null,
  placeholder = 'Search station, depot, or landmark...',
  required = false,
  className = '',
}) => {
  const [query, setQuery] = useState(value || '');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [manualLat, setManualLat] = useState(coords?.lat ?? coords?.latitude ?? '');
  const [manualLng, setManualLng] = useState(coords?.lng ?? coords?.longitude ?? '');
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    setManualLat(coords?.lat ?? coords?.latitude ?? '');
    setManualLng(coords?.lng ?? coords?.longitude ?? '');
  }, [coords?.lat, coords?.latitude, coords?.lng, coords?.longitude]);

  // Click outside to close predictions dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    if (onChange) onChange(text, coords?.lat, coords?.lng, text);

    if (text.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await googleApisService.demoPlaces({ query: text.trim() });
        const places = res?.data?.places || res?.places || [];
        setPredictions(places);
        setIsOpen(places.length > 0);
      } catch (err) {
        // Fallback silently if API key is not active
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelectPlace = (place) => {
    const name = place.displayName?.text || place.formattedAddress || query;
    const address = place.formattedAddress || name;
    const lat = place.location?.latitude ?? null;
    const lng = place.location?.longitude ?? null;

    // Extract structured address from Google's _parsed field (added by backend)
    const parsed = place._parsed || {};

    setQuery(name);
    setManualLat(lat || '');
    setManualLng(lng || '');
    setIsOpen(false);

    if (onChange) {
      onChange(name, lat, lng, address, {
        city: parsed.city || null,
        state: parsed.state || null,
        pincode: parsed.pincode || null,
        country: parsed.country || null,
        full_address: parsed.full_address || address || null,
        place_id: parsed.place_id || null,
      });
    }
  };

  const handleManualCoordUpdate = (newLat, newLng) => {
    setManualLat(newLat);
    setManualLng(newLng);
    const parsedLat = parseFloat(newLat);
    const parsedLng = parseFloat(newLng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng) && onChange) {
      onChange(query, parsedLat, parsedLng, query);
    }
  };

  const hasCoords = (coords?.lat != null && coords?.lng != null) || (manualLat && manualLng);
  const displayLat = coords?.lat ?? coords?.latitude ?? manualLat;
  const displayLng = coords?.lng ?? coords?.longitude ?? manualLng;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <button
            type="button"
            onClick={() => setShowManualCoords(!showManualCoords)}
            className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {showManualCoords ? 'Hide Coordinates' : 'Edit GPS'}
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="w-full pl-9 pr-14 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700 transition-colors shadow-sm"
        />

        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
          {loading && (
            <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setPredictions([]);
                setIsOpen(false);
                if (onChange) onChange('', null, null, '');
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Clear address"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Lat / Long pill indicator */}
      {hasCoords && !showManualCoords && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md font-mono">
            <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>GPS:</span>
            <span className="font-semibold">{Number(displayLat).toFixed(6)}, {Number(displayLng).toFixed(6)}</span>
          </div>
        </div>
      )}

      {/* Manual Lat/Lng inputs */}
      {showManualCoords && (
        <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={manualLat}
              onChange={(e) => handleManualCoordUpdate(e.target.value, manualLng)}
              placeholder="e.g. 28.6139"
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={manualLng}
              onChange={(e) => handleManualCoordUpdate(manualLat, e.target.value)}
              placeholder="e.g. 77.2090"
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>
      )}

      {/* Google Places Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <span>📍</span>
              <span>Suggested Locations (Google Maps)</span>
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Click to select</span>
          </div>
          {predictions.map((p, idx) => (
            <button
              key={p.id || idx}
              type="button"
              onClick={() => handleSelectPlace(p)}
              className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border-b border-slate-100 dark:border-slate-800/60 last:border-0 flex items-start gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-200/60 dark:border-blue-800/40">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 dark:text-white truncate">
                  {p.displayName?.text || p.formattedAddress}
                </div>
                {p.formattedAddress && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">
                    {p.formattedAddress}
                  </div>
                )}
                {p.location?.latitude && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                    GPS: {Number(p.location.latitude).toFixed(4)}, {Number(p.location.longitude).toFixed(4)}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocompleteInput;
