import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { decodePolyline } from '../../utils/polyline';
import { googleApisService } from '../../api/services/googleApis.service';
import { FleetIcons } from '../FleetIcons';

/**
 * RouteMapViewer — fully interactive Leaflet map.
 *
 * Props:
 *  start / end / stops      — current location data (with lat/lng)
 *  polyline                  — encoded Google polyline string
 *  onStartChange(data)       — callback when origin pin is dragged / map-clicked for origin
 *  onEndChange(data)         — callback when destination pin is dragged / map-clicked for dest
 *  onStopChange(idx, data)   — callback when a stop pin is dragged
 *  editMode                  — when true markers are draggable, map click places pins
 *  height / interactive / showControls / className
 *
 *  data object returned: { lat, lng, name, city, state, pincode, country, full_address }
 */
export const RouteMapViewer = ({
  start = null,
  end = null,
  stops = [],
  polyline = null,
  height = '420px',
  interactive = true,
  showControls = true,
  editMode = false,        // NEW — enable drag + click-to-place
  onStartChange = null,    // NEW
  onEndChange = null,      // NEW
  onStopChange = null,     // NEW
  className = '',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('roadmap');
  const [reverseLoading, setReverseLoading] = useState(false);

  // Track "click mode" — which pin to place next via map click
  const [clickMode, setClickMode] = useState(null); // null | 'origin' | 'destination'
  const clickModeRef = useRef(null);

  const getTileUrl = (style) => {
    switch (style) {
      case 'satellite':
        return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      case 'osm':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'roadmap':
      default:
        return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    }
  };

  // Reverse geocode lat/lng → structured address via backend
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await googleApisService.demoGeocode({ lat, lng });
      const first = res?.firstMatch || res?.data?.firstMatch;
      if (!first) return null;

      const comps = first.address_components || [];
      const getComp = (...types) => {
        const c = comps.find((x) => types.some((t) => x.types?.includes(t)));
        return c?.long_name || null;
      };

      return {
        city: getComp('locality', 'administrative_area_level_3', 'sublocality_level_1'),
        state: getComp('administrative_area_level_1'),
        pincode: getComp('postal_code'),
        country: getComp('country'),
        full_address: first.formatted_address || null,
        name: first.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      };
    } catch {
      return null;
    }
  }, []);

  // Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
      });

      if (interactive && showControls) {
        L.control.zoom({ position: 'bottomright' }).addTo(map);
      }

      const tileLayer = L.tileLayer(getTileUrl(mapStyle), { maxZoom: 20 }).addTo(map);
      const layerGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      layerGroupRef.current = layerGroup;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // Map click handler — place origin or destination
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !editMode) return;

    const onClick = async (e) => {
      const mode = clickModeRef.current;
      if (!mode) return;

      const { lat, lng } = e.latlng;
      setReverseLoading(true);
      const parsed = await reverseGeocode(lat, lng);
      setReverseLoading(false);

      const data = {
        lat,
        lng,
        name: parsed?.name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        city: parsed?.city || null,
        state: parsed?.state || null,
        pincode: parsed?.pincode || null,
        country: parsed?.country || null,
        full_address: parsed?.full_address || null,
      };

      if (mode === 'origin' && onStartChange) {
        onStartChange(data);
      } else if (mode === 'destination' && onEndChange) {
        onEndChange(data);
      }
      // Auto-reset after placing
      setClickMode(null);
      clickModeRef.current = null;
    };

    map.on('click', onClick);
    return () => map.off('click', onClick);
  }, [editMode, onStartChange, onEndChange, reverseGeocode]);

  // Sync clickModeRef with state
  useEffect(() => {
    clickModeRef.current = clickMode;
    const map = mapInstanceRef.current;
    if (!map) return;
    if (clickMode) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [clickMode]);

  // Update tile style
  useEffect(() => {
    if (tileLayerRef.current && mapInstanceRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(mapStyle));
    }
  }, [mapStyle]);

  // Render / update all markers, stops, polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const points = [];
    const bounds = L.latLngBounds([]);

    // ─── Origin (A) ─────────────────────────────────────────────────────────
    const startLat = start?.latitude ?? start?.lat;
    const startLng = start?.longitude ?? start?.lng;
    if (startLat != null && startLng != null && !isNaN(Number(startLat)) && !isNaN(Number(startLng))) {
      const latlng = [Number(startLat), Number(startLng)];
      points.push(latlng);
      bounds.extend(latlng);

      const startIcon = L.divIcon({
        className: 'custom-route-pin-origin',
        html: `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
            <div style="background:linear-gradient(135deg,#10b981,#059669);color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;box-shadow:0 4px 14px rgba(16,185,129,.45);border:2.5px solid white;">A</div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #059669;margin-top:-1px;"></div>
          </div>`,
        iconSize: [34, 40],
        iconAnchor: [17, 40],
        popupAnchor: [0, -40],
      });

      const marker = L.marker(latlng, {
        icon: startIcon,
        zIndexOffset: 500,
        draggable: editMode && Boolean(onStartChange),
      }).addTo(group);

      marker.bindPopup(`
        <div style="padding:4px;font-family:sans-serif;min-width:150px;">
          <div style="font-size:10px;font-weight:800;color:#10b981;text-transform:uppercase;">ORIGIN (A)</div>
          <div style="font-size:13px;font-weight:700;color:#1e293b;margin-top:2px;">${start.name || 'Origin Terminal'}</div>
          ${start.full_address || start.address ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${start.full_address || start.address}</div>` : ''}
          ${(start.city || start.state) ? `<div style="font-size:11px;color:#6366f1;margin-top:2px;">${[start.city, start.state, start.pincode].filter(Boolean).join(', ')}</div>` : ''}
          <div style="font-size:10px;font-family:monospace;color:#94a3b8;margin-top:4px;">${Number(startLat).toFixed(5)}, ${Number(startLng).toFixed(5)}</div>
          ${editMode ? '<div style="font-size:10px;color:#f59e0b;margin-top:3px;font-weight:600;">Drag pin to reposition</div>' : ''}
        </div>`);

      marker.bindTooltip(`A: ${start.name || 'Origin'}`, {
        direction: 'top',
        offset: [0, -38],
        className: 'route-stop-label-tooltip',
      });

      if (editMode && onStartChange) {
        marker.on('dragend', async (e) => {
          const { lat, lng } = e.target.getLatLng();
          setReverseLoading(true);
          const parsed = await reverseGeocode(lat, lng);
          setReverseLoading(false);
          onStartChange({
            lat,
            lng,
            name: parsed?.name || start.name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            city: parsed?.city || null,
            state: parsed?.state || null,
            pincode: parsed?.pincode || null,
            country: parsed?.country || null,
            full_address: parsed?.full_address || null,
          });
        });
      }
    }

    // ─── Intermediate Stops ──────────────────────────────────────────────────
    if (Array.isArray(stops) && stops.length > 0) {
      const sortedStops = [...stops].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));

      sortedStops.forEach((s, idx) => {
        const sLat = s?.latitude ?? s?.lat;
        const sLng = s?.longitude ?? s?.lng;
        if (sLat != null && sLng != null && !isNaN(Number(sLat)) && !isNaN(Number(sLng))) {
          const latlng = [Number(sLat), Number(sLng)];
          points.push(latlng);
          bounds.extend(latlng);

          const seqNum = s.sequence ?? idx + 1;
          const stopName = s.name || `Stop ${seqNum}`;
          const radius = Number(s.geofence_radius || 50);

          L.circle(latlng, {
            radius,
            color: '#2563eb',
            fillColor: '#60a5fa',
            fillOpacity: 0.18,
            weight: 1.5,
            dashArray: '3, 4',
          }).addTo(group);

          const stopIcon = L.divIcon({
            className: 'custom-stop-pin',
            html: `
              <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
                <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;box-shadow:0 4px 12px rgba(37,99,235,.45);border:2px solid white;">${seqNum}</div>
                <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #1d4ed8;margin-top:-1px;"></div>
              </div>`,
            iconSize: [30, 36],
            iconAnchor: [15, 36],
            popupAnchor: [0, -36],
          });

          const marker = L.marker(latlng, {
            icon: stopIcon,
            zIndexOffset: 1500 + seqNum * 15,
            draggable: editMode && Boolean(onStopChange),
          }).addTo(group);

          marker.bindTooltip(`Stop #${seqNum}: ${stopName}`, {
            permanent: true,
            direction: 'top',
            offset: [0, -36],
            className: 'route-stop-label-tooltip',
          });

          marker.bindPopup(`
            <div style="padding:4px;font-family:sans-serif;min-width:160px;">
              <div style="font-size:10px;font-weight:800;color:#2563eb;text-transform:uppercase;">STOP #${seqNum}</div>
              <div style="font-size:13px;font-weight:700;color:#1e293b;margin-top:2px;">${stopName}</div>
              ${s.full_address || s.address ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${s.full_address || s.address}</div>` : ''}
              ${(s.city || s.state) ? `<div style="font-size:11px;color:#6366f1;margin-top:2px;">${[s.city, s.state, s.pincode].filter(Boolean).join(', ')}</div>` : ''}
              ${s.halt_reason ? `<div style="margin-top:5px;padding:3px 6px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:4px;font-size:11px;color:#1d4ed8;"><strong>Halt:</strong> ${s.halt_reason}</div>` : ''}
              <div style="margin-top:5px;font-size:11px;color:#475569;display:flex;gap:8px;">
                ${s.eta ? `<span>ETA: <strong>${s.eta}</strong></span>` : ''}
                ${s.distance_km ? `<span>Dist: <strong>${s.distance_km} km</strong></span>` : ''}
              </div>
              <div style="font-size:10px;font-family:monospace;color:#94a3b8;margin-top:4px;">GPS: ${Number(sLat).toFixed(5)}, ${Number(sLng).toFixed(5)}</div>
              ${editMode ? '<div style="font-size:10px;color:#f59e0b;margin-top:3px;font-weight:600;">Drag pin to reposition</div>' : ''}
            </div>`);

          if (editMode && onStopChange) {
            // Use the original idx from sortedStops (find in original stops array)
            const originalIdx = stops.findIndex((st) => st === s || (st.id && st.id === s.id));
            marker.on('dragend', async (e) => {
              const { lat, lng } = e.target.getLatLng();
              setReverseLoading(true);
              const parsed = await reverseGeocode(lat, lng);
              setReverseLoading(false);
              onStopChange(originalIdx >= 0 ? originalIdx : idx, {
                lat,
                lng,
                name: parsed?.name || stopName,
                city: parsed?.city || null,
                state: parsed?.state || null,
                pincode: parsed?.pincode || null,
                country: parsed?.country || null,
                full_address: parsed?.full_address || null,
              });
            });
          }
        }
      });
    }

    // ─── Destination (B) ─────────────────────────────────────────────────────
    const endLat = end?.latitude ?? end?.lat;
    const endLng = end?.longitude ?? end?.lng;
    if (endLat != null && endLng != null && !isNaN(Number(endLat)) && !isNaN(Number(endLng))) {
      const latlng = [Number(endLat), Number(endLng)];
      points.push(latlng);
      bounds.extend(latlng);

      const endIcon = L.divIcon({
        className: 'custom-route-pin-dest',
        html: `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
            <div style="background:linear-gradient(135deg,#ef4444,#dc2626);color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;box-shadow:0 4px 14px rgba(239,68,68,.45);border:2.5px solid white;">B</div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #dc2626;margin-top:-1px;"></div>
          </div>`,
        iconSize: [34, 40],
        iconAnchor: [17, 40],
        popupAnchor: [0, -40],
      });

      const marker = L.marker(latlng, {
        icon: endIcon,
        zIndexOffset: 500,
        draggable: editMode && Boolean(onEndChange),
      }).addTo(group);

      marker.bindPopup(`
        <div style="padding:4px;font-family:sans-serif;min-width:150px;">
          <div style="font-size:10px;font-weight:800;color:#ef4444;text-transform:uppercase;">DESTINATION (B)</div>
          <div style="font-size:13px;font-weight:700;color:#1e293b;margin-top:2px;">${end.name || 'Destination Terminal'}</div>
          ${end.full_address || end.address ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${end.full_address || end.address}</div>` : ''}
          ${(end.city || end.state) ? `<div style="font-size:11px;color:#6366f1;margin-top:2px;">${[end.city, end.state, end.pincode].filter(Boolean).join(', ')}</div>` : ''}
          <div style="font-size:10px;font-family:monospace;color:#94a3b8;margin-top:4px;">${Number(endLat).toFixed(5)}, ${Number(endLng).toFixed(5)}</div>
          ${editMode ? '<div style="font-size:10px;color:#f59e0b;margin-top:3px;font-weight:600;">Drag pin to reposition</div>' : ''}
        </div>`);

      marker.bindTooltip(`B: ${end.name || 'Destination'}`, {
        direction: 'top',
        offset: [0, -38],
        className: 'route-stop-label-tooltip',
      });

      if (editMode && onEndChange) {
        marker.on('dragend', async (e) => {
          const { lat, lng } = e.target.getLatLng();
          setReverseLoading(true);
          const parsed = await reverseGeocode(lat, lng);
          setReverseLoading(false);
          onEndChange({
            lat,
            lng,
            name: parsed?.name || end.name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            city: parsed?.city || null,
            state: parsed?.state || null,
            pincode: parsed?.pincode || null,
            country: parsed?.country || null,
            full_address: parsed?.full_address || null,
          });
        });
      }
    }

    // ─── Road Polyline ────────────────────────────────────────────────────────
    let roadPath = [];
    if (polyline) {
      if (typeof polyline === 'string') {
        roadPath = decodePolyline(polyline);
      } else if (Array.isArray(polyline)) {
        roadPath = polyline;
      }
    }

    if (roadPath.length >= 2) {
      L.polyline(roadPath, { color: '#1e3a8a', weight: 7, opacity: 0.65, lineCap: 'round', lineJoin: 'round' }).addTo(group);
      L.polyline(roadPath, { color: '#2563eb', weight: 4.5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }).addTo(group);
      roadPath.forEach((pt) => bounds.extend(pt));
    } else if (points.length >= 2) {
      L.polyline(points, { color: '#3b82f6', weight: 3, opacity: 0.6, dashArray: '6, 8', lineCap: 'round', lineJoin: 'round' }).addTo(group);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [start, end, stops, polyline, editMode, onStartChange, onEndChange, onStopChange]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = L.latLngBounds([]);
    const sLat = start?.latitude ?? start?.lat;
    const sLng = start?.longitude ?? start?.lng;
    if (sLat && sLng) bounds.extend([Number(sLat), Number(sLng)]);
    (stops || []).forEach((s) => {
      const lat = s?.latitude ?? s?.lat;
      const lng = s?.longitude ?? s?.lng;
      if (lat && lng) bounds.extend([Number(lat), Number(lng)]);
    });
    const eLat = end?.latitude ?? end?.lat;
    const eLng = end?.longitude ?? end?.lng;
    if (eLat && eLng) bounds.extend([Number(eLat), Number(eLng)]);
    if (polyline && typeof polyline === 'string') {
      decodePolyline(polyline).forEach((pt) => bounds.extend(pt));
    }
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  };

  const hasPoints = Boolean(
    (start?.latitude || start?.lat) ||
    (end?.latitude || end?.lat) ||
    (stops && stops.length > 0)
  );

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm ${className}`} style={{ height }}>
      {/* Tooltip style */}
      <style>{`
        .route-stop-label-tooltip {
          background: rgba(15,23,42,.88) !important;
          backdrop-filter: blur(4px);
          color: #ffffff !important;
          border: 1px solid rgba(59,130,246,.6) !important;
          border-radius: 6px !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          padding: 2px 7px !important;
          box-shadow: 0 4px 10px rgba(0,0,0,.25) !important;
          white-space: nowrap !important;
        }
        .route-stop-label-tooltip::before {
          border-top-color: rgba(15,23,42,.88) !important;
        }
      `}</style>

      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

      {/* Reverse geocoding spinner */}
      {reverseLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Getting address…
        </div>
      )}

      {/* Empty State */}
      {!hasPoints && (
        <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div className="text-sm font-semibold text-white">Interactive Transit Map Preview</div>
          <div className="text-xs text-slate-200 max-w-xs mt-1">
            Search Origin, Destination, and Waypoint Stops above to plot pins and road polyline.
          </div>
          {editMode && (
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setClickMode('origin')}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FleetIcons.Pin className="w-3.5 h-3.5 text-white" />
                <span>Place Origin (A)</span>
              </button>
              <button
                type="button"
                onClick={() => setClickMode('destination')}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FleetIcons.Flag className="w-3.5 h-3.5 text-white" />
                <span>Place Destination (B)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click-to-place overlay banner */}
      {clickMode && (
        <div className="absolute top-0 inset-x-0 z-30 bg-amber-500 text-white text-xs font-bold py-2 text-center shadow-md flex items-center justify-center gap-2">
          <FleetIcons.Target className="w-4 h-4 text-white" />
          <span>Click anywhere on the map to place the {clickMode === 'origin' ? 'Origin (A)' : 'Destination (B)'}</span>
          <button
            type="button"
            onClick={() => { setClickMode(null); clickModeRef.current = null; }}
            className="ml-3 px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Floating Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          {/* Map style toggle */}
          <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md">
            <button type="button" onClick={() => setMapStyle('roadmap')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${mapStyle === 'roadmap' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              Roadmap
            </button>
            <button type="button" onClick={() => setMapStyle('satellite')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              Satellite
            </button>
            <button type="button" onClick={handleRecenter} title="Recenter"
              className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Edit mode click-to-place buttons */}
          {editMode && (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setClickMode(clickMode === 'origin' ? null : 'origin')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg border shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer ${clickMode === 'origin' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white/90 dark:bg-slate-900/90 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50'}`}
                title="Click map to place Origin (A)"
              >
                <FleetIcons.Pin className={`w-3.5 h-3.5 ${clickMode === 'origin' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                <span>Set A</span>
              </button>
              <button
                type="button"
                onClick={() => setClickMode(clickMode === 'destination' ? null : 'destination')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg border shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer ${clickMode === 'destination' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white/90 dark:bg-slate-900/90 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 hover:bg-rose-50'}`}
                title="Click map to place Destination (B)"
              >
                <FleetIcons.Flag className={`w-3.5 h-3.5 ${clickMode === 'destination' ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`} />
                <span>Set B</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Map Legend */}
      {hasPoints && (
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">A: Origin</span>
          </div>
          {stops && stops.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{stops.length} Stops</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">B: Destination</span>
          </div>
          {polyline && (
            <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-slate-700">
              <span className="w-3 h-1 rounded-full bg-blue-600" />
              <span className="text-blue-600 dark:text-blue-400 font-semibold">By Road</span>
            </div>
          )}
          {editMode && (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-semibold">
              <FleetIcons.Edit className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Edit Mode</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteMapViewer;
