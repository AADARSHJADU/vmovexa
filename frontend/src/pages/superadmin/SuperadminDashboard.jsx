import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { PanIndiaFleetRadarMap } from '../../components/PanIndiaFleetRadarMap';
import { useDashboard } from '../../hooks/superadmin/useDashboard';
import { useSuperCampaign } from '../../hooks/superadmin/useSuperCampaign';
import { useSuperTechnician } from '../../hooks/superadmin/useSuperTechnician';
import { useSuperEmergency } from '../../hooks/superadmin/useSuperEmergency';
import { useAuth } from '../../hooks/useAuth';

export const SuperadminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const {
    superAdminKpis,
    systemHealth,
    loadSuperAdminKpis,
    loadSystemHealth,
    loadLiveTracking,
  } = useDashboard();

  const { campaigns, loadCampaigns } = useSuperCampaign();
  const { centralTechnicians, loadCentralTechnicians } = useSuperTechnician();
  const { broadcasts, loadBroadcasts } = useSuperEmergency();

  useEffect(() => {
    loadSuperAdminKpis().catch(() => {});
    loadSystemHealth().catch(() => {});
    loadLiveTracking().catch(() => {});
    loadCampaigns({ status: 'pending_approval', limit: 20 }).catch(() => {});
    loadCentralTechnicians().catch(() => {});
    loadBroadcasts().catch(() => {});
  }, [loadSuperAdminKpis, loadSystemHealth, loadLiveTracking, loadCampaigns, loadCentralTechnicians, loadBroadcasts]);

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        loadSuperAdminKpis(),
        loadSystemHealth(),
        loadLiveTracking(),
        loadCampaigns({ status: 'pending_approval', limit: 20 }),
        loadCentralTechnicians(),
        loadBroadcasts(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const rawKpis = superAdminKpis;
  const rawHealth = systemHealth;

  const kpis = {
    totalTenants: rawKpis?.totalTenants ?? rawKpis?.tenants?.total ?? 0,
    activeTenants: rawKpis?.activeTenants ?? rawKpis?.tenants?.active ?? 0,
    totalBusesMonitored: rawKpis?.totalBusesMonitored ?? 0,
    activeEdgeBoxes: rawKpis?.activeEdgeBoxes ?? 0,
    offlineEdgeBoxes: rawKpis?.offlineEdgeBoxes ?? 0,
    centralTechniciansCount: rawKpis?.centralTechniciansCount ?? 0,
    activeCampaigns: rawKpis?.activeCampaigns ?? 0,
    monthlyGmvRevenue: typeof rawKpis?.monthlyGmvRevenue === 'number'
      ? (rawKpis.monthlyGmvRevenue >= 100000
          ? `₹${(rawKpis.monthlyGmvRevenue / 100000).toFixed(2)} Lakhs`
          : `₹${rawKpis.monthlyGmvRevenue.toLocaleString('en-IN')}`)
      : (rawKpis?.monthlyGmvRevenue || '—'),
  };

  // Real MQTT connection state from backend (no fabricated throughput/socket numbers).
  const mqttConnected = (rawHealth?.mqttBroker?.status || rawHealth?.mqtt?.status) === 'connected'
    || rawHealth?.mqttBroker?.status === 'Connected';
  const health = {
    mqttBroker: {
      connected: mqttConnected,
      status: mqttConnected ? 'Connected' : 'Disconnected',
      // These metrics are not tracked in-app yet (backend returns null) — show "n/a".
      activeSockets: rawHealth?.mqttBroker?.activeSockets ?? rawHealth?.mqtt?.activeSockets ?? null,
      latency: rawHealth?.mqttBroker?.latency ?? rawHealth?.mqtt?.latency ?? null,
    },
    // Live feed = real recent GPS telemetry rows only. No fake messages.
    liveMqttFeed: Array.isArray(rawHealth?.recentTelemetry)
      ? rawHealth.recentTelemetry.map((t) => ({
          topic: `vehicle/device-${t.edge_device_id || t.id}/telemetry`,
          payload: JSON.stringify({ lat: t.lat, lng: t.lng, spd: t.speed, sat: t.satellites }),
          time: t.created_at ? new Date(t.created_at).toLocaleTimeString() : 'Just now',
        }))
      : [],
    googleApis: Array.isArray(rawHealth?.googleApis) ? rawHealth.googleApis : (rawHealth?.googleApis?.apis || []),
  };

  const broadcastList = Array.isArray(broadcasts)
    ? broadcasts
    : (Array.isArray(broadcasts?.rows)
        ? broadcasts.rows
        : (Array.isArray(broadcasts?.items)
            ? broadcasts.items
            : (Array.isArray(broadcasts?.broadcasts)
                ? broadcasts.broadcasts
                : [])));

  const activeEmergencyBroadcasts = broadcastList.filter(
    (b) => b && (b.status === 'active' || b.status === 'Active' || b.is_active || b.active),
  );

  // Pending campaigns must come from REAL Campaign records (which carry title,
  // budget, advertiser) — NOT raw ApprovalRequest rows (which only have entity_id).
  const campaignList = Array.isArray(campaigns)
    ? campaigns
    : (Array.isArray(campaigns?.rows) ? campaigns.rows : (Array.isArray(campaigns?.items) ? campaigns.items : []));

  const PENDING_STATUSES = ['pending_approval', 'submitted', 'pending', 'under_review', 'in_review'];
  const pendingCampaigns = campaignList.filter(
    (c) => c && PENDING_STATUSES.includes(String(c.status || '').toLowerCase()),
  );

  const techList = Array.isArray(centralTechnicians)
    ? centralTechnicians
    : (Array.isArray(centralTechnicians?.rows) ? centralTechnicians.rows : []);

  return (
    <div className="w-full space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Greeting & Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4 sm:pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('dashboard.title', 'Platform Dashboard')}
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 dark:bg-zinc-800 text-white shadow-2xs">
              Super Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Overview of tenants, fleet operations, and system performance · {user?.name || 'Administrator'}
          </p>
        </div>

        {/* Quick Action Buttons — Clean labels (no redundant plus signs) & mobile responsive */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title="Refresh dashboard metrics"
          />
          <Link
            to="/superadmin/finance/new"
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <FleetIcons.Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Register Finance</span>
          </Link>
          <Link
            to="/superadmin/campaigns/emergency"
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0 text-white" />
            <span className="whitespace-nowrap">{t('nav.emergency', 'Emergency Broadcast')}</span>
          </Link>
          <Link
            to="/superadmin/tenants/onboard"
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <FleetIcons.Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">{t('fleet.onboard_tenant', 'Onboard Tenant')}</span>
          </Link>
        </div>
      </div>

      {/* Active Emergency Overrides Warning Banner if any */}
      {activeEmergencyBroadcasts.length > 0 && (
        <div className="bg-red-600 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <FleetIcons.Alert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase">{t('emergency.broadcast_title', 'Emergency Safety Override Active')}</h3>
              <p className="text-xs opacity-95 mt-0.5">
                {activeEmergencyBroadcasts.length} high-priority public emergency broadcast(s) currently preempting commercial ads across screens.
              </p>
            </div>
          </div>
          <Link
            to="/superadmin/campaigns/emergency"
            className="px-4 py-2 bg-white text-red-700 text-xs font-bold rounded-xl shadow-xs hover:bg-red-50 transition-colors w-full sm:w-auto text-center shrink-0"
          >
            Manage Overrides →
          </Link>
        </div>
      )}

      {/* 6 Primary Global KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {/* Tenants */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">{t('nav.tenants', 'Total Tenants')}</span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FleetIcons.Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{kpis.totalTenants}</div>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 truncate">{kpis.activeTenants} {t('common.active', 'Active')}</p>
        </div>

        {/* Fleet Vehicles */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">{t('nav.fleets', 'Fleet Vehicles')}</span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FleetIcons.Bus className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{kpis.totalBusesMonitored}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5 truncate">{t('dashboard.active_vehicles', 'Live tracked')}</p>
        </div>

        {/* Edge Devices */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">{t('nav.devices', 'Edge Devices')}</span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FleetIcons.Speed className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{kpis.activeEdgeBoxes}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
            {kpis.offlineEdgeBoxes > 0 ? (
              <span className="text-amber-600 font-bold">{kpis.offlineEdgeBoxes} {t('common.offline', 'Offline')}</span>
            ) : (
              <span className="text-emerald-600 font-bold">All Online</span>
            )}
          </p>
        </div>

        {/* Technicians */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">{t('nav.technicians', 'Technicians')}</span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <FleetIcons.Settings className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{kpis.centralTechniciansCount}</div>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 truncate">{t('technician.central_pool', 'Field Specialists')}</p>
        </div>

        {/* Ad Campaigns */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">{t('nav.campaigns', 'Ad Campaigns')}</span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <FleetIcons.Play className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{kpis.activeCampaigns}</div>
          <p className="text-[10px] sm:text-[11px] font-medium mt-0.5 truncate">
            {pendingCampaigns.length > 0 ? (
              <span className="text-amber-600 font-bold">{pendingCampaigns.length} {t('campaigns.status_pending', 'Pending Approval')}</span>
            ) : (
              <span className="text-slate-400 dark:text-zinc-500">Active Live</span>
            )}
          </p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">{t('dashboard.revenue', 'Monthly Revenue')}</span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FleetIcons.Check className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">{kpis.monthlyGmvRevenue}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5 truncate">Subscriptions & Ads</p>
        </div>
      </div>

      {/* Live Fleet Map & MQTT Telemetry Console (Dual Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left 2 Cols: Interactive Multi-Tenant Fleet Map */}
        <div className="lg:col-span-2 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {t('dashboard.fleet_radar', 'Live Fleet Map')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Real-time GPS tracking, active transit routes, and passenger display density
              </p>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-1 border rounded-xl text-xs font-mono font-bold self-start sm:self-auto shrink-0 ${
              health.mqttBroker.connected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${health.mqttBroker.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{health.mqttBroker.connected ? 'MQTT Live' : 'MQTT Offline'}</span>
            </div>
          </div>

          {/* Interactive Fleet Radar Component */}
          <div className="w-full rounded-xl overflow-hidden">
            <PanIndiaFleetRadarMap />
          </div>
        </div>

        {/* Right 1 Col: Live Telemetry & Device Message Stream */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white truncate">
                {t('dashboard.mqtt_broker', 'Live Telemetry Stream')}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-md shrink-0 ${
                health.mqttBroker.connected
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
              }`}>
                {health.mqttBroker.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 my-3 sm:my-4">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('dashboard.active_sockets', 'Active Sockets')}</span>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">{health?.mqttBroker?.activeSockets ?? 'n/a'}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('dashboard.msg_latency', 'Latency')}</span>
                <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{health?.mqttBroker?.latency ?? 'n/a'}</div>
              </div>
            </div>

            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
              Recent Device Messages:
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar font-mono text-[11px]">
              {(health?.liveMqttFeed || []).length === 0 && (
                <div className="p-4 text-center text-[11px] text-slate-400 dark:text-zinc-500 font-sans font-medium border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                  No recent device telemetry received yet.
                </div>
              )}
              {(health?.liveMqttFeed || []).map((item, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-blue-400 gap-2">
                    <span className="truncate font-semibold">{item.topic}</span>
                    <span className="text-slate-400 shrink-0">{item.time}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 truncate">{item.payload}</div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/superadmin/system"
            className="w-full py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-98 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all text-center block mt-2"
          >
            View System Logs →
          </Link>
        </div>
      </div>

      {/* Campaigns Pending Approval & Technician Dispatch (Dual Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Left: Pending Campaigns Approvals */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Campaigns Pending Approval
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Review advertiser campaigns before broadcasting</p>
            </div>
            <Link to="/superadmin/campaigns" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0">
              {t('common.view_details', 'View All')} ({pendingCampaigns.length}) →
            </Link>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {pendingCampaigns.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium py-6 text-center">{t('dashboard.no_pending_campaigns', 'No campaigns awaiting approval.')}</p>
            )}
            {pendingCampaigns.slice(0, 5).map((c) => {
              // Real campaign fields; never fall back to a bare numeric id as the title.
              const title = c.title || c.name || (c.code ? `Campaign ${c.code}` : `Campaign #${c.id}`);
              const advertiser =
                c.advertiser?.name || c.advertiser?.company_name ||
                c.advertiser?.user?.name ||
                (typeof c.advertiser === 'string' ? c.advertiser : null) ||
                c.agency?.name || c.brand_name || c.client_name || c.client_company ||
                c.organization?.name ||
                (c.owner_type === 'government' || c.government_agency_id ? 'Government Agency' : 'Unknown advertiser');
              const category = c.category || c.type
                || (c.owner_type === 'government' || c.government_agency_id ? 'Government PSA' : 'Ad');
              const budgetNum = Number(c.budget);
              const isGov = c.owner_type === 'government' || !!c.government_agency_id;
              const budget = !Number.isNaN(budgetNum) && budgetNum > 0
                ? `₹${budgetNum.toLocaleString('en-IN')}`
                : (isGov ? 'Free (PSA)' : (c.budget && typeof c.budget === 'string' ? c.budget : 'Not set'));
              return (
                <div key={c.id} className="p-3 sm:p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center border border-blue-200/60 dark:border-blue-800 shrink-0 text-blue-600 dark:text-blue-400">
                      <FleetIcons.Play className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{title}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">{advertiser} · {category}</p>
                      <div className="flex items-center gap-2 text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                        <span>Budget: {budget}</span>
                        {c.code && <span className="font-mono text-slate-400 dark:text-zinc-500">{c.code}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <Link
                      to={`/superadmin/campaigns?review=${c.id}`}
                      className="w-full sm:w-auto text-center px-3.5 py-1.5 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 active:scale-98 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Technician Team */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Technician Team
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Field specialists available for maintenance</p>
            </div>
            <Link to="/superadmin/technicians" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0">
              Tech Pool ({techList.length}) →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {techList.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium py-6 text-center">{t('common.no_data', 'No technicians currently registered.')}</p>
            )}
            {techList.slice(0, 4).map((tech) => {
              const status = tech.status || 'Active';
              const isAvailable = String(status).toLowerCase().includes('avail') || String(status).toLowerCase() === 'active';
              const city = tech.baseCity || tech.city || tech.organization?.city || '';
              const certLevel = tech.certLevel || tech.role?.name || 'Technician';
              return (
                <div key={tech.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center border border-purple-200/60 dark:border-purple-800 shrink-0 text-purple-600 dark:text-purple-400">
                      <FleetIcons.Settings className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{tech.name}</span>
                        {city && <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 truncate">{city}</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">{certLevel}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                      isAvailable
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {isAvailable ? 'Available' : 'On Site'}
                  </span>
                </div>
              );
            })}
          </div>

          <Link
            to="/superadmin/technicians/assign"
            className="w-full py-2.5 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 active:scale-98 text-white text-xs font-bold rounded-xl transition-all text-center block shadow-xs"
          >
            Assign Technician →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
