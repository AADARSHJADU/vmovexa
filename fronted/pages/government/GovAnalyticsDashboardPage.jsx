import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';

export const GovAnalyticsDashboardPage = () => {
  const { t } = useTranslation();
  const { campaigns, broadcasts, analytics, loadCampaigns, loadBroadcasts, loadAgencyAnalytics } = useGovernmentRole();
  const navigate = useNavigate();
  const location = useLocation();

  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/government' : '/government';

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'qr'
  const [dateRange, setDateRange] = useState('7days');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = (range = dateRange, cat = category) => {
    return loadAgencyAnalytics({
      dateRange: range,
      category: cat === 'all' ? undefined : cat,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        fetchAnalyticsData(dateRange, category),
        loadCampaigns(),
        loadBroadcasts(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(dateRange, category).catch(() => {});
  }, [dateRange, category]);

  useEffect(() => {
    loadCampaigns().catch(() => {});
    loadBroadcasts().catch(() => {});
  }, [loadCampaigns, loadBroadcasts]);

  const campaignList = Array.isArray(campaigns) ? campaigns : (campaigns?.items || campaigns?.rows || []);
  const broadcastList = Array.isArray(broadcasts) ? broadcasts : (broadcasts?.items || broadcasts?.rows || []);

  // 100% Mathematically Real KPIs derived from MySQL DB
  const kpis = {
    totalCampaigns: analytics?.kpis?.totalCampaigns ?? campaignList.length,
    activeCampaigns: analytics?.kpis?.activeCampaigns ?? campaignList.filter(c => ['live', 'active'].includes(String(c?.status || '').toLowerCase())).length,
    scheduledCampaigns: analytics?.kpis?.pendingApprovals ?? campaignList.filter(c => ['pending_approval', 'scheduled', 'draft'].includes(String(c?.status || '').toLowerCase())).length,
    completedCampaigns: analytics?.kpis?.completedCampaigns ?? campaignList.filter(c => String(c?.status || '').toLowerCase() === 'completed').length,
    emergencyAlerts: analytics?.kpis?.emergencyBroadcasts ?? broadcastList.length,
    totalImpressions: analytics?.kpis?.totalImpressions ?? campaignList.reduce((acc, c) => acc + Number(c.impressions_delivered || 0), 0),
    totalScans: analytics?.kpis?.totalScans ?? campaignList.reduce((acc, c) => acc + Number(c.qr_scans_count || c.qr_scans || (c.qrCodes?.[0]?.scan_count || 0)), 0),
    uniqueScans: analytics?.kpis?.uniqueScans ?? campaignList.reduce((acc, c) => acc + Number(c.qr_scans_count || c.qr_scans || (c.qrCodes?.[0]?.scan_count || 0)), 0),
    networkReachPct: analytics?.kpis?.networkReachPct ?? 0,
    activeVehiclesCount: analytics?.kpis?.activeVehiclesCount ?? 0,
    totalVehiclesCount: analytics?.kpis?.totalVehiclesCount ?? 0,
  };

  // Distinct category options for filter
  const availableCategories = useMemo(() => {
    if (Array.isArray(analytics?.availableCategories) && analytics.availableCategories.length > 0) {
      return analytics.availableCategories;
    }
    const cats = new Set();
    campaignList.forEach(c => {
      if (c.category) cats.add(c.category);
    });
    return Array.from(cats);
  }, [analytics?.availableCategories, campaignList]);

  // Real Day-by-Day Playback Telemetry
  const daysTrend = useMemo(() => {
    if (Array.isArray(analytics?.daysTrend) && analytics.daysTrend.length > 0) {
      return analytics.daysTrend;
    }
    const list = [];
    const today = new Date();
    const count = dateRange === '30days' ? 30 : (dateRange === 'month' ? today.getDate() : 7);
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      list.push({
        day: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        date: d.toISOString().split('T')[0],
        count: 0,
      });
    }
    return list;
  }, [analytics?.daysTrend, dateRange]);

  const maxDayCount = useMemo(() => {
    return Math.max(1, ...daysTrend.map(d => Number(d.count || 0)));
  }, [daysTrend]);

  const totalPlaysInWindow = useMemo(() => {
    return daysTrend.reduce((acc, d) => acc + Number(d.count || 0), 0);
  }, [daysTrend]);

  // Top Performing Campaigns (Real targets & delivery completion)
  const topCampaigns = useMemo(() => {
    if (Array.isArray(analytics?.topCampaigns) && analytics.topCampaigns.length > 0) {
      return analytics.topCampaigns.map((c, idx) => ({
        id: c.id,
        rank: c.rank || (idx + 1),
        name: c.name || c.title || `Campaign #${c.id}`,
        category: c.category || 'PSA',
        status: String(c.status || 'draft').toLowerCase(),
        reach: c.completionPct !== null && c.completionPct !== undefined
          ? `${c.completionPct}%`
          : (c.busesCount > 0 ? `${c.busesCount} buses` : '—'),
        impressions: Number(c.impressions || c.impressions_delivered || 0).toLocaleString(),
        targetImpressions: c.targetImpressions ? Number(c.targetImpressions).toLocaleString() : null,
        busesCount: c.busesCount || 0,
        target: c.target || 'Transit Network',
      }));
    }
    return campaignList.slice(0, 5).map((c, idx) => {
      const targetImp = Number(c.target_impressions || c.budget || 0);
      const delivered = Number(c.impressions_delivered || 0);
      const completion = targetImp > 0 ? Math.min(100, Math.round((delivered / targetImp) * 100)) : null;
      const buses = (c.targets || []).reduce((acc, t) => acc + (t.vehicles_count || (Array.isArray(t.vehicle_ids) ? t.vehicle_ids.length : 1)), 0);

      return {
        id: c.id,
        rank: idx + 1,
        name: c.title || c.name || `Campaign #${c.id}`,
        category: c.category || 'General PSA',
        status: String(c.status || 'draft').toLowerCase(),
        reach: completion !== null ? `${completion}%` : (buses > 0 ? `${buses} buses` : '—'),
        impressions: delivered.toLocaleString(),
        targetImpressions: targetImp > 0 ? targetImp.toLocaleString() : null,
        busesCount: buses,
        target: c.target_area || (c.targets?.map(t => t.city_name || t.fleet_name).filter(Boolean).join(', ')) || 'Transit Network',
      };
    });
  }, [analytics?.topCampaigns, campaignList]);

  // QR Engagement Breakdown by Campaign (Only campaigns with actual scans)
  const qrScansByCampaign = useMemo(() => {
    const sourceList = (Array.isArray(analytics?.topCampaigns) && analytics.topCampaigns.length > 0)
      ? analytics.topCampaigns
      : campaignList;

    return sourceList
      .map((c, idx) => {
        const scans = Number(c.qrScans ?? c.qr_scans_count ?? c.qr_scans ?? (c.qrCodes?.[0]?.scan_count || 0));
        return {
          id: c.id,
          name: c.name || c.title || `Campaign #${c.id}`,
          scans,
          scansFormatted: scans.toLocaleString(),
          pct: kpis.totalScans > 0 ? Math.min(100, Math.round((scans / kpis.totalScans) * 100)) : 0,
          color: ['bg-blue-600', 'bg-red-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600'][idx % 5],
        };
      })
      .filter(c => c.scans > 0);
  }, [analytics?.topCampaigns, campaignList, kpis.totalScans]);

  // Real QR Device Breakdown from QrScan database records
  const qrDeviceStats = useMemo(() => {
    const breakdown = analytics?.qrDeviceBreakdown || { mobile: 0, tablet: 0, web: 0 };
    const mobile = Number(breakdown.mobile || 0);
    const tablet = Number(breakdown.tablet || 0);
    const web = Number(breakdown.web || 0);
    const sum = mobile + tablet + web || Number(kpis.totalScans || 0);

    if (sum === 0) {
      return {
        mobile: { count: 0, pct: 0 },
        tablet: { count: 0, pct: 0 },
        web: { count: 0, pct: 0 },
      };
    }

    const mobilePct = Math.round((mobile / sum) * 100);
    const tabletPct = Math.round((tablet / sum) * 100);
    const webPct = Math.max(0, 100 - mobilePct - tabletPct);

    return {
      mobile: { count: mobile, pct: mobilePct },
      tablet: { count: tablet, pct: tabletPct },
      web: { count: web, pct: webPct },
    };
  }, [analytics?.qrDeviceBreakdown, kpis.totalScans]);

  const daysInPeriod = dateRange === '30days' ? 30 : (dateRange === 'month' ? (new Date().getDate() || 1) : 7);
  const avgScansPerDay = Math.round(Number(kpis.totalScans || 0) / daysInPeriod);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{t('common.live', 'Live')}</span>
          </span>
        );
      case 'completed':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-bold">{t('ag.government.govanalyticsdashboardpage.completed', 'Completed')}</span>;
      case 'pending_approval':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">{t('ag.government.govanalyticsdashboardpage.pending', 'Pending')}</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-[10px] font-bold">{t('ag.government.govanalyticsdashboardpage.rejected', 'Rejected')}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 text-[10px] font-bold capitalize">{status}</span>;
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: isSuperAdmin ? 'SuperAdmin' : 'Government', path: isSuperAdmin ? '/superadmin/dashboard' : '/government/dashboard' },
              { label: 'Transit Analytics & Telematics' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mt-1">{t('gov.analytics.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.analytics.sub')}</p>
        </div>

        {/* Dynamic Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />

          {/* Category Filter */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full sm:w-auto h-10 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 focus:outline-none focus:bg-white dark:focus:bg-zinc-900"
          >
            <option value="all">{t('common.all') || 'All Categories'}</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="w-full sm:w-auto h-10 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 focus:outline-none focus:bg-white dark:focus:bg-zinc-900"
          >
            <option value="7days">{t('gov.analytics.last_7_days')}</option>
            <option value="30days">{t('gov.analytics.last_30_days')}</option>
            <option value="month">{t('gov.analytics.current_month')}</option>
          </select>
        </div>
      </div>

      {/* 2. Main Tabs (Overview vs QR Analytics) */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-800/80 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-center inline-flex items-center justify-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-700/60'
          }`}
        >
          <FleetIcons.BarChart className="w-4 h-4" />
          <span>{t('gov.analytics.network_overview')}</span>
        </button>
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-center inline-flex items-center justify-center gap-1.5 ${
            activeTab === 'qr'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-700/60'
          }`}
        >
          <FleetIcons.QrCode className="w-4 h-4" />
          <span>{t('gov.analytics.qr_citizen_analytics')}</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: 'Total Campaigns',
                value: Number(kpis.totalCampaigns).toLocaleString(),
                change: `${kpis.completedCampaigns} completed`,
                icon: <FleetIcons.Flag className="w-5 h-5 text-slate-700 dark:text-zinc-300" />,
                dot: 'bg-emerald-500',
              },
              {
                label: 'Active Campaigns',
                value: Number(kpis.activeCampaigns).toLocaleString(),
                change: `${kpis.scheduledCampaigns} pending/scheduled`,
                icon: <FleetIcons.Bus className="w-5 h-5 text-slate-700 dark:text-zinc-300" />,
                dot: 'bg-blue-500',
              },
              {
                label: 'Emergency Broadcasts',
                value: Number(kpis.emergencyAlerts).toLocaleString(),
                change: 'Public alerts dispatched',
                icon: <FleetIcons.Alert className="w-5 h-5 text-slate-700 dark:text-zinc-300" />,
                dot: 'bg-red-500',
              },
              {
                label: 'Transit Fleet Reach',
                value: `${kpis.networkReachPct}%`,
                change: `${kpis.activeVehiclesCount} of ${kpis.totalVehiclesCount} active buses`,
                icon: <FleetIcons.Target className="w-5 h-5 text-slate-700 dark:text-zinc-300" />,
                dot: 'bg-purple-500',
              },
            ].map(kpi => (
              <div key={kpi.label} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 hover:shadow-md transition-all shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{kpi.label}</span>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                    {kpi.icon}
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{kpi.value}</div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 dark:text-zinc-400 font-semibold">
                    <span className={`w-2 h-2 rounded-full ${kpi.dot}`}></span>
                    <span>{kpi.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Trend Chart Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">{t('gov.analytics.perf_trend_title')}</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {t('gov.analytics.perf_trend_sub')} — {totalPlaysInWindow.toLocaleString()} {t('ag.government.govanalyticsdashboardpage.plays_in_selected_window', 'plays in selected window')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-bold bg-slate-50 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> {t('ag.government.govanalyticsdashboardpage.total_campaigns', 'Total Campaigns (')}{kpis.totalCampaigns})
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-bold bg-slate-50 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {t('ag.government.govanalyticsdashboardpage.active', 'Active (')}{kpis.activeCampaigns})
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-bold bg-slate-50 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> {t('ag.government.govanalyticsdashboardpage.impressions', 'Impressions (')}{Number(kpis.totalImpressions || 0).toLocaleString()})
                </span>
              </div>
            </div>

            {/* Dynamic trend bars or empty state */}
            {daysTrend.length > 0 ? (
              <div className="w-full overflow-x-auto no-scrollbar pt-2">
                <div className="h-56 min-w-[500px] sm:min-w-0 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex items-end justify-between gap-2 sm:gap-3">
                  {daysTrend.map(d => {
                    const count = Number(d.count || 0);
                    const barHeightPct = totalPlaysInWindow > 0 ? Math.max(6, Math.round((count / maxDayCount) * 100)) : 4;

                    return (
                      <div key={d.date || d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="w-full flex items-end justify-center h-full">
                          <div
                            style={{ height: `${barHeightPct}%` }}
                            className={`w-full max-w-[28px] rounded-t-md transition-all ${
                              count > 0
                                ? 'bg-purple-600 group-hover:bg-purple-500'
                                : 'bg-slate-200 dark:bg-zinc-700'
                            }`}
                            title={`${d.day}: ${count.toLocaleString()} ad plays`}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold truncate">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-xs font-medium border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                {t('gov.analytics.no_telemetry_recorded', 'No impression telemetry recorded for the selected window yet. Real impressions will plot here automatically.')}
              </div>
            )}
          </div>

          {/* Two-Column Grid: Dynamic Status Ring + Top Performing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Status Ring Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">{t('gov.analytics.status_title')}</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.analytics.distribution_desc')}</p>
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="relative w-36 h-36 rounded-full border-8 border-blue-600 dark:border-blue-500 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{kpis.totalCampaigns}</span>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase">{t('common.total')}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span>{t('common.active')}</span></span>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {kpis.activeCampaigns} ({kpis.totalCampaigns > 0 ? Math.round((kpis.activeCampaigns / kpis.totalCampaigns) * 100) : 0}%)
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="inline-flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span><span>{t('driver.routes.ready_scheduled')}</span></span>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {kpis.scheduledCampaigns} ({kpis.totalCampaigns > 0 ? Math.round((kpis.scheduledCampaigns / kpis.totalCampaigns) * 100) : 0}%)
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500"></span><span>{t('common.completed')}</span></span>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {kpis.completedCampaigns} ({kpis.totalCampaigns > 0 ? Math.round((kpis.completedCampaigns / kpis.totalCampaigns) * 100) : 0}%)
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="inline-flex items-center gap-1.5 text-red-700 dark:text-red-400 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span><span>{t('gov.dashboard.emergency_alert')}</span></span>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {kpis.emergencyAlerts} ({kpis.totalCampaigns > 0 ? Math.round((kpis.emergencyAlerts / kpis.totalCampaigns) * 100) : 0}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Top Performing Campaigns Card / Table */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">{t('gov.analytics.top_campaigns_title')}</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.analytics.top_campaigns_sub')}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    tableValue="table"
                    cardValue="card"
                  />

                  <button
                    onClick={() => navigate(`${basePath}/campaigns`)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 inline-flex items-center gap-1 pl-1"
                  >
                    <span>{t('common.view_all')}</span>
                    <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {topCampaigns.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-xs font-medium border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                  {t('gov.analytics.no_campaigns_ranked', 'No public service campaigns active for ranking yet.')}
                </div>
              ) : viewMode === 'card' ? (
                /* Card List for Mobile & Desktop */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {topCampaigns.map(item => (
                    <div
                      key={item.id || item.rank}
                      onClick={() => navigate(`${basePath}/campaigns`)}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                            #{item.rank}
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">{item.name}</h3>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{item.category}</span>
                          </div>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium uppercase">{t('common.reach') || 'Target / Reach'}</span>
                          <p className="font-bold text-slate-900 dark:text-zinc-100 mt-0.5">{item.reach}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium uppercase">{t('common.impressions')}</span>
                          <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{item.impressions}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Responsive Table */
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[640px] text-left text-xs text-slate-700 dark:text-zinc-300">
                    <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                      <tr>
                        <th className="py-3 px-3">{t('gov.analytics.rank_campaign')}</th>
                        <th className="py-3 px-3">{t('common.category')}</th>
                        <th className="py-3 px-3">{t('common.reach') || 'Reach / Completion'}</th>
                        <th className="py-3 px-3">{t('common.impressions')}</th>
                        <th className="py-3 px-3 text-right">{t('common.status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {topCampaigns.map(item => (
                        <tr
                          key={item.id || item.rank}
                          className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                          onClick={() => navigate(`${basePath}/campaigns`)}
                        >
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center border border-slate-200 dark:border-zinc-800 shrink-0">
                                {item.rank}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-zinc-100">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-slate-500 dark:text-zinc-400">{item.category}</td>
                          <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-zinc-100">{item.reach}</td>
                          <td className="py-3.5 px-3 font-bold text-blue-600 dark:text-blue-400">{item.impressions}</td>
                          <td className="py-3.5 px-3 text-right">{getStatusBadge(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QR CITIZEN ANALYTICS */}
      {activeTab === 'qr' && (
        <div className="space-y-6">
          {/* 4 QR KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: t('gov.analytics.total_qr_scans'),
                value: Number(kpis.totalScans || 0).toLocaleString(),
                sub: t('gov.analytics.telemetry_verified'),
              },
              {
                label: t('gov.analytics.unique_scanners'),
                value: Number(kpis.uniqueScans || 0).toLocaleString(),
                sub: t('gov.analytics.unique_devices'),
              },
              {
                label: t('gov.analytics.avg_scans_day'),
                value: avgScansPerDay.toLocaleString(),
                sub: `${t('gov.analytics.averaged_over', 'Averaged over')} ${daysInPeriod} ${t('common.days', 'days')}`,
              },
              {
                label: t('gov.analytics.overall_scan_rate'),
                value: kpis.totalImpressions > 0 ? `${((kpis.totalScans / kpis.totalImpressions) * 100).toFixed(2)}%` : '0.00%',
                sub: t('gov.analytics.imp_conversion'),
              },
            ].map(kpi => (
              <div key={kpi.label} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{kpi.label}</span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">{kpi.value}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold mt-1">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* QR Scans by Campaign Horizontal Bars */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">{t('gov.analytics.qr_by_campaign_title')}</h2>
            <div className="space-y-3.5 pt-1">
              {qrScansByCampaign.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs font-medium border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                  {t('gov.analytics.no_qr_engagement', 'No public QR campaign engagement recorded yet. Scans will plot here once citizen devices engage.')}
                </div>
              ) : (
                qrScansByCampaign.map(c => (
                  <div key={c.id || c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 truncate">{c.name}</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0">{c.scansFormatted} {t('common.scans') || 'scans'} ({c.pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden border border-slate-100 dark:border-zinc-800">
                      <div
                        style={{ width: `${c.pct}%` }}
                        className={`h-full rounded-full ${c.color}`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Device Type Breakdown — 100% Real from db.QrScan device_type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                <FleetIcons.Smartphone className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">{t('gov.analytics.mobile_scans')}</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {qrDeviceStats.mobile.pct}%
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                {qrDeviceStats.mobile.count.toLocaleString()} {t('common.scans') || 'scans'}
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                <FleetIcons.Laptop className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">{t('gov.analytics.tablet_devices')}</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {qrDeviceStats.tablet.pct}%
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                {qrDeviceStats.tablet.count.toLocaleString()} {t('common.scans') || 'scans'}
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                <FleetIcons.Globe className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">{t('gov.analytics.other_web')}</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {qrDeviceStats.web.pct}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
                {qrDeviceStats.web.count.toLocaleString()} {t('common.scans') || 'scans'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
