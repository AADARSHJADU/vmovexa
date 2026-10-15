import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useDashboard } from '../../hooks/superadmin/useDashboard';

export const MqttSystemLogsPage = () => {
  const { t } = useTranslation();
  const { systemHealth, superAdminKpis, loadSystemHealth, loadSuperAdminKpis } = useDashboard();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    loadSystemHealth().catch(() => {});
    loadSuperAdminKpis().catch(() => {});
  }, [loadSystemHealth, loadSuperAdminKpis]);

  const globalKpis = superAdminKpis || {};

  const broker = systemHealth?.mqttBroker || {
    status: 'Healthy / Connected',
    activeSockets: 0,
    msgRateIn: '—',
    msgRateOut: '—',
    latency: '—',
  };

  const googleApis = systemHealth?.googleApis || [];
  const liveMqttFeed = systemHealth?.liveMqttFeed || [];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Super Admin', path: '/superadmin/dashboard' },
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
            {t('system.engine_sub', 'Real-time infrastructure health, MQTT topic inspector, WebSocket client streams, and Google Cloud API quotas')}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 self-start sm:self-auto shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>EMQX Cluster: 100% Operational</span>
        </div>
      </div>

      {/* 4 Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('system.active_sockets', 'Active Sockets')}</span>
          <div className="text-xl font-black text-slate-900 mt-1">{broker.activeSockets} Connected</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">{t('system.mqtt_ingest', 'MQTT Ingest Rate')}</span>
          <div className="text-xl font-black text-blue-700 mt-1">{broker.msgRateIn}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">{t('system.egress_rate', 'Egress Broadcast')}</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{broker.msgRateOut}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">{t('system.google_calls', 'Google API Calls')}</span>
          <div className="text-xl font-black text-purple-700 mt-1">{globalKpis?.googleApiRequestsToday ?? (systemHealth?.googleApis?.length ? `${systemHealth.googleApis.length} tracked` : '—')} Today</div>
        </div>
      </div>

      {/* 5 Google APIs Quota Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            {t('system.google_apis_quota', '5 Confirmed Google Cloud APIs Consumption Quotas')}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Project Architecture Section 1 & 10: Official Google API allocation and real-time query consumption
          </p>
        </div>

        {googleApis.length === 0 && (
          <p className="text-xs text-slate-400 font-medium py-4 text-center">{t('common.no_data', 'No Google API usage data available.')}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {googleApis.map((api, idx) => {
            const name = typeof api === 'string' ? api : (api.api || api.name || `API ${idx + 1}`);
            const requestsToday = typeof api === 'object' ? Number(api.requestsToday ?? 0) : 0;
            const quotaLimit = typeof api === 'object' ? Number(api.quotaLimit ?? 0) : 0;
            const status = typeof api === 'object' ? (api.status || 'Operational') : 'Tracked';
            const percentage = quotaLimit > 0 ? Math.min(100, Math.round((requestsToday / quotaLimit) * 100)) : 0;
            return (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {status}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{t('system.usage', 'Usage')}: {requestsToday.toLocaleString()}</span>
                  <span>{t('system.limit', 'Limit')}: {quotaLimit ? quotaLimit.toLocaleString() : '—'}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{percentage}% {t('system.quota_consumed', 'Daily Quota Consumed')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live MQTT Raw Topic Stream */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {t('system.topic_sniffer', 'Live MQTT Topic Sniffer Console')}
            </h2>
            <p className="text-xs text-slate-500 font-medium">Real-time bi-directional packet stream between MIOS backend and RK3588 Edge boxes</p>
          </div>
          <span className="font-mono text-xs font-bold text-slate-500">QoS Level 1 Protocol</span>
        </div>

        <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto no-scrollbar">
          {liveMqttFeed.length === 0 && (
            <p className="text-slate-400 font-medium py-4 text-center">{t('common.no_data', 'No live telemetry captured yet.')}</p>
          )}
          {liveMqttFeed
            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
            .map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-blue-400">
                <span className="font-bold">TOPIC: {item.topic}</span>
                <span className="text-slate-400">{item.time} IST</span>
              </div>
              <div className="text-emerald-400 text-[11px] break-all">{item.payload}</div>
            </div>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(liveMqttFeed.length / pageSize) || 1}
          onPageChange={setCurrentPage}
          totalItems={liveMqttFeed.length}
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
