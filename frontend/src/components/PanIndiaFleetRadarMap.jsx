import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FleetIcons } from './FleetIcons';
import { useDashboard } from '../hooks/superadmin/useDashboard';

// Default Pan-India center for the "All" radar view.
const INDIA_CENTER = { lat: 21.0, lng: 78.9629, zoom: 5 };

/**
 * PanIndiaFleetRadarMap — Superadmin live fleet radar.
 * 100% real backend data (same /campaigns/tracking/live + /routes endpoints used by
 * the Government Live Tracking page). Route filter + bus select drive the map.
 * No hardcoded/demo vehicles.
 */
export const PanIndiaFleetRadarMap = () => {
  const { liveTracking, trackingRoutes, loadLiveTracking, loadTrackingRoutes } = useDashboard();

  const [selectedRoute, setSelectedRoute] = useState('all');
  const [mapStyle, setMapStyle] = useState('roadmap'); // 'roadmap' | 'satellite' | 'traffic' | 'terrain'
  const [activeVehicleId, setActiveVehicleId] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});

  // Load real routes once.
  useEffect(() => {
    loadTrackingRoutes().catch(() => {});
  }, [loadTrackingRoutes]);

  // Load real vehicles (route-filtered server-side), with 15s auto-refresh.
  const refreshTracking = useCallback(async () => {
    setLoading(true);
    try {
      await loadLiveTracking({ routeId: selectedRoute });
    } catch (_) {
      /* surfaced via empty state */
    } finally {
      setLoading(false);
    }
  }, [loadLiveTracking, selectedRoute]);

  useEffect(() => { refreshTracking(); }, [refreshTracking]);

  useEffect(() => {
    const t = setInterval(() => { refreshTracking(); }, 15000);
    return () => clearInterval(t);
  }, [refreshTracking]);

  // Normalize backend vehicles to the shape the radar UI needs (no fabrication).
  const vehicles = useMemo(() => {
    const list = Array.isArray(liveTracking?.vehicles) ? liveTracking.vehicles : [];
    return list.map((v) => ({
      id: v.id,
      tenant: v.hub || v.tenant || 'Transit Fleet',
      route: v.route && v.route !== 'Unassigned' ? v.route : 'Unassigned Route',
      driver: v.driver && v.driver !== 'Unassigned' ? v.driver : 'Unassigned',
      // Backend returns speed as a display string e.g. "36 km/h"; keep as-is.
      speed: v.speed != null && v.speed !== '' ? String(v.speed) : '—',
      screenStatus: v.screenStatus || 'Offline',
      campaign: v.campaign && v.campaign !== '—' ? v.campaign : 'No active campaign',
      lat: v.lat ?? null,
      lng: v.lng ?? null,
      hasGps: Boolean(v.hasGps),
      signal: v.signal || (v.hasGps ? 'GPS Fix' : 'No Signal'),
      battery: v.battery || '—',
      routeId: v.routeId ?? null,
    }));
  }, [liveTracking]);

  const stats = useMemo(() => {
    const s = liveTracking?.stats;
    if (s) return s;
    return {
      total: vehicles.length,
      broadcasting: vehicles.filter((v) => v.screenStatus === 'Broadcasting').length,
      withGps: vehicles.filter((v) => v.hasGps).length,
    };
  }, [liveTracking, vehicles]);

  const gpsVehicles = useMemo(() => vehicles.filter((v) => v.lat != null && v.lng != null), [vehicles]);

  // Google Maps tile resolver.
  const getGoogleTileUrl = (style) => {
    switch (style) {
      case 'satellite': return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      case 'traffic': return 'https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}';
      case 'terrain': return 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      case 'roadmap':
      default: return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    }
  };

  // Init map.
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [INDIA_CENTER.lat, INDIA_CENTER.lng],
      zoom: INDIA_CENTER.zoom,
      zoomControl: false,
      attributionControl: false,
    });
    const tileLayer = L.tileLayer(getGoogleTileUrl(mapStyle), {
      maxZoom: 19,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);
    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (tileLayerRef.current) tileLayerRef.current.setUrl(getGoogleTileUrl(mapStyle));
  }, [mapStyle]);

  // Sync real GPS markers.
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    gpsVehicles.forEach((v) => {
      const isSelected = activeVehicleId === v.id;
      const iconColor = v.screenStatus === 'Broadcasting' ? '#10b981'
        : v.screenStatus === 'Standby' ? '#f59e0b' : '#64748b';

      const customIcon = L.divIcon({
        className: 'pan-india-vehicle-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: scale(${isSelected ? 1.25 : 1}); transition: transform 0.2s;">
            <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 32px; height: 32px; background: ${iconColor}35; border-radius: 50%; ${isSelected ? 'animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;' : ''}"></div>
              <div style="width: 22px; height: 22px; background: ${iconColor}; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 3px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">🚌</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid ${isSelected ? '#3b82f6' : 'rgba(255,255,255,0.2)'}; backdrop-filter: blur(6px); padding: 2px 7px; border-radius: 6px; margin-top: 2px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); white-space: nowrap; text-align: center;">
              <div style="font-size: 10px; font-weight: 800; font-family: monospace; color: #ffffff;">${v.id}</div>
              <div style="font-size: 8px; font-weight: 700; color: ${v.hasGps ? '#34d399' : '#60a5fa'};">${v.speed}</div>
            </div>
          </div>
        `,
        iconSize: [120, 56],
        iconAnchor: [60, 28],
      });

      const marker = L.marker([v.lat, v.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      }).addTo(map);
      marker.on('click', () => handleSelectBus(v.id));
      markersRef.current[v.id] = marker;
    });

    // Auto-fit to visible GPS vehicles when nothing is actively selected.
    if (gpsVehicles.length > 0 && !activeVehicleId) {
      try {
        const bounds = L.latLngBounds(gpsVehicles.map((v) => [v.lat, v.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      } catch (_) { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsVehicles, activeVehicleId, mapStyle]);

  const handleSelectBus = (busId) => {
    if (!busId || busId === 'ALL') {
      setActiveVehicleId(null);
      if (mapInstanceRef.current && gpsVehicles.length > 0) {
        try {
          const bounds = L.latLngBounds(gpsVehicles.map((v) => [v.lat, v.lng]));
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        } catch (_) { /* ignore */ }
      } else if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([INDIA_CENTER.lat, INDIA_CENTER.lng], INDIA_CENTER.zoom, { duration: 1.2 });
      }
      return;
    }
    const veh = vehicles.find((v) => v.id === busId);
    if (!veh) return;
    setActiveVehicleId(busId);
    if (mapInstanceRef.current && veh.lat != null && veh.lng != null) {
      mapInstanceRef.current.flyTo([veh.lat, veh.lng], 14, { duration: 1.2, easeLinearity: 0.25 });
    }
  };

  const handleResetMap = () => {
    setActiveVehicleId(null);
    if (mapInstanceRef.current) {
      if (gpsVehicles.length > 0) {
        try {
          const bounds = L.latLngBounds(gpsVehicles.map((v) => [v.lat, v.lng]));
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
          return;
        } catch (_) { /* ignore */ }
      }
      mapInstanceRef.current.flyTo([INDIA_CENTER.lat, INDIA_CENTER.lng], INDIA_CENTER.zoom, { duration: 1.2 });
    }
  };

  const activeVehicle = useMemo(
    () => vehicles.find((v) => v.id === activeVehicleId) || null,
    [vehicles, activeVehicleId]
  );

  return (
    <div className="w-full space-y-3.5">
      {/* 1. Route filter + Bus select (same real pattern as /government/tracking) */}
      <div className="bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col lg:flex-row lg:items-end gap-3 shadow-xs">
        {/* Route filter */}
        <div className="flex-1 min-w-0">
          <label htmlFor="radar-route-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
            Transit Route
          </label>
          <select
            id="radar-route-select"
            value={selectedRoute}
            onChange={(e) => { setSelectedRoute(e.target.value); setActiveVehicleId(null); }}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer truncate"
          >
            <option value="all">All Routes ({stats.total ?? vehicles.length} buses)</option>
            {(trackingRoutes || []).map((r) => (
              <option key={r.id} value={r.id}>{r.name}{r.code ? ` (${r.code})` : ''}</option>
            ))}
          </select>
        </div>

        {/* Bus select */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="radar-bus-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Select Bus ({vehicles.length})
            </label>
            {activeVehicle && (
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">Tracking: {activeVehicle.id}</span>
            )}
          </div>
          <select
            id="radar-bus-select"
            value={activeVehicleId || 'ALL'}
            onChange={(e) => handleSelectBus(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer truncate"
          >
            <option value="ALL">🌍 Pan-India Radar (All buses)</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.id} — {v.route} ({v.screenStatus}{v.speed !== '—' ? ` · ${v.speed}` : ''})
              </option>
            ))}
          </select>
        </div>

        {/* Live count + reset */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1.5 h-9">
            <span className={`w-2 h-2 rounded-full bg-emerald-500 ${loading ? 'animate-ping' : 'animate-pulse'}`}></span>
            <span>{stats.withGps ?? gpsVehicles.length} Live on GPS</span>
          </span>
          <button
            onClick={handleResetMap}
            title="Reset map view"
            className="px-3 h-9 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-zinc-700 transition-colors flex items-center gap-1.5"
          >
            <FleetIcons.Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="whitespace-nowrap hidden sm:inline">Center</span>
          </button>
        </div>
      </div>

      {/* 2. Real KPI ribbon (from backend stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Total Fleet</span>
          <span className="text-sm font-black text-white">{stats.total ?? vehicles.length} Buses</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Broadcasting</span>
          <span className="text-sm font-black text-emerald-400">{stats.broadcasting ?? 0} Live</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">On Live GPS</span>
          <span className="text-sm font-black text-blue-400">{stats.withGps ?? gpsVehicles.length} Reporting</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Standby / Offline</span>
          <span className="text-sm font-black text-amber-400">{(stats.standby ?? 0) + (stats.offline ?? 0)} Idle</span>
        </div>
      </div>

      {/* 3. Map viewport */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Layer switcher */}
        <div className="absolute top-3 right-3 z-20 pointer-events-auto">
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-lg">
            {[
              { id: 'roadmap', label: 'Map' },
              { id: 'satellite', label: 'Satellite' },
              { id: 'traffic', label: 'Traffic' },
              { id: 'terrain', label: 'Terrain' },
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setMapStyle(style.id)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${mapStyle === style.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Google Maps live badge */}
        <div className="absolute top-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-[11px] font-bold text-white">Google Maps Live Telemetry</span>
        </div>

        {/* Empty state overlay when no GPS vehicles */}
        {!loading && gpsVehicles.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-slate-900/95 border border-slate-700 rounded-2xl px-6 py-5 text-center max-w-xs">
              <div className="text-3xl mb-2">🛰️</div>
              <h3 className="text-sm font-bold text-white">No live GPS positions</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {vehicles.length > 0
                  ? 'Vehicles are registered but not reporting GPS right now.'
                  : 'No vehicles found for the selected route.'}
              </p>
            </div>
          </div>
        )}

        {/* Active vehicle inspect panel — real fields only */}
        {activeVehicle && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-20 sm:max-w-md bg-slate-900/95 backdrop-blur-md border border-blue-500/50 rounded-2xl p-3.5 shadow-2xl space-y-3 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">🚌</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-white truncate">{activeVehicle.id}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                      activeVehicle.screenStatus === 'Broadcasting' ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : activeVehicle.screenStatus === 'Standby' ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      ● {activeVehicle.screenStatus}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{activeVehicle.tenant}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveVehicleId(null)}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >✕</button>
            </div>

            <p className="text-[11px] font-bold text-blue-400 truncate">{activeVehicle.campaign}</p>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[9px] uppercase">Route</span>
                <span className="font-bold text-white truncate block">{activeVehicle.route}</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[9px] uppercase">Driver</span>
                <span className="font-bold text-white truncate block">{activeVehicle.driver}</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[9px] uppercase">Speed</span>
                <span className="font-mono font-bold text-emerald-400">{activeVehicle.speed}</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[9px] uppercase">GPS Signal</span>
                <span className="font-bold text-emerald-400">{activeVehicle.signal}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
              <span className="text-slate-400 truncate">
                Lat/Lng: <span className="font-mono text-slate-300">{activeVehicle.lat != null ? `${activeVehicle.lat.toFixed(4)}, ${activeVehicle.lng.toFixed(4)}` : '—'}</span>
              </span>
              <span className="font-mono text-slate-400 shrink-0">{activeVehicle.hasGps ? 'Real GPS' : 'No GPS'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanIndiaFleetRadarMap;
