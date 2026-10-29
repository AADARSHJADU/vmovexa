import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation.js';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import { useGoogleApis } from '../../hooks/useGoogleApis.js';

export const SuperGoogleApisPage = () => {
  const { t } = useTranslation();
  const {
    settings,
    loading,
    saving,
    testing,
    testResults,
    fetchSettings,
    updateSettings,
    testApis,
    updateLocalField,
  } = useGoogleApis();

  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeApiTab, setActiveApiTab] = useState('all');

  useEffect(() => {
    fetchSettings().catch((err) => {
      toast.error(`Failed to load Google API settings: ${err.message}`);
    });
  }, [fetchSettings]);

  const handleCopyKey = () => {
    if (settings?.api_key) {
      navigator.clipboard.writeText(settings.api_key);
      setCopiedKey(true);
      toast.success('Google API key copied to clipboard!');
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const tid = toast.loading('Saving Google API settings to database...');
    try {
      await updateSettings(settings).unwrap();
      toast.dismiss(tid);
      toast.success('Google API settings & endpoints saved successfully!');
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.message || 'Failed to save settings');
    }
  };

  const handleRunTelemetryTest = async () => {
    const tid = toast.loading('Pinging all 5 Google Cloud APIs in real time...');
    try {
      const res = await testApis(settings.api_key).unwrap();
      toast.dismiss(tid);
      if (res.overallStatus === 'all_operational') {
        toast.success('All 5 Google APIs are 100% OPERATIONAL!');
      } else if (res.overallStatus === 'partially_operational') {
        toast.success(`${res.operationalCount}/${res.totalApis} Google APIs Operational! (Check disabled APIs below)`);
      } else {
        toast.error('Google APIs telemetry test failed. Check API key authorization.');
      }
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.message || 'Telemetry test failed');
    }
  };

  const projectId = settings.project_id || '1007241948280';

  const confirmedApisList = [
    {
      id: 'geocoding',
      num: 1,
      name: 'Google Geocoding API',
      category: 'Forward & Reverse Geocoding',
      description: 'Converts vehicle GPS (Latitude, Longitude) into human-readable street addresses, and translates stop addresses into coordinates.',
      urlField: 'geocoding_api_url',
      defaultUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
      consoleUrl: `https://console.developers.google.com/apis/api/geocoding-backend.googleapis.com/overview?project=${projectId}`,
      sampleQuery: 'latlng=28.6139,77.2090 (or address=New+Delhi)',
      method: 'GET',
    },
    {
      id: 'routes',
      num: 2,
      name: 'Google Routes API (New Generation)',
      category: 'Route Engine & Traffic-Aware ETA',
      description: 'Calculates real-time traffic-aware ETAs, route distances between depots/stops, and generates encoded path polylines. Replaces legacy Directions & Distance Matrix.',
      urlField: 'routes_api_url',
      defaultUrl: 'https://routes.googleapis.com/directions/v2:computeRoutes',
      consoleUrl: `https://console.developers.google.com/apis/api/routes.googleapis.com/overview?project=${projectId}`,
      sampleQuery: 'POST { origin, destination, travelMode: "DRIVE" }',
      method: 'POST',
    },
    {
      id: 'places',
      num: 3,
      name: 'Google Places API (New)',
      category: 'Search & Autocomplete',
      description: 'Instant autocomplete and text search for bus stops, terminals, stations, landmarks, and advertiser campaign target locations.',
      urlField: 'places_api_url',
      defaultUrl: 'https://places.googleapis.com/v1/places:searchText',
      consoleUrl: `https://console.developers.google.com/apis/api/places.googleapis.com/overview?project=${projectId}`,
      sampleQuery: 'POST { textQuery: "Kashmere Gate ISBT Delhi" }',
      method: 'POST',
    },
    {
      id: 'roads',
      num: 4,
      name: 'Google Roads API',
      category: 'Snap-to-Roads & Speed Limits',
      description: 'Snaps drifting GPS coordinates to actual road geometries so moving vehicles stay on the highway line, and checks speed limits for driver safety.',
      urlField: 'roads_api_url',
      defaultUrl: 'https://roads.googleapis.com/v1/snapToRoads',
      consoleUrl: `https://console.developers.google.com/apis/api/roads.googleapis.com/overview?project=${projectId}`,
      sampleQuery: 'path=28.6139,77.2090|28.6140,77.2091&interpolate=true',
      method: 'GET',
    },
    {
      id: 'maps_sdk',
      num: 5,
      name: 'Google Maps SDK & Static Map',
      category: 'Mobile Display & Map Snapshots',
      description: 'Renders the live interactive map on Android driver tablets, and generates server-side static map image thumbnails for invoices and reports.',
      urlField: 'maps_static_api_url',
      defaultUrl: 'https://maps.googleapis.com/maps/api/staticmap',
      consoleUrl: `https://console.developers.google.com/apis/api/maps-android-backend.googleapis.com/overview?project=${projectId}`,
      sampleQuery: 'center=28.6139,77.2090&zoom=14&size=600x300',
      method: 'SDK / GET',
    },
  ];

  const getTestStatusForApi = (apiId) => {
    if (!testResults?.results) return null;
    return testResults.results.find((r) => r.id === apiId);
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
          { label: t('superadmin.settings.title', 'Settings'), path: '/superadmin/settings' },
          { label: t('superadmin.google_apis.title', 'Google Maps Platform & 5 APIs Engine') },
        ]}
        className="mb-2"
      />

      {/* 1. Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-2">
              <FleetIcons.Map className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>{t('superadmin.google_apis.title', 'Google Maps Platform & 5 APIs Engine')}</span>
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {t('superadmin.google_apis.badge_5apis', 'Client Confirmed 5 APIs')}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {t('superadmin.google_apis.subtitle', 'Manage Google API Key, configure microservice API endpoints (Routes, Geocoding, Places, Roads, Maps SDK), and run real-time telemetry health checks.')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to="/superadmin/test-google-apis"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs font-bold transition-all shadow-xs"
          >
            <FleetIcons.Terminal className="w-4 h-4 text-emerald-600" />
            <span>{t('superadmin.google_apis.playground_btn', 'Interactive Demo Playground')}</span>
            <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-1.5 py-0.5 rounded font-black">{t('common.new', 'NEW')}</span>
          </Link>

          <button
            type="button"
            disabled={testing}
            onClick={handleRunTelemetryTest}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {testing ? (
              <>
                <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />
                <span>{t('superadmin.google_apis.pinging', 'Pinging 5 APIs...')}</span>
              </>
            ) : (
              <span className="flex items-center gap-1.5">
                <FleetIcons.Zap className="w-4 h-4 text-white" />
                <span>{t('superadmin.google_apis.test_all', 'Test All 5 Google APIs')}</span>
              </span>
            )}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-95 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin" />
                <span>{t('common.saving', 'Saving...')}</span>
              </>
            ) : (
              <span className="flex items-center gap-1.5">
                <FleetIcons.Save className="w-3.5 h-3.5" />
                <span>{t('superadmin.google_apis.save_endpoints', 'Save Endpoints')}</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Top Banner: Master Key Configuration Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
              <FleetIcons.Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('superadmin.google_apis.key_card_title', 'Google Cloud Master API Key')}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {t('superadmin.google_apis.active_in_db', 'Active in MySQL DB')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t('superadmin.google_apis.key_card_desc', 'Saved in google_api_settings table and passed dynamically to all mobility services.')}
              </p>
            </div>
          </div>

          {/* Quick Environment and Status Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Active Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={Boolean(settings.is_active)}
                onChange={(e) => updateLocalField('is_active', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
              <span>{t('superadmin.google_apis.enable_apis', 'Enable APIs')}</span>
            </label>

            {/* Environment Selector */}
            <div className="bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg flex items-center gap-1 font-bold">
              {['production', 'staging', 'development'].map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => updateLocalField('environment', env)}
                  className={`px-2.5 py-1 rounded-md text-[11px] capitalize transition-all cursor-pointer ${
                    settings.environment === env
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>

            {/* Google Cloud Console Link */}
            <a
              href={`https://console.cloud.google.com/google/maps-apis/overview?project=${projectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 font-bold text-slate-700 dark:text-zinc-300 inline-flex items-center gap-1.5 transition-all"
            >
              <span>Console ({projectId})</span>
              <FleetIcons.ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* API Key Input Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-8">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              {t('superadmin.google_apis.key_label', 'Google API Key (Secret)')}
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.api_key || ''}
                onChange={(e) => updateLocalField('api_key', e.target.value)}
                placeholder="AIzaSyBqlBrj..."
                className="w-full pl-3.5 pr-24 py-2 font-mono text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showKey ? t('common.hide', 'Hide') : t('common.reveal', 'Reveal')}
                </button>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-2 py-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {copiedKey ? t('common.copied', 'Copied! ✓') : t('common.copy', 'Copy')}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              {t('superadmin.google_apis.project_id_label', 'Google Cloud Project ID')}
            </label>
            <input
              type="text"
              value={settings.project_id || ''}
              onChange={(e) => updateLocalField('project_id', e.target.value)}
              placeholder={t('superadmin.google_apis.ph_project_id', 'e.g. 1007241948280 or vmovexa-prod')}
              className="w-full px-3.5 py-2 font-mono text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Live Telemetry Test Results Banner (If tested) */}
      {testResults && (
        <div
          className={`p-4 rounded-xl border transition-all ${
            testResults.overallStatus === 'all_operational'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800">
                {testResults.overallStatus === 'all_operational' ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs"></span>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs"></span>
                )}
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>
                    Telemetry Audit: {testResults.operationalCount}/{testResults.totalApis} Google APIs Operational
                  </span>
                  <span className="text-[10px] font-mono opacity-70">
                    ({new Date(testResults.testedAt).toLocaleTimeString()})
                  </span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  {testResults.overallStatus === 'all_operational'
                    ? 'All 5 Google APIs responded successfully with valid payloads and low latency.'
                    : 'Some APIs are pending 1-click activation in your Google Cloud Console. Check individual cards below.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-zinc-300">
                Health: {Math.round((testResults.operationalCount / testResults.totalApis) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. The 5 Confirmed Google APIs Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Confirmed 5 Google Maps APIs — Endpoints & Configuration
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Section 1 & 10 Client Specifications
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {confirmedApisList.map((api) => {
            const testStatus = getTestStatusForApi(api.id);
            const isOperational = testStatus ? testStatus.isOperational : null;

            return (
              <div
                key={api.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-zinc-700"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Info & Description */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-black text-xs flex items-center justify-center">
                        {api.num}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {api.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                        {api.category}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {api.method}
                      </span>

                      {/* Live Test Status Badge */}
                      {testStatus && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isOperational
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          <span>{isOperational ? '● LIVE' : '▲ ACTION REQUIRED'}</span>
                          <span className="opacity-70 font-mono">({testStatus.latencyMs}ms)</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed pt-0.5">
                      {api.description}
                    </p>

                    {testStatus && !isOperational && (
                      <div className="mt-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium flex items-center gap-1">
                          <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{testStatus.message}</span>
                        </span>
                        <a
                          href={api.consoleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-bold whitespace-nowrap inline-flex items-center gap-1"
                        >
                          <span>{t('superadmin.google_apis.enable_in_console', '1-Click Enable in Console')}</span>
                          <FleetIcons.ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right: Direct Enable Link */}
                  <a
                    href={api.consoleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 shrink-0"
                  >
                    <span>{t('superadmin.google_apis.console_enable_link', 'Console Enable Link')}</span>
                    <FleetIcons.ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Endpoint URL Input */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 w-32 shrink-0">
                      API Endpoint URL:
                    </label>
                    <input
                      type="text"
                      value={settings[api.urlField] || api.defaultUrl}
                      onChange={(e) => updateLocalField(api.urlField, e.target.value)}
                      className="flex-1 px-3 py-1.5 font-mono text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => updateLocalField(api.urlField, api.defaultUrl)}
                      className="text-[11px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer"
                      title={t('superadmin.google_apis.reset_endpoint_title', 'Reset to official Google endpoint')}
                    >
                      {t('common.reset', 'Reset')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Additional Endpoints Configuration (Places Autocomplete & Speed Limits) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          {t('superadmin.google_apis.aux_title', 'Auxiliary Google Endpoints & Parameters')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
              {t('superadmin.google_apis.places_url', 'Places Autocomplete URL:')}
            </label>
            <input
              type="text"
              value={settings.places_autocomplete_url || 'https://places.googleapis.com/v1/places:autocomplete'}
              onChange={(e) => updateLocalField('places_autocomplete_url', e.target.value)}
              className="w-full px-3 py-1.5 font-mono text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
              {t('superadmin.google_apis.roads_url', 'Roads Speed Limits URL:')}
            </label>
            <input
              type="text"
              value={settings.roads_speed_limits_url || 'https://roads.googleapis.com/v1/speedLimits'}
              onChange={(e) => updateLocalField('roads_speed_limits_url', e.target.value)}
              className="w-full px-3 py-1.5 font-mono text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="pt-2">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
            {t('superadmin.google_apis.notes_label', 'Integration Notes / Quota Limits:')}
          </label>
          <textarea
            rows={2}
            value={settings.notes || ''}
            onChange={(e) => updateLocalField('notes', e.target.value)}
            placeholder={t('superadmin.google_apis.ph_notes', 'e.g. 10-bus pilot project quota allocations, custom rate limits, or staging notes.')}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 6. Footer Save Bar */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500 dark:text-zinc-400">
          {t('common.last_tested', 'Last tested:')} {settings.last_tested_at ? new Date(settings.last_tested_at).toLocaleString() : t('common.never', 'Never')}
        </span>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? t('superadmin.google_apis.saving_settings', 'Saving Google Settings...') : t('superadmin.google_apis.save_config_btn', 'Save Configuration to Database')}
        </button>
      </div>
    </div>
  );
};

export default SuperGoogleApisPage;
