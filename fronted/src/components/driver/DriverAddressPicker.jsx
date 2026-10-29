import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { googleApisService } from '../../api/services/googleApis.service';
import { reverseGeocodeCoords } from '../../utils/geolocation';

/**
 * DriverAddressPicker — Interactive Google Maps + Places Address Picker for Drivers.
 * Features:
 * - Google Places live search with autocomplete suggestions
 * - Interactive Leaflet map with high-res Google Maps tiles (Roadmap / Satellite)
 * - Draggable driver residence pin
 * - Reverse-geocoding via Google Maps & Nominatim on pin move or map click
 * - Browser GPS current location button
 * - Structured address fields (Street Address, City, State, Pincode, Country)
 */
export const DriverAddressPicker = ({
  addressData = {},
  onChange,
  fieldErrors = {},
  disabled = false,
  searchLabel = 'Search Address',
  searchPlaceholder = 'Search street, area, or city...',
  searchHint = 'Search an address or click anywhere on the map to set location.',
  pinColor = '#059669',
  pinLabel = 'Residence',
  addressLabel = 'Street Address *',
  addressPlaceholder = 'House/Flat No, Building, Street, Area',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState(addressData.address || addressData.location || '');
  const [predictions, setPredictions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Sync search input when addressData changes externally (e.g. GPS auto-detect)
  useEffect(() => {
    const ext = addressData.address || addressData.location || '';
    if (ext && ext !== searchQuery && !isDropdownOpen) {
      setSearchQuery(ext);
    }
  }, [addressData.address, addressData.location, isDropdownOpen]);

  // Default coordinates centered on India (Central India / Nagpur / New Delhi)
  const defaultLat = 20.5937;
  const defaultLng = 78.9629;

  const rawLat = addressData.latitude;
  const rawLng = addressData.longitude;
  const hasValidCoords =
    rawLat !== '' &&
    rawLat != null &&
    !isNaN(Number(rawLat)) &&
    Number(rawLat) !== 0 &&
    rawLng !== '' &&
    rawLng != null &&
    !isNaN(Number(rawLng)) &&
    Number(rawLng) !== 0;

  const currentLat = hasValidCoords ? Number(rawLat) : defaultLat;
  const currentLng = hasValidCoords ? Number(rawLng) : defaultLng;

  // Google Maps tile URL provider
  const getGoogleTileUrl = (style) => {
    switch (style) {
      case 'satellite':
        return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      case 'roadmap':
      default:
        return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    }
  };

  // Custom Driver Residence / Incident Pin Icon
  const createDriverIcon = () => {
    return L.divIcon({
      className: 'driver-pin-container',
      html: `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <div style="position: absolute; width: 40px; height: 40px; background: rgba(16, 185, 129, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 34px; height: 34px; background: ${pinColor}; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: #ffffff;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div style="position: absolute; bottom: -5px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${pinColor};"></div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 42],
      popupAnchor: [0, -38],
    });
  };

  // Reverse geocode handler using Google Geocoding API with multi-stage fallback
  const performReverseGeocode = useCallback(async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const geo = await reverseGeocodeCoords(lat, lng);
      setSearchQuery(geo.address || '');
      onChange({
        ...addressData,
        ...geo,
      });
      toast.success(`Address resolved: ${geo.city || geo.state || geo.address}`);
    } catch {
      const fallback = `GPS Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      setSearchQuery(fallback);
      onChange({
        ...addressData,
        address: fallback,
        location: fallback,
        latitude: parseFloat(lat.toFixed(7)),
        longitude: parseFloat(lng.toFixed(7)),
      });
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [addressData, onChange]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      center: [currentLat, currentLng],
      zoom: hasValidCoords ? 15 : 5, // Zoom 5 shows entire India map on create!
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileLayer = L.tileLayer(getGoogleTileUrl(mapStyle), {
      maxZoom: 20,
      attribution: '&copy; Google Maps',
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Draggable Marker Pin
    const marker = L.marker([currentLat, currentLng], {
      icon: createDriverIcon(),
      draggable: !disabled,
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <strong style="color: ${pinColor};">${hasValidCoords ? pinLabel : 'India Center'}</strong><br/>
        <span style="color: #64748b;">${addressData.address || `Search place above or drag pin to ${pinLabel.toLowerCase()}`}</span>
      </div>
    `);

    // Multi-stage invalidateSize to ensure tiles expand across 100% of container width
    [100, 250, 500, 1000].forEach((delay) => {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, delay);
    });

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleWindowResize);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      performReverseGeocode(pos.lat, pos.lng);
    });

    map.on('click', (e) => {
      if (disabled) return;
      marker.setLatLng(e.latlng);
      if (map.getZoom() < 14) {
        map.flyTo(e.latlng, 15, { duration: 0.8 });
      }
      performReverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map style (roadmap vs satellite)
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getGoogleTileUrl(mapStyle));
    }
  }, [mapStyle]);

  // Sync marker position when addressData coordinates change externally
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    if (addressData.latitude && addressData.longitude) {
      const lat = Number(addressData.latitude);
      const lng = Number(addressData.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const cur = markerRef.current.getLatLng();
        if (Math.abs(cur.lat - lat) > 0.0001 || Math.abs(cur.lng - lng) > 0.0001) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.panTo([lat, lng]);
        }
      }
    }
  }, [addressData.latitude, addressData.longitude]);

  // Google Places Search with Debounce
  const handleSearchInput = (e) => {
    const text = e.target.value;
    setSearchQuery(text);

    if (text.trim().length < 2) {
      setPredictions([]);
      setIsDropdownOpen(false);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await googleApisService.demoPlaces({ query: text.trim() });
        const places = res?.places || res?.data?.places || [];
        setPredictions(places);
        setIsDropdownOpen(places.length > 0);
      } catch {
        setPredictions([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  // Select Place from Search Dropdown
  const handleSelectPlace = (place) => {
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    const parsed = place._parsed || {};
    const fullAddress = place.formattedAddress || parsed.full_address || '';

    setSearchQuery(place.displayName?.text || fullAddress);
    setIsDropdownOpen(false);
    setPredictions([]);

    if (lat != null && lng != null) {
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
        markerRef.current.setLatLng([lat, lng]);
      }

      onChange({
        ...addressData,
        latitude: parseFloat(lat.toFixed(7)),
        longitude: parseFloat(lng.toFixed(7)),
        address: fullAddress || addressData.address,
        city: parsed.city || addressData.city,
        state: parsed.state || addressData.state,
        pincode: parsed.pincode || addressData.pincode,
        country: parsed.country || 'India',
        placeId: parsed.place_id || place.id || addressData.placeId,
      });

      toast.success(`Positioned to ${place.displayName?.text || 'selected location'}!`);
    }
  };

  // Locate Current Position via Browser Geolocation
  const handleLocateCurrent = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const toastId = toast.loading('Acquiring GPS position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        toast.dismiss(toastId);
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 1.2 });
          markerRef.current.setLatLng([latitude, longitude]);
        }
        performReverseGeocode(latitude, longitude);
      },
      (err) => {
        toast.dismiss(toastId);
        toast.error(`Unable to retrieve GPS: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Google Places Autocomplete Search Bar */}
      <div className="relative space-y-1.5">
        <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
          <span className="flex items-center gap-1.5">
            <FleetIcons.Pin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{searchLabel}</span>
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Powered by Google Places API
          </span>
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            type="text"
            disabled={disabled}
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => { if (predictions.length > 0) setIsDropdownOpen(true); }}
            className="w-full pl-10 pr-24 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 transition-all shadow-inner"
          />

          <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
            {searching && (
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-1" />
            )}
            <button
              type="button"
              onClick={handleLocateCurrent}
              disabled={disabled}
              title="Locate Current Position"
              className="p-1.5 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1 font-bold cursor-pointer"
            >
              <FleetIcons.Gps className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">GPS</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-0.5 flex items-center gap-1.5">
          <FleetIcons.Info className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
          <span>{searchHint}</span>
        </p>

        {/* Predictions Dropdown */}
        {isDropdownOpen && predictions.length > 0 && (
          <div className="absolute z-[1000] left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in slide-in-from-top-1 duration-150">
            {predictions.map((p, idx) => (
              <button
                key={p.id || idx}
                type="button"
                onClick={() => handleSelectPlace(p)}
                className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/60 dark:hover:bg-zinc-800 transition-colors flex items-start gap-2.5 cursor-pointer group"
              >
                <FleetIcons.Pin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    {p.displayName?.text || p.formattedAddress}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                    {p.formattedAddress || `${p._parsed?.city || ''}, ${p._parsed?.state || ''} ${p._parsed?.pincode || ''}`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Leaflet Map with Google Maps Tiles (Distinct Spacing) */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm bg-slate-100 dark:bg-zinc-950 mt-5">
        {/* Map Header Toolbar */}
        <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 shadow-sm text-xs">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pinColor }}></span>
          <span className="font-bold text-slate-700 dark:text-zinc-200 text-[11px]">Draggable Pin</span>
          {isReverseGeocoding && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse ml-1">Resolving address...</span>
          )}
        </div>

        {/* Roadmap / Satellite Toggle */}
        <div className="absolute top-3 right-3 z-[400] flex items-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl border border-slate-200 dark:border-zinc-700 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMapStyle('roadmap')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              mapStyle === 'roadmap'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              mapStyle === 'satellite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Leaflet Container */}
        <div ref={mapContainerRef} className="w-full h-72 sm:h-80 md:h-[380px] z-0" />

        {/* Map Footer Info */}
        <div className="bg-slate-50 dark:bg-zinc-900/90 px-3 py-2 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
          <div className="flex items-center gap-2">
            <span>Lat: <strong className="text-slate-900 dark:text-zinc-100">{addressData.latitude ? Number(addressData.latitude).toFixed(5) : '—'}</strong></span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span>Lng: <strong className="text-slate-900 dark:text-zinc-100">{addressData.longitude ? Number(addressData.longitude).toFixed(5) : '—'}</strong></span>
          </div>
          <span className="text-slate-400 dark:text-zinc-500 text-[10px]">Click anywhere or drag pin to adjust location</span>
        </div>
      </div>

      {/* 3. Structured Editable Address Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 pt-1">
        {/* Full Street Address (Spans 2 cols on lg) */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            {addressLabel}
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder={addressPlaceholder}
            value={addressData.address || ''}
            onChange={(e) => onChange({ ...addressData, address: e.target.value })}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-all ${
              fieldErrors.address
                ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-emerald-500'
            }`}
          />
          {fieldErrors.address && (
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
              <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.address}
            </p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            City *
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder="e.g. Pune"
            value={addressData.city || ''}
            onChange={(e) => onChange({ ...addressData, city: e.target.value })}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-all ${
              fieldErrors.city
                ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-emerald-500'
            }`}
          />
          {fieldErrors.city && (
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
              <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.city}
            </p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            State *
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder="e.g. Maharashtra"
            value={addressData.state || ''}
            onChange={(e) => onChange({ ...addressData, state: e.target.value })}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-all ${
              fieldErrors.state
                ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-emerald-500'
            }`}
          />
          {fieldErrors.state && (
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
              <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.state}
            </p>
          )}
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            Pincode *
          </label>
          <input
            type="text"
            maxLength={10}
            disabled={disabled}
            placeholder="e.g. 411001"
            value={addressData.pincode || ''}
            onChange={(e) => onChange({ ...addressData, pincode: e.target.value.replace(/\s+/g, '') })}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-all ${
              fieldErrors.pincode
                ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-emerald-500'
            }`}
          />
          {fieldErrors.pincode && (
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
              <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.pincode}
            </p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
            Country
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder="Country"
            value={addressData.country || 'India'}
            onChange={(e) => onChange({ ...addressData, country: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none"
          />
        </div>

        {/* Latitude (Spans 3 cols on lg) */}
        <div className="sm:col-span-1 lg:col-span-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
            <span>Latitude</span>
            <span className="text-[10px] text-slate-400 font-mono">e.g. 22.7196000</span>
          </label>
          <input
            type="number"
            step="0.0000001"
            disabled={disabled}
            placeholder="e.g. 22.7196000"
            value={addressData.latitude != null ? addressData.latitude : ''}
            onChange={(e) => {
              const val = e.target.value !== '' ? parseFloat(e.target.value) : null;
              onChange({ ...addressData, latitude: val });
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-all border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-emerald-500"
          />
        </div>

        {/* Longitude (Spans 3 cols on lg) */}
        <div className="sm:col-span-1 lg:col-span-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
            <span>Longitude</span>
            <span className="text-[10px] text-slate-400 font-mono">e.g. 75.8577000</span>
          </label>
          <input
            type="number"
            step="0.0000001"
            disabled={disabled}
            placeholder="e.g. 75.8577000"
            value={addressData.longitude != null ? addressData.longitude : ''}
            onChange={(e) => {
              const val = e.target.value !== '' ? parseFloat(e.target.value) : null;
              onChange({ ...addressData, longitude: val });
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-all border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

export default DriverAddressPicker;
