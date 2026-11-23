import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useDashboard } from '../../hooks/superadmin/useDashboard';

export const MqttSystemLogsPage = () => {
  const { t } = useTranslation();
  const { systemHealth, loading, loadSystemHealth } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [feedSearch, setFeedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    loadSystemHealth().catch(() => {});
  }, [loadSystemHealth]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadSystemHealth();
      toast.success(t('system.refreshed', 'System telemetry refreshed!'));
    } catch (err) {
      toast.error(err?.message || t('system.refresh_failed', 'Failed to refresh system telemetry.'));
    } finally {
      setRefreshing(false);
    }
  }, [loadSystemHealth, t]);

  const mqtt = systemHealth?.mqtt || null;
  const isMqttConnected = Boolean(mqtt?.connected || mqtt?.status === 'connected');
  const devices = systemHealth?.devices || { total: 0, online: 0, warning: 0, offline: 0 };
  const server = systemHealth?.server || null;

  const googleMeta = systemHealth?.googleApis && !Array.isArray(systemHealth.googleApis)
    ? systemHealth.googleApis
    : null;
  const googleApis = useMemo(() => {
    if (Array.isArray(systemHealth?.googleApis)) return systemHealth.googleApis;
    if (Array.isArray(systemHealth?.googleApis?.apis)) return systemHealth.googleApis.apis;
    return [];
  }, [systemHealth]);

  const configuredApisCount = googleMeta?.configuredCount ?? googleApis.filter((a) => a.configured).length;

  const liveMqttFeed = useMemo(() => {
    if (Array.isArray(systemHealth?.liveMqttFeed)) return systemHealth.liveMqttFeed;
    if (Array.isArray(systemHealth?.recentTelemetry)) {
      return systemHealth.recentTelemetry.map((row) => ({
        id: `gps-${row.id}`,
        source: 'telemetry',
        level: 'INFO',
        topic: `vmovexa/device/${row.edge_device_id || 'unknown'}/gps`,
        time: row.created_at ? new Date(row.created_at).toLocaleTimeString('en-IN') : '—',
        payload: JSON.stringify(row),
      }));
    }
    return [];
  }, [systemHealth]);

  const filteredFeed = useMemo(() => {
    const q = feedSearch.trim().toLowerCase();
    return liveMqttFeed.filter((item) => {
      const matchesSource = sourceFilter === 'all' || item.source === sourceFilter;
      const matchesSearch =
        !q ||
        String(item.topic || '').toLowerCase().includes(q) ||
        String(item.payload || '').toLowerCase().includes(q) ||
        String(item.level || '').toLowerCase().includes(q);
      return matchesSource && matchesSearch;
    });
  }, [liveMqttFeed, sourceFilter, feedSearch]);

  const totalItems = filteredFeed.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const pagedFeed = filteredFeed.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const generatedTime = systemHealth?.generatedAt
    ? new Date(systemHealth.generatedAt).toLocaleTimeString('en-IN')
    : '—';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
          { label: t('system.engine_title', 'MQTT & System Telemetry') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('system.engine_title', 'MQTT Broker, Google 5 APIs & Telemetry Engine')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('system.engine_sub', 'Real-time infrastructure health, MQTT broker status, edge devices, and Google Cloud API configuration')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              mqtt === null
                ? 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
                : isMqttConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                mqtt === null
                  ? 'bg-slate-400'
                  : isMqttConnected
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <span>
              {mqtt === null
                ? t('common.checking', 'Checking MQTT...')
                : isMqttConnected
                ? t('system.mqtt_connected', 'MQTT Broker: Connected')
                : t('system.mqtt_disconnected', 'MQTT Broker: Disconnected')}
            </span>
          </div>

          <RefreshButton onClick={handleRefresh} loading={refreshing || loading} />
        </div>
      </div>

      {/* 4 Live Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            {t('system.mqtt_broker', 'MQTT Broker')}
          </span>
          <div className={`text-lg font-black mt-1 ${isMqttConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {mqtt ? (isMqttConnected ? 'Connected' : 'Disconnected') : '—'}
          </div>
          <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate mt-0.5" title={mqtt?.brokerUrl || ''}>
            {mqtt?.brokerUrl || '—'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {t('system.edge_devices', 'Edge Devices Online')}
          </span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">
            {devices.online} / {devices.total}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Warning: {devices.warning} · Offline: {devices.offline}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            {t('system.google_apis_configured', 'Google Cloud APIs')}
          </span>
          <div className="text-lg font-black text-purple-700 dark:text-purple-300 mt-1 font-mono">
            {configuredApisCount} / {googleApis.length || 5} Active
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 capitalize">
            Env: {googleMeta?.environment || '—'}{googleMeta?.projectId ? ` · #${googleMeta.projectId}` : ''}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {t('system.server_runtime', 'Backend Runtime')}
          </span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">
            {server?.uptimeFormatted || '—'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-mono">
            {server?.memory ? `Heap ${server.memory.heapUsedMb} MB · Synced ${generatedTime}` : `Synced ${generatedTime}`}
          </p>
        </div>
      </div>

      {/* 5 Google Cloud APIs Status Matrix */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {t('system.google_apis_quota', '5 Confirmed Google Cloud APIs Status')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {t('system.google_apis_sub', 'Live configuration and verification status from Google API settings')}
            </p>
          </div>
          <Link
            to="/superadmin/google-apis"
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <FleetIcons.Settings className="w-3.5 h-3.5" />
            <span>{t('system.configure_google_apis', 'Configure & Test APIs')}</span>
          </Link>
        </div>

        {googleApis.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium py-4 text-center">
            {t('common.no_data', 'No Google API configuration found.')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {googleApis.map((api) => {
              const isOk = api.status === 'Active' || api.status === 'Verified';
              const isErr = api.status === 'Error' || api.status === 'Not Configured';
              return (
                <div
                  key={api.key || api.name}
                  className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{api.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                        isOk
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : isErr
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {api.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate" title={api.endpoint}>
                    {api.endpoint}
                  </div>
                  {api.testMessage && (
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                      {api.testMessage}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live MQTT Raw Topic & Broker Stream */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {t('system.topic_sniffer', 'Live MQTT & Telemetry Stream')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {t('system.sniffer_sub', 'Real-time MQTT broker events and edge device GPS packets')} · {mqtt?.protocol || 'MQTT QoS 1'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="all">{t('common.all', 'All Events')}</option>
              <option value="mqtt">{t('system.broker_events', 'Broker Events')}</option>
              <option value="telemetry">{t('system.gps_telemetry', 'GPS Telemetry')}</option>
            </select>

            <div className="relative min-w-[200px]">
              <input
                type="text"
                placeholder={t('system.search_feed', 'Search topic or payload...')}
                value={feedSearch}
                onChange={(e) => {
                  setFeedSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-400"
              />
              <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto no-scrollbar">
          {pagedFeed.length === 0 ? (
            <p className="text-slate-400 dark:text-zinc-500 font-sans font-medium py-8 text-center bg-slate-50/50 dark:bg-zinc-800/20 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
              {t('common.no_data', 'No live MQTT or telemetry events captured yet.')}
            </p>
          ) : (
            pagedFeed.map((item) => (
              <div key={item.id} className="p-3 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        item.level === 'ERROR'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.level === 'WARN' || item.level === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.level || 'INFO'}
                    </span>
                    <span className="font-bold text-blue-400 truncate">
                      {t('ag.superadmin.mqttsystemlogspage.topic', 'TOPIC:')} {item.topic}
                    </span>
                  </div>
                  <span className="text-slate-400 shrink-0">
                    {item.time} {t('ag.superadmin.mqttsystemlogspage.ist', 'IST')}
                  </span>
                </div>
                <div className="text-emerald-400 text-[11px] break-all">{item.payload}</div>
              </div>
            ))
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
          pageSizeOptions={[6, 10, 20, 50]}
        />
      </div>
    </div>
  );
};

export default MqttSystemLogsPage;
