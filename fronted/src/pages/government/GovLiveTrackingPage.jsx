import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { useTranslation } from '../../hooks/useTranslation';
import { governmentService } from '../../api/services/government/government.service';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const GovLiveTrackingPage = () => {
  const { t } = useTranslation();

  const [selectedRoute, setSelectedRoute] = useState('all'); // route id or 'all'
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Map Layer Style State
  const [mapStyle, setMapStyle] = useState('roadmap'); // 'roadmap', 'satellite', 'traffic', 'terrain'
  const [activeVehicleId, setActiveVehicleId] = useState(null);

  // Real data from backend
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState({ total: 0, broadcasting: 0, standby: 0, offline: 0, withGps: 0 });
  const [loading, setLoading] = useState(true);

  // Map Container & Instance Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});

  // Load real vehicles + GPS (filtered by selected route) and route list.
  const loadTracking = useCallback(async () => {
    setLoading(true);
    try {
      const res = await governmentService.getLiveTracking({ routeId: selectedRoute });
      setVehicles(Array.isArray(res?.vehicles) ? res.vehicles : []);
      if (res?.stats) setStats(res.stats);
    } catch (err) {
      toast.error(err?.message || 'Failed to load live tracking');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRoute]);

  useEffect(() => { loadTracking(); }, [loadTracking]);

  useEffect(() => {
    governmentService.getTrackingRoutes().then((r) => setRoutes(Array.isArray(r) ? r : [])).catch(() => {});
  }, []);

  // Auto-refresh every 15s for live positions.
  useEffect(() => {
    const refreshInterval = setInterval(() => { loadTracking(); }, 15000);
    return () => clearInterval(refreshInterval);
  }, [loadTracking]);

  // Tile layer URL resolver for Google Maps Tile API
  const getGoogleTileUrl = (style) => {
    switch (style) {
      case 'satellite':
        // Google Satellite Hybrid (Imagery + Vector Roads)
        return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      case 'traffic':
        // Google Vector Roadmap with Live Traffic Layer
        return 'https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}';
      case 'terrain':
        // Google Terrain Relief
        return 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      case 'roadmap':
      default:
        // Google Standard Vector Roadmap
        return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    }
  };

  // 1. Initialize Real Leaflet Map with Google Maps Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Leaflet Map Instance centered on Bhopal, MP (23.2599, 77.4126)
      const map = L.map(mapContainerRef.current, {
        center: [23.2350, 77.4150],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Real Google Maps Tile Layer
      const tileLayer = L.tileLayer(getGoogleTileUrl(mapStyle), {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Google Maps tile style when changed
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getGoogleTileUrl(mapStyle));
    }
  }, [mapStyle]);

  // Sync Leaflet Markers with real vehicle GPS data
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const gpsVehicles = vehicles.filter((v) => v.lat != null && v.lng != null);

    gpsVehicles.forEach((v) => {
      const isSelected = activeVehicleId === v.id;
      const markerColor = v.screenStatus === 'Broadcasting' ? '#10b981' : v.screenStatus === 'Standby' ? '#f59e0b' : '#64748b';

      const customIcon = L.divIcon({
        className: 'custom-vehicle-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 26px; height: 26px; background: ${markerColor}40; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 16px; height: 16px; background: ${markerColor}; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); ${isSelected ? 'transform: scale(1.3);' : ''}"></div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(4px); padding: 2px 8px; border-radius: 6px; margin-top: 2px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); white-space: nowrap;">
              <span style="font-size: 10px; font-weight: 800; font-family: monospace; color: #ffffff;">${v.id}</span>
              <span style="font-size: 9px; color: #94a3b8; margin-left: 4px;">· ${v.speed}</span>
            </div>
          </div>
        `,
        iconSize: [120, 50],
        iconAnchor: [60, 25],
      });

      const marker = L.marker([v.lat, v.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setActiveVehicleId(v.id);
        map.flyTo([v.lat, v.lng], 14, { duration: 1 });
      });

      markersRef.current[v.id] = marker;
    });

    // Auto-fit the map to the visible GPS vehicles (so the selected route's buses are framed).
    if (gpsVehicles.length > 0 && !activeVehicleId) {
      try {
        const bounds = L.latLngBounds(gpsVehicles.map((v) => [v.lat, v.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } catch (_) {}
    }
  }, [vehicles, activeVehicleId, mapStyle]);

  // Client-side status + search filtering (route is filtered server-side).
  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      String(v.id || '').toLowerCase().includes(q) ||
      String(v.driver || '').toLowerCase().includes(q) ||
      String(v.route || '').toLowerCase().includes(q) ||
      String(v.campaign || '').toLowerCase().includes(q);
    const matchStatus = selectedStatus === 'All' || v.screenStatus === selectedStatus;
    return matchSearch && matchStatus;
  });

  // Pagination
  const totalItems = filteredVehicles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedVehicles = filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Broadcasting':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Standby':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Offline':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const handleRecenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([23.2350, 77.4150], 12, { duration: 1 });
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Government', path: '/government/dashboard' },
              { label: 'GPS Transit Tracking' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mt-1">{t('gov.tracking.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">Real-time GPS tracking & Google Maps playback verification across {stats.total} vehicles</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{stats.withGps} on live GPS</span>
          </span>
        </div>
      </div>

      {/* 2. Route selector + real KPI stats */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('gov.tracking.select_route')}</label>
        <select
          value={selectedRoute}
          onChange={(e) => { setSelectedRoute(e.target.value); setCurrentPage(1); setActiveVehicleId(null); }}
          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{`${t('common.all_routes', 'All Routes')} (${stats.total} ${t('common.buses', 'buses')})`}</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>{r.name} {r.code ? `(${r.code})` : ''}</option>
          ))}
        </select>
        <RefreshButton
          onClick={loadTracking}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('gov.tracking.broadcasting_live')}</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{stats.broadcasting} Vehicles</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stats.total > 0 ? Math.round((stats.broadcasting / stats.total) * 100) : 0}% active rotation</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('gov.tracking.standby_idle')}</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">{stats.standby} Vehicles</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('gov.tracking.terminals_depots')}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('gov.tracking.offline_service')}</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300 mt-2">{stats.offline} Vehicles</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('gov.tracking.offline_maint')}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('gov.tracking.on_live_gps')}</span>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">{stats.withGps} Vehicles</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('gov.tracking.reporting_positions')}</p>
        </div>
      </div>

      {/* 3. Interactive Real Google Maps Component Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Real-Time State Route Map (Google Maps)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('gov.tracking.map_banner_desc')}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Google Map Layer Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {[
                { id: 'roadmap', label: 'Map' },
                { id: 'satellite', label: 'Satellite' },
                { id: 'traffic', label: 'Traffic' },
                { id: 'terrain', label: 'Terrain' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setMapStyle(style.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    mapStyle === style.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>

            {/* Recenter Button */}
            <button
              onClick={handleRecenterMap}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <FleetIcons.Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('gov.tracking.center_map')}</span>
            </button>
          </div>
        </div>

        {/* Real Leaflet + Google Maps Container */}
        <div className="relative w-full h-80 sm:h-[420px] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Google Maps Overlay Badge */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">
              Google Maps Live Telemetry Layer
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{t('gov.tracking.routes_badge')}</span>
          </div>

          {/* Active Selected Vehicle Floating Details Box if selected */}
          {activeVehicleId && (
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-blue-500/40 rounded-2xl p-4 shadow-2xl max-w-sm space-y-2 animate-in slide-in-from-bottom-2 duration-200">
              {(() => {
                const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
                if (!activeVehicle) return null;
                return (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">{activeVehicle.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(activeVehicle.screenStatus)}`}>
                          ● {activeVehicle.screenStatus}
                        </span>
                      </div>
                      <button onClick={() => setActiveVehicleId(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"><FleetIcons.Cross className="w-3.5 h-3.5 inline-block" /></button>
                    </div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">{activeVehicle.campaign}</p>
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-center">
                      <div><span className="text-slate-400">{t('common.speed')}</span><div className="font-mono font-bold text-slate-900 dark:text-slate-100">{activeVehicle.speed}</div></div>
                      <div><span className="text-slate-400">{t('common.signal')}</span><div className="font-bold text-emerald-600 dark:text-emerald-400">{activeVehicle.signal}</div></div>
                      <div><span className="text-slate-400">{t('common.battery')}</span><div className="font-mono font-bold text-slate-900 dark:text-slate-100">{activeVehicle.battery}</div></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* 4. Live Vehicle Ledger Section */}
      <div className="space-y-4">
        {/* Search, Filter Tabs & Dual View Toggle Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <FleetIcons.Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder={t('driver.trips.search_ph')}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filter Tabs & Switcher */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {['All', 'Broadcasting', 'Standby', 'Offline'].map((status) => (
                <button
                  key={status}
                  onClick={() => { setSelectedStatus(status); setCurrentPage(1); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* View Mode Toggle Switch */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              tableValue="table"
              cardValue="card"
            />
          </div>
        </div>

        {/* Vehicle List: Card View vs Table View */}
        {viewMode === 'card' ? (
          /* Card View Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedVehicles.map((v) => (
              <div
                key={v.id}
                onClick={() => {
                  setActiveVehicleId(v.id);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([v.lat, v.lng], 14, { duration: 1 });
                  }
                }}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${
                  activeVehicleId === v.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                } transition-all shadow-sm cursor-pointer flex flex-col justify-between group space-y-4`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 shrink-0">
                        <FleetIcons.Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{v.id}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{v.route}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${getStatusBadge(v.screenStatus)}`}>
                      ● {v.screenStatus}
                    </span>
                  </div>

                  {/* Broadcast Campaign info */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 mt-3 text-xs space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('gov.tracking.currently_broadcasting')}</span>
                    <p className="font-bold text-blue-600 dark:text-blue-400 truncate">{v.campaign}</p>
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('common.speed')}</div>
                      <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 mt-0.5">{v.speed}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('common.signal')}</div>
                      <div className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">{v.signal}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('common.battery')}</div>
                      <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 mt-0.5">{v.battery}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{t('common.driver')}: <strong className="text-slate-800 dark:text-slate-200">{v.driver}</strong></span>
                  <span className="text-slate-400 font-mono text-[11px]">{v.hub}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">{t('common.vehicle_id')}</th>
                    <th className="py-3.5 px-4">{t('common.route')}</th>
                    <th className="py-3.5 px-4">{t('common.driver')}</th>
                    <th className="py-3.5 px-4">{t('gov.tracking.currently_broadcasting')}</th>
                    <th className="py-3.5 px-4">{t('common.speed')}</th>
                    <th className="py-3.5 px-4">{t('gov.tracking.gps_signal')}</th>
                    <th className="py-3.5 px-4">{t('gov.tracking.playback_status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{v.id}</td>
                      <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium">{v.route}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{v.driver}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{v.campaign}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200">{v.speed}</td>
                      <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">{v.signal}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(v.screenStatus)}`}>
                          ● {v.screenStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {paginatedVehicles.length === 0 && (
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-12 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
              <FleetIcons.Search className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('gov.tracking.no_vehicles')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try adjusting your search query or route selection.
            </p>
          </div>
        )}

        {/* 5. Responsive Global Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={itemsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[6, 12, 24, 48]}
        />
      </div>
    </div>
  );
};
