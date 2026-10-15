import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { googleApisService } from '../../api/services/googleApis.service';

/**
 * DepotLocationPicker — Interactive Google Maps + Leaflet Location Picker
 * Features:
 * - Google Places text autocomplete search
 * - Leaflet map with high-res Google Maps tiles (roadmap & satellite)
 * - Draggable depot pin to adjust yard/gate position
 * - Map click to place/move pin
 * - Reverse geocoding on pin move/drag via Google Geocoding API
 * - Interactive geofence circle preview with live radius slider
 * - Browser GPS current location button
 */
export const DepotLocationPicker = ({
  locationData,
  onChange,
  disabled = false,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const tileLayerRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Default coordinate if none provided (e.g. India Central / Bangalore Hub)
  const defaultLat = 12.9716;
  const defaultLng = 77.5946;

  const currentLat = locationData.latitude != null && !isNaN(Number(locationData.latitude))
    ? Number(locationData.latitude)
    : defaultLat;
  const currentLng = locationData.longitude != null && !isNaN(Number(locationData.longitude))
    ? Number(locationData.longitude)
    : defaultLng;
  const currentRadius = Number(locationData.geofenceRadius) || 300;

  // Google Maps tile URL provider
  const getGoogleTileUrl = (style) => {
    switch (style) {
      case 'satellite':
        return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      case 'terrain':
        return 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      case 'roadmap':
      default:
        return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    }
  };

  // Custom Depot Pin Icon
  const createDepotIcon = () => {
    return L.divIcon({
      className: 'depot-pin-container',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <div style="position: absolute; width: 42px; height: 42px; background: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 34px; height: 34px; background: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 16px;">
            🏢
          </div>
          <div style="position: absolute; bottom: -6px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #2563eb;"></div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -40],
    });
  };

  // Reverse geocode handler
  const performReverseGeocode = useCallback(async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const res = await googleApisService.demoGeocode({ lat, lng });
      const firstMatch = res?.firstMatch || res?.results?.[0];
      if (firstMatch) {
        const comps = firstMatch.address_components || [];
        const getComp = (...types) => {
          const comp = comps.find((c) => c.types && types.some((t) => c.types.includes(t)));
          return comp?.long_name || comp?.short_name || '';
        };

        const city = getComp('locality', 'administrative_area_level_3', 'sublocality_level_1');
        const state = getComp('administrative_area_level_1');
        const pincode = getComp('postal_code');
        const country = getComp('country') || 'India';
        const fullAddress = firstMatch.formatted_address || '';
        const placeId = firstMatch.place_id || '';

        onChange({
          ...locationData,
          latitude: parseFloat(lat.toFixed(7)),
          longitude: parseFloat(lng.toFixed(7)),
          address: fullAddress || locationData.address,
          city: city || locationData.city,
          state: state || locationData.state,
          pincode: pincode || locationData.pincode,
          country: country || locationData.country,
          placeId: placeId || locationData.placeId,
        });

        toast.success('Location pin updated & address auto-synced via Google Maps!', { id: 'geo-sync', duration: 2500 });
      } else {
        onChange({
          ...locationData,
          latitude: parseFloat(lat.toFixed(7)),
          longitude: parseFloat(lng.toFixed(7)),
        });
      }
    } catch {
      onChange({
        ...locationData,
        latitude: parseFloat(lat.toFixed(7)),
        longitude: parseFloat(lng.toFixed(7)),
      });
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [locationData, onChange]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(getGoogleTileUrl(mapStyle), {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Geofence circle
      const circle = L.circle([currentLat, currentLng], {
        radius: currentRadius,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);
      circleRef.current = circle;

      // Draggable Depot Pin Marker
      const marker = L.marker([currentLat, currentLng], {
        icon: createDepotIcon(),
        draggable: !disabled,
        title: 'Depot Facility Gate (Drag to fine-tune)',
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <b style="font-size: 13px; color: #0f172a;">Depot Facility Pin</b>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Drag this pin or click anywhere on the map to adjust the exact entrance.</p>
        </div>
      `);

      // Drag event
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
        performReverseGeocode(lat, lng);
      });

      // Map Click event
      map.on('click', (e) => {
        if (disabled) return;
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
        performReverseGeocode(lat, lng);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile URL when mapStyle changes
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getGoogleTileUrl(mapStyle));
    }
  }, [mapStyle]);

  // Sync marker and circle positions if latitude/longitude change externally
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    const circle = circleRef.current;

    const lat = Number(locationData.latitude);
    const lng = Number(locationData.longitude);

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      const curPos = marker.getLatLng();
      if (Math.abs(curPos.lat - lat) > 0.0001 || Math.abs(curPos.lng - lng) > 0.0001) {
        marker.setLatLng([lat, lng]);
        if (circle) circle.setLatLng([lat, lng]);
        map.panTo([lat, lng]);
      }
    }
  }, [locationData.latitude, locationData.longitude]);

  // Sync geofence circle radius
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(currentRadius);
    }
  }, [currentRadius]);

  // Handle Google Places search
  const handleSearchChange = (e) => {
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

  // Select place from Google search
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
        if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
      }

      onChange({
        ...locationData,
        latitude: parseFloat(lat.toFixed(7)),
        longitude: parseFloat(lng.toFixed(7)),
        address: fullAddress || locationData.address,
        city: parsed.city || locationData.city,
        state: parsed.state || locationData.state,
        pincode: parsed.pincode || locationData.pincode,
        country: parsed.country || 'India',
        placeId: parsed.place_id || place.id || locationData.placeId,
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
          if (circleRef.current) circleRef.current.setLatLng([latitude, longitude]);
        }
        performReverseGeocode(latitude, longitude);
      },
      (err) => {
        toast.dismiss(toastId);
        toast.error(`Unable to retrieve GPS: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & Google Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span>Google Maps Location & Yard Geofence</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
              Interactive GPS
            </span>
          </label>
          <p className="text-[11px] text-slate-500 font-medium">
            Search station/address or drag pin to the exact depot entrance gate
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Map style toggle */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setMapStyle('roadmap')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mapStyle === 'roadmap' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mapStyle === 'satellite' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Current GPS button */}
          <button
            type="button"
            onClick={handleLocateCurrent}
            title="Pin to current GPS position"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">My GPS</span>
          </button>
        </div>
      </div>

      {/* Google Places Autocomplete Input */}
      <div className="relative z-20">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (predictions.length > 0) setIsDropdownOpen(true);
            }}
            placeholder="Search depot name, bus terminal, or landmark via Google Places..."
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          {searching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Places Dropdown */}
        {isDropdownOpen && predictions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100 z-50">
            {predictions.map((p, idx) => (
              <button
                key={p.id || idx}
                type="button"
                onClick={() => handleSelectPlace(p)}
                className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
              >
                <span className="text-base mt-0.5">📍</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {p.displayName?.text || p.formattedAddress}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {p.formattedAddress}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-80 z-10" />

        {/* Reverse Geocoding Loading Indicator Badge */}
        {isReverseGeocoding && (
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs border border-blue-200 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-blue-700">
            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Resolving reverse address with Google...</span>
          </div>
        )}

        {/* Floating Hint Overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/85 backdrop-blur-xs text-white px-3.5 py-2 rounded-xl text-[11px] flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 truncate">
            <span className="text-amber-400 font-bold">💡 Tip:</span>
            <span className="truncate">Drag pin or click map to move depot location</span>
          </div>
          <div className="font-mono text-[10px] text-slate-300 font-bold ml-2 shrink-0">
            GPS: {Number(currentLat).toFixed(4)}, {Number(currentLng).toFixed(4)}
          </div>
        </div>
      </div>

      {/* Geofence Radius Slider */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span>Automated Entry/Exit Geofence Radius</span>
            <span className="text-[10px] text-slate-400 font-normal">(Virtual boundary)</span>
          </label>
          <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            {currentRadius} meters
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400">100m</span>
          <input
            type="range"
            min="100"
            max="1500"
            step="50"
            value={currentRadius}
            onChange={(e) => onChange({ ...locationData, geofenceRadius: Number(e.target.value) })}
            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-[10px] font-bold text-slate-400">1500m</span>
        </div>
        <p className="text-[10px] text-slate-500">
          Vehicles entering this blue circular perimeter automatically switch status to <span className="font-bold text-slate-700">In Depot</span>.
        </p>
      </div>

      {/* Structured Address Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        <div className="sm:col-span-2 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Complete Street / Compound Address *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Plot 45, Sector 18, Near Express Highway"
            value={locationData.address || ''}
            onChange={(e) => onChange({ ...locationData, address: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
          <input
            type="text"
            required
            placeholder="e.g. Mumbai, Bengaluru"
            value={locationData.city || ''}
            onChange={(e) => onChange({ ...locationData, city: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">State / Province</label>
          <input
            type="text"
            placeholder="e.g. Maharashtra, Karnataka"
            value={locationData.state || ''}
            onChange={(e) => onChange({ ...locationData, state: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Pincode / Postal Code</label>
          <input
            type="text"
            placeholder="e.g. 400001"
            value={locationData.pincode || ''}
            onChange={(e) => onChange({ ...locationData, pincode: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
          <input
            type="text"
            placeholder="India"
            value={locationData.country || 'India'}
            onChange={(e) => onChange({ ...locationData, country: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">GPS Latitude (North)</label>
          <input
            type="number"
            step="0.0000001"
            placeholder="19.0760"
            value={locationData.latitude ?? ''}
            onChange={(e) => onChange({ ...locationData, latitude: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">GPS Longitude (East)</label>
          <input
            type="number"
            step="0.0000001"
            placeholder="72.8777"
            value={locationData.longitude ?? ''}
            onChange={(e) => onChange({ ...locationData, longitude: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default DepotLocationPicker;
