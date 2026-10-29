import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import googleApisService from '../../api/services/googleApis.service.js';

export const SuperGoogleApisPlaygroundPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('geocoding'); // 'geocoding' | 'routes' | 'places' | 'roads' | 'static_map'

  // --- 1. Geocoding State ---
  const [geocodeInputType, setGeocodeInputType] = useState('address'); // 'address' | 'coords'
  const [geocodeAddress, setGeocodeAddress] = useState('Connaught Place, New Delhi');
  const [geocodeLat, setGeocodeLat] = useState('28.6139');
  const [geocodeLng, setGeocodeLng] = useState('77.2090');
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState(null);

  // --- 2. Routes State ---
  const [routeOrigin, setRouteOrigin] = useState({ name: 'Delhi Central Depot', lat: 28.6139, lng: 77.2090 });
  const [routeDest, setRouteDest] = useState({ name: 'New Delhi Railway Station', lat: 28.6328, lng: 77.2197 });
  const [routesLoading, setRoutesLoading] = useState(false);
  const [routesResult, setRoutesResult] = useState(null);

  // --- 3. Places State ---
  const [placesQuery, setPlacesQuery] = useState('Kashmere Gate ISBT Bus Terminal Delhi');
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesResult, setPlacesResult] = useState(null);

  // --- 4. Roads State ---
  const [roadsCoords, setRoadsCoords] = useState('28.6139,77.2090|28.6141,77.2093|28.6145,77.2098');
  const [roadsLoading, setRoadsLoading] = useState(false);
  const [roadsResult, setRoadsResult] = useState(null);

  // --- 5. Static Map State ---
  const [mapLat, setMapLat] = useState('28.6139');
  const [mapLng, setMapLng] = useState('77.2090');
  const [mapZoom, setMapZoom] = useState(14);
  const [mapUrl, setMapUrl] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);

  // --- Handlers ---
  const handleRunGeocode = async () => {
    setGeocodeLoading(true);
    try {
      const payload =
        geocodeInputType === 'address'
          ? { address: geocodeAddress }
          : { lat: geocodeLat, lng: geocodeLng };
      const res = await googleApisService.demoGeocode(payload);
      setGeocodeResult(res.data);
      toast.success(`Geocoding completed in ${res.data?.latencyMs || 0}ms!`);
    } catch (err) {
      toast.error(err.message || 'Geocoding failed');
    } finally {
      setGeocodeLoading(false);
    }
  };

  const handleRunRoutes = async () => {
    setRoutesLoading(true);
    try {
      const res = await googleApisService.demoRoutes({
        origin: { latitude: routeOrigin.lat, longitude: routeOrigin.lng },
        destination: { latitude: routeDest.lat, longitude: routeDest.lng },
        travelMode: 'DRIVE',
      });
      setRoutesResult(res.data);
      toast.success(`Route calculated in ${res.data?.latencyMs || 0}ms!`);
    } catch (err) {
      toast.error(err.message || 'Routes calculation failed');
    } finally {
      setRoutesLoading(false);
    }
  };

  const handleRunPlaces = async () => {
    setPlacesLoading(true);
    try {
      const res = await googleApisService.demoPlaces({ query: placesQuery });
      setPlacesResult(res.data);
      toast.success(`Found ${res.data?.places?.length || 0} places in ${res.data?.latencyMs || 0}ms!`);
    } catch (err) {
      toast.error(err.message || 'Places search failed');
    } finally {
      setPlacesLoading(false);
    }
  };

  const handleRunRoads = async () => {
    setRoadsLoading(true);
    try {
      const res = await googleApisService.demoRoads({ coordinates: roadsCoords });
      setRoadsResult(res.data);
      toast.success(`Snapped ${res.data?.snappedPoints?.length || 0} points in ${res.data?.latencyMs || 0}ms!`);
    } catch (err) {
      toast.error(err.message || 'Road snapping failed');
    } finally {
      setRoadsLoading(false);
    }
  };

  const handleLoadMap = async () => {
    setMapLoading(true);
    try {
      const res = await googleApisService.demoStaticMap({ lat: mapLat, lng: mapLng, zoom: mapZoom });
      setMapUrl(res.data?.mapUrl);
      toast.success('Static map generated!');
    } catch (err) {
      toast.error(err.message || 'Map generation failed');
    } finally {
      setMapLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('nav.superadmin'), href: '/superadmin/dashboard', icon: FleetIcons.Dashboard },
          { label: t('superadmin.google_apis.title'), href: '/superadmin/settings/google-apis' },
          { label: t('superadmin.google_apis.simulator_title') },
        ]}
      />

      {/* 1. Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <FleetIcons.Terminal className="w-6 h-6 text-emerald-600 dark:text-emerald-400 inline mr-1 shrink-0" />
            <span>{t('superadmin.google_apis.playground_heading')}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {t('superadmin.google_apis.db_key_active')}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {t('superadmin.google_apis.playground_desc')}
          </p>
        </div>

        {/* Top Button to switch to Endpoints Config */}
        <Link
          to="/superadmin/settings/google-apis"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-xs transition-all w-full sm:w-auto shrink-0"
        >
          <FleetIcons.Settings className="w-3.5 h-3.5" />
          <span>{t('superadmin.google_apis.manage_endpoints')}</span>
          <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. Interactive 5 APIs Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl">
        {[
          { id: 'geocoding', icon: <FleetIcons.Pin className="w-3.5 h-3.5 text-blue-500" />, title: '1. Geocoding', sub: 'Address to GPS' },
          { id: 'routes', icon: <FleetIcons.Route className="w-3.5 h-3.5 text-indigo-500" />, title: '2. Routes API', sub: 'Traffic ETA & Polyline' },
          { id: 'places', icon: <FleetIcons.Search className="w-3.5 h-3.5 text-emerald-500" />, title: '3. Places API', sub: 'Stop/Terminal Search' },
          { id: 'roads', icon: <FleetIcons.Car className="w-3.5 h-3.5 text-amber-500" />, title: '4. Roads API', sub: 'Snap-to-Roads Jitter' },
          { id: 'static_map', icon: <FleetIcons.Map className="w-3.5 h-3.5 text-purple-500" />, title: '5. Maps SDK', sub: 'Visual Snapshot' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`p-2.5 rounded-xl text-left transition-all cursor-pointer select-none flex flex-col justify-center ${
              activeTab === tab.id
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span>{tab.icon}</span>
              <span className="truncate">{tab.title}</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
              {tab.sub}
            </span>
          </button>
        ))}
      </div>

      {/* 3. DEMO SECTION 1: GEOCODING API */}
      {activeTab === 'geocoding' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FleetIcons.Pin className="w-4 h-4 text-blue-500" />
                <span>{t('superadmin.google_apis.geocoding_title')}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {t('superadmin.google_apis.addr_to_coords')}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t('superadmin.google_apis.geocoding_desc')}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setGeocodeInputType('address')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  geocodeInputType === 'address'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                {t('superadmin.google_apis.forward_mode')}
              </button>
              <button
                type="button"
                onClick={() => setGeocodeInputType('coords')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  geocodeInputType === 'coords'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                {t('superadmin.google_apis.reverse_mode')}
              </button>
            </div>
          </div>

          {/* Input & Presets */}
          <div className="space-y-3">
            {geocodeInputType === 'address' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('superadmin.google_apis.enter_address_label')}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={geocodeAddress}
                    onChange={(e) => setGeocodeAddress(e.target.value)}
                    placeholder={t('superadmin.google_apis.address_ph')}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    disabled={geocodeLoading}
                    onClick={handleRunGeocode}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {geocodeLoading ? (
                      <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <FleetIcons.Rocket className="w-3.5 h-3.5" />
                        <span>{t('superadmin.google_apis.geocode_now')}</span>
                      </span>
                    )}
                  </button>
                </div>
                {/* Presets */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                  <span className="text-slate-400 font-medium">{t('superadmin.google_apis.try_presets')}</span>
                  {[
                    'Connaught Place, New Delhi',
                    'Indira Gandhi International Airport, Delhi',
                    'Chhatrapati Shivaji Maharaj Terminus, Mumbai',
                    'Electronic City, Bengaluru',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGeocodeAddress(preset)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('superadmin.google_apis.enter_coords_label')}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={geocodeLat}
                    onChange={(e) => setGeocodeLat(e.target.value)}
                    placeholder={t('superadmin.google_apis.lat_ph')}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={geocodeLng}
                    onChange={(e) => setGeocodeLng(e.target.value)}
                    placeholder={t('superadmin.google_apis.lng_ph')}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    disabled={geocodeLoading}
                    onClick={handleRunGeocode}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {geocodeLoading ? (
                      <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <FleetIcons.Rocket className="w-3.5 h-3.5" />
                        <span>{t('superadmin.google_apis.reverse_geocode')}</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Results Display */}
            {geocodeResult && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-3 mt-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('superadmin.google_apis.live_result_received')}</span>
                    <span className="font-mono text-[10px]">({geocodeResult.latencyMs}ms latency)</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Status: {geocodeResult.status}
                  </span>
                </div>

                {geocodeResult.firstMatch && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-500 dark:text-zinc-400">{t('superadmin.google_apis.formatted_address_label')}</span>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {geocodeResult.firstMatch.formatted_address}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-500 dark:text-zinc-400">{t('superadmin.google_apis.gps_coords_label')}</span>
                      <p className="font-mono text-slate-800 dark:text-zinc-200 font-bold">
                        Lat: {geocodeResult.firstMatch.geometry?.location?.lat}, Lng: {geocodeResult.firstMatch.geometry?.location?.lng}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        Place ID: {geocodeResult.firstMatch.place_id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. DEMO SECTION 2: ROUTES API */}
      {activeTab === 'routes' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FleetIcons.Route className="w-4 h-4 text-emerald-600" />
              <span>{t('superadmin.google_apis.routes_title')}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {t('superadmin.google_apis.routes_tag')}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {t('superadmin.google_apis.routes_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-2 text-xs">
              <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
                <span>{t('superadmin.google_apis.origin_point_label')}</span>
                <span className="font-medium text-slate-900 dark:text-white">{routeOrigin.name}</span>
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <input
                  type="text"
                  value={routeOrigin.lat}
                  onChange={(e) => setRouteOrigin({ ...routeOrigin, lat: Number(e.target.value) })}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                  placeholder={t('superadmin.google_apis.origin_lat_ph')}
                />
                <input
                  type="text"
                  value={routeOrigin.lng}
                  onChange={(e) => setRouteOrigin({ ...routeOrigin, lng: Number(e.target.value) })}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                  placeholder={t('superadmin.google_apis.origin_lng_ph')}
                />
              </div>
            </div>

            {/* Destination */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-2 text-xs">
              <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-xs"></span>
                <span>{t('superadmin.google_apis.dest_point_label')}</span>
                <span className="font-medium text-slate-900 dark:text-white">{routeDest.name}</span>
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <input
                  type="text"
                  value={routeDest.lat}
                  onChange={(e) => setRouteDest({ ...routeDest, lat: Number(e.target.value) })}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                  placeholder={t('superadmin.google_apis.dest_lat_ph')}
                />
                <input
                  type="text"
                  value={routeDest.lng}
                  onChange={(e) => setRouteDest({ ...routeDest, lng: Number(e.target.value) })}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                  placeholder={t('superadmin.google_apis.dest_lng_ph')}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">{t('superadmin.google_apis.quick_route_presets')}</span>
              <button
                type="button"
                onClick={() => {
                  setRouteOrigin({ name: 'Connaught Place Depot', lat: 28.6139, lng: 77.2090 });
                  setRouteDest({ name: 'New Delhi Railway Station', lat: 28.6328, lng: 77.2197 });
                }}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-bold hover:bg-slate-200 cursor-pointer"
              >
                Depot ➔ NDLS Station (3.5 KM)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRouteOrigin({ name: 'Kashmere Gate ISBT', lat: 28.6665, lng: 77.2268 });
                  setRouteDest({ name: 'IGI Airport Terminal 3', lat: 28.5562, lng: 77.1000 });
                }}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-bold hover:bg-slate-200 cursor-pointer"
              >
                ISBT ➔ IGI Airport (22 KM)
              </button>
            </div>

            <button
              type="button"
              disabled={routesLoading}
              onClick={handleRunRoutes}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {routesLoading ? (
                <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <FleetIcons.Zap className="w-3.5 h-3.5" />
                  <span>{t('superadmin.google_apis.calc_route_eta')}</span>
                </span>
              )}
            </button>
          </div>

          {/* Route Results Box */}
          {routesResult && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-4 mt-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Google Routes Engine Response ({routesResult.latencyMs}ms)</span>
                </span>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  TRAFFIC_AWARE MODE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('superadmin.google_apis.driving_distance')}</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {routesResult.distanceKm} KM
                  </div>
                  <span className="text-[10px] text-slate-400">({routesResult.distanceMeters} meters)</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('superadmin.google_apis.traffic_eta')}</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {routesResult.durationMinutes} Minutes
                  </div>
                  <span className="text-[10px] text-slate-400">({routesResult.durationSeconds} seconds)</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('superadmin.google_apis.encoded_polyline')}</span>
                  <div className="text-xs font-mono text-slate-700 dark:text-zinc-300 truncate mt-1" title={routesResult.polyline}>
                    {routesResult.polyline || 'Generated'}
                  </div>
                  <span className="text-[10px] text-emerald-600">{t('superadmin.google_apis.ready_leaflet')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. DEMO SECTION 3: PLACES API */}
      {activeTab === 'places' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FleetIcons.Search className="w-4 h-4 text-blue-500" />
              <span>{t('superadmin.google_apis.places_title')}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {t('superadmin.google_apis.places_tag')}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {t('superadmin.google_apis.places_desc')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              {t('superadmin.google_apis.search_places_label')}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={placesQuery}
                onChange={(e) => setPlacesQuery(e.target.value)}
                placeholder={t('superadmin.google_apis.places_ph')}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                disabled={placesLoading}
                onClick={handleRunPlaces}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {placesLoading ? (
                  <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    <FleetIcons.Search className="w-3.5 h-3.5" />
                    <span>{t('superadmin.google_apis.search_places')}</span>
                  </span>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
              <span className="text-slate-400 font-medium">{t('superadmin.google_apis.quick_searches')}</span>
              {[
                'Kashmere Gate ISBT Bus Terminal',
                'Anand Vihar ISBT Delhi',
                'Sarai Kale Khan Inter State Bus Terminal',
                'Rajiv Chowk Metro Station',
              ].map((query) => (
                <button
                  key={query}
                  type="button"
                  onClick={() => setPlacesQuery(query)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          {/* Places Results */}
          {placesResult && (
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Found {placesResult.places?.length || 0} Matches ({placesResult.latencyMs}ms)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Endpoint: {placesResult.endpointUsed}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {placesResult.places?.map((place) => (
                  <div
                    key={place.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1.5 text-xs"
                  >
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {place.displayName?.text || 'Unnamed Place'}
                    </div>
                    <p className="text-slate-500 dark:text-zinc-400 text-xs">
                      {place.formattedAddress}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Lat: {place.location?.latitude?.toFixed(4)}, Lng: {place.location?.longitude?.toFixed(4)}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">ID: {place.id?.slice(0, 10)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. DEMO SECTION 4: ROADS API */}
      {activeTab === 'roads' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FleetIcons.Car className="w-4 h-4 text-purple-600" />
              <span>{t('superadmin.google_apis.roads_title')}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                {t('superadmin.google_apis.roads_tag')}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {t('superadmin.google_apis.roads_desc')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              {t('superadmin.google_apis.raw_gps_label')}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={roadsCoords}
                onChange={(e) => setRoadsCoords(e.target.value)}
                placeholder="28.6139,77.2090|28.6141,77.2093"
                className="flex-1 px-3 py-2 font-mono text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                disabled={roadsLoading}
                onClick={handleRunRoads}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {roadsLoading ? (
                  <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    <FleetIcons.Car className="w-3.5 h-3.5" />
                    <span>{t('superadmin.google_apis.snap_roads_now')}</span>
                  </span>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {t('superadmin.google_apis.raw_gps_hint')}
            </p>
          </div>

          {/* Roads Results */}
          {roadsResult && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-3 mt-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Coordinates Aligned to Highway ({roadsResult.latencyMs}ms)</span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {roadsResult.snappedPoints?.length || 0} Snapped Points Returned
                </span>
              </div>

              <div className="space-y-2">
                {roadsResult.snappedPoints?.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="font-bold text-blue-600 dark:text-blue-400">Point #{idx + 1}</span>
                    <span className="text-slate-800 dark:text-zinc-200">
                      Lat: {pt.location?.latitude?.toFixed(6)}, Lng: {pt.location?.longitude?.toFixed(6)}
                    </span>
                    <span className="text-slate-400 text-[10px]">PlaceId: {pt.placeId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. DEMO SECTION 5: STATIC MAP */}
      {activeTab === 'static_map' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FleetIcons.Map className="w-4 h-4 text-blue-600" />
              <span>{t('superadmin.google_apis.maps_sdk_title')}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {t('superadmin.google_apis.maps_sdk_tag')}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {t('superadmin.google_apis.maps_sdk_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('superadmin.google_apis.center_lat_label')}</label>
              <input
                type="text"
                value={mapLat}
                onChange={(e) => setMapLat(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('superadmin.google_apis.center_lng_label')}</label>
              <input
                type="text"
                value={mapLng}
                onChange={(e) => setMapLng(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('superadmin.google_apis.zoom_level_label')} ({mapZoom}):</label>
              <input
                type="range"
                min="10"
                max="18"
                value={mapZoom}
                onChange={(e) => setMapZoom(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg cursor-pointer mt-2"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={mapLoading}
            onClick={handleLoadMap}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {mapLoading ? (
              <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />
            ) : (
              <span className="flex items-center gap-1.5">
                <FleetIcons.Map className="w-3.5 h-3.5" />
                <span>{t('superadmin.google_apis.render_map')}</span>
              </span>
            )}
          </button>

          {/* Map Preview */}
          {mapUrl && (
            <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 text-center space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                {t('superadmin.google_apis.live_tile_stream')}
              </span>
              <img
                src={mapUrl}
                alt="Google Static Map Snapshot"
                className="rounded-xl border border-slate-200 dark:border-zinc-700 shadow-md mx-auto max-w-full h-auto"
              />
              <p className="text-[11px] font-mono text-slate-400">
                URL: {mapUrl}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperGoogleApisPlaygroundPage;
