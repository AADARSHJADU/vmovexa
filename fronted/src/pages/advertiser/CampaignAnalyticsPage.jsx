import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';

export const CampaignAnalyticsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    campaigns: rawCampaigns,
    loadCampaigns,
    campaignAnalytics,
    loadCampaignAnalytics,
    reviews,
    loadCampaignReviews,
  } = useAdvertiserRole();

  const [selectedFilter, setSelectedFilter] = useState(id || 'all');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'routes' | 'telemetry' | 'qr'
  const [isExporting, setIsExporting] = useState(false);
  const [period, setPeriod] = useState('all'); // '7d' | '30d' | 'all'
  const [refreshing, setRefreshing] = useState(false);

  // Telemetry table pagination
  const [telemetryPage, setTelemetryPage] = useState(1);
  const [telemetryPageSize, setTelemetryPageSize] = useState(10);

  // Routes table pagination
  const [routesPage, setRoutesPage] = useState(1);
  const [routesPageSize, setRoutesPageSize] = useState(10);

  // Normalize campaigns array
  const campaigns = useMemo(() => {
    return Array.isArray(rawCampaigns)
      ? rawCampaigns
      : (rawCampaigns?.items || rawCampaigns?.rows || []);
  }, [rawCampaigns]);

  // Load campaigns on initial mount
  useEffect(() => {
    loadCampaigns().catch(() => {});
  }, [loadCampaigns]);

  // Sync selectedFilter with route param :id
  useEffect(() => {
    if (id) {
      setSelectedFilter(id);
      loadCampaignAnalytics(id).catch(() => {});
      loadCampaignReviews(id).catch(() => {});
    } else {
      setSelectedFilter('all');
      loadCampaignAnalytics('all').catch(() => {});
    }
  }, [id, loadCampaignAnalytics, loadCampaignReviews]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const targetId = selectedFilter && selectedFilter !== 'all' ? selectedFilter : 'all';
      await Promise.allSettled([
        loadCampaigns(),
        loadCampaignAnalytics(targetId),
        targetId !== 'all' ? loadCampaignReviews(targetId) : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Resolve current active campaign object (if single campaign selected)
  const currentCampaign = useMemo(() => {
    if (!selectedFilter || selectedFilter === 'all') return null;
    return campaigns.find(
      (c) => String(c.id) === String(selectedFilter) || String(c.code) === String(selectedFilter)
    ) || null;
  }, [campaigns, selectedFilter]);

  // Determine base path for routing
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/superadmin/advertiser')
    ? '/superadmin/advertiser'
    : '/advertiser';

  // Handle Campaign Dropdown Selection
  const handleCampaignChange = (newVal) => {
    setSelectedFilter(newVal);
    setTelemetryPage(1);
    setRoutesPage(1);
    if (!newVal || newVal === 'all') {
      navigate(`${basePath}/analytics`);
      loadCampaignAnalytics('all').catch(() => {});
    } else {
      navigate(`${basePath}/campaigns/${newVal}/analytics`);
      loadCampaignAnalytics(newVal).catch(() => {});
      loadCampaignReviews(newVal).catch(() => {});
    }
  };

  // Derive selected value matching option values
  const selectedValue = useMemo(() => {
    if (!selectedFilter || selectedFilter === 'all') return 'all';
    const matched = campaigns.find(
      (c) => String(c.id) === String(selectedFilter) || String(c.code) === String(selectedFilter)
    );
    return matched ? String(matched.id) : 'all';
  }, [campaigns, selectedFilter]);

  // KPIs and aggregated values
  const isOverview = !currentCampaign || campaignAnalytics?.isOverview;
  const title = isOverview ? 'All Campaigns Overview' : (currentCampaign?.title || campaignAnalytics?.title || 'Campaign Analytics');
  const code = isOverview ? 'ALL-CAMPAIGNS' : (currentCampaign?.code || campaignAnalytics?.code || id);
  const status = isOverview ? (campaigns.some(c => c.status === 'live') ? 'Active' : 'Idle') : (currentCampaign?.status || campaignAnalytics?.status || 'live');

  const getCampTotal = (c) => {
    if (!c) return 0;
    const pb = typeof c.payment_breakdown === 'string'
      ? (() => { try { return JSON.parse(c.payment_breakdown); } catch (_) { return null; } })()
      : c.payment_breakdown;
    return Number(pb?.totalAmount ?? c.budget ?? 0);
  };

  const budget = Number(campaignAnalytics?.totalAmount ?? campaignAnalytics?.budget ?? (currentCampaign ? getCampTotal(currentCampaign) : campaigns.reduce((s, c) => s + getCampTotal(c), 0))) || 0;
  const spent = Number(campaignAnalytics?.spent ?? (currentCampaign ? currentCampaign.spent : campaigns.reduce((s, c) => s + Number(c.spent || 0), 0))) || 0;
  const impressions = Number(campaignAnalytics?.impressionsDelivered ?? campaignAnalytics?.impressions ?? (currentCampaign ? currentCampaign.impressions_delivered : campaigns.reduce((s, c) => s + Number(c.impressions_delivered || 0), 0))) || 0;
  const playbacks = Number(campaignAnalytics?.totalPlaybacks ?? (currentCampaign ? currentCampaign.totalPlaybacks : 0)) || 0;
  const scans = Number(campaignAnalytics?.totalScans ?? (currentCampaign ? currentCampaign.totalScans : 0)) || 0;

  const budgetUtilization = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const cpm = impressions > 0 ? Math.round((spent / impressions) * 1000) : (playbacks > 0 ? Math.round((spent / playbacks) * 1000) : 0);
  const ctr = impressions > 0 ? ((scans / impressions) * 100).toFixed(2) : '0.00';

  // Target routes and screens breakdown
  const targetRoutes = useMemo(() => {
    if (campaignAnalytics?.routes && Array.isArray(campaignAnalytics.routes)) {
      return campaignAnalytics.routes;
    }
    if (campaignAnalytics?.targets && Array.isArray(campaignAnalytics.targets)) {
      return campaignAnalytics.targets.map(t => ({
        name: t.routeName || t.fleetName || 'Transit Route',
        code: t.routeCode || `RT-${t.id}`,
        city: t.city || 'Metro City',
        screens: t.screensCount || 1,
        vehicles: t.vehiclesCount || 1,
        startPoint: t.startPoint,
        endPoint: t.endPoint,
      }));
    }
    if (currentCampaign?.targets && Array.isArray(currentCampaign.targets)) {
      return currentCampaign.targets.map(t => ({
        name: t.route?.name || t.fleet_name || 'City Transit Corridor',
        code: t.route?.code || `RT-${t.id}`,
        city: t.city || 'Metro City',
        screens: t.screens_count || 1,
        vehicles: t.vehicles_count || 1,
        startPoint: t.route?.start_point,
        endPoint: t.route?.end_point,
      }));
    }
    return [];
  }, [campaignAnalytics, currentCampaign]);

  const totalRoutePages = Math.max(1, Math.ceil(targetRoutes.length / routesPageSize));
  const paginatedRoutes = useMemo(() => {
    const from = (routesPage - 1) * routesPageSize;
    return targetRoutes.slice(from, from + routesPageSize);
  }, [targetRoutes, routesPage, routesPageSize]);

  // Daily telemetry
  const dailyTelemetry = useMemo(() => {
    const raw = (campaignAnalytics?.daily && campaignAnalytics.daily.length > 0)
      ? campaignAnalytics.daily.map((d) => ({
          date: d.date ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (d.date || '—'),
          rawDate: d.date,
          impressions: Number(d.impressions || 0),
          playbacks: Number(d.screens_played ?? d.playbacks ?? 0),
        }))
      : [];
    if (raw.length === 0) return [];
    const sorted = [...raw].sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
    if (period === '7d') return sorted.slice(-7);
    if (period === '30d') return sorted.slice(-30);
    return sorted;
  }, [campaignAnalytics, period]);

  const totalTelemetryPages = Math.max(1, Math.ceil(dailyTelemetry.length / telemetryPageSize));
  const paginatedTelemetry = useMemo(() => {
    const from = (telemetryPage - 1) * telemetryPageSize;
    return dailyTelemetry.slice(from, from + telemetryPageSize);
  }, [dailyTelemetry, telemetryPage, telemetryPageSize]);

  // Export Analytics to CSV
  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const rows = [
        ['Campaign Analytics Performance Report', ''],
        ['Generated Date', new Date().toISOString()],
        ['Campaign Title', title],
        ['Campaign Code', code],
        ['Status', status],
        ['Total Budget (INR)', budget],
        ['Amount Spent (INR)', spent],
        ['Impressions Delivered', impressions],
        ['Screen Playbacks', playbacks],
        ['Smart QR Scans', scans],
        ['Effective CPM (INR)', cpm],
        ['', ''],
        ['Date', 'Impressions', 'Playbacks'],
        ...dailyTelemetry.map(d => [d.date, d.impressions, d.playbacks]),
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Analytics_${code}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Analytics CSV report downloaded!');
    } catch {
      toast.error('Failed to export CSV report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: `${basePath}/dashboard` },
              { label: 'Campaigns', to: `${basePath}/campaigns` },
              { label: 'Analytics & Heatmaps' }
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{t('advertiser.analytics.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Real-time telemetry, DOOH transit screen impression auditing, GPS proof-of-play verified logs, and QR scan attribution.
          </p>
        </div>

        {/* Quick Action Buttons in Top Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold transition-all shadow-xs border border-transparent dark:border-zinc-700 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <FleetIcons.Document className="w-4 h-4 shrink-0" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <Link
            to={`${basePath}/reports`}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <FleetIcons.Reports className="w-4 h-4 shrink-0" />
            <span>{t('advertiser.analytics.audit_reports')}</span>
          </Link>
        </div>
      </div>

      {/* Campaign Selector Card with Search & Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
              <FleetIcons.Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{t('advertiser.analytics.active_filter')}</h2>
              <p className="text-sm font-black text-slate-900 dark:text-zinc-100">{t('advertiser.analytics.select_campaign')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              {campaigns.length} Campaigns Available
            </span>
          </div>
        </div>

        {/* Dropdown Selector Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <div className="relative flex-1">
            <select
              value={selectedValue}
              onChange={(e) => handleCampaignChange(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/80 focus:bg-white dark:focus:bg-zinc-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs appearance-none cursor-pointer"
            >
              <option value="all">{t('advertiser.analytics.all_overview')}</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.name} — [{c.code || c.id}] — Status: {c.status ? c.status.toUpperCase() : 'LIVE'} — Budget: ₹{Number(c.budget || 0).toLocaleString()}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500 dark:text-zinc-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {currentCampaign && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`${basePath}/campaigns/${currentCampaign.id}`}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>{t('advertiser.analytics.view_details')}</span>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* KPI Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'Impressions Delivered',
            value: impressions.toLocaleString(),
            sub: 'Audited DOOH Displays',
            trend: '',
            trendUp: true,
            icon: <FleetIcons.Eye className="w-4 h-4 text-blue-500" />,
            accent: 'from-blue-500 to-indigo-600',
          },
          {
            label: 'Screen Playbacks',
            value: playbacks.toLocaleString(),
            sub: 'GPS-Verified Slots',
            trend: '',
            trendUp: true,
            icon: <FleetIcons.Tv className="w-4 h-4 text-indigo-500" />,
            accent: 'from-indigo-500 to-purple-600',
          },
          {
            label: 'Smart QR Leads',
            value: scans.toLocaleString(),
            sub: `CTR: ${ctr}% scan rate`,
            trend: '',
            trendUp: true,
            icon: <FleetIcons.Smartphone className="w-4 h-4 text-emerald-500" />,
            accent: 'from-emerald-500 to-teal-600',
          },
          {
            label: 'Total Campaign Amount',
            value: `₹ ${budget.toLocaleString()}`,
            sub: `${budgetUtilization}% Budget Utilized`,
            trend: status.toUpperCase(),
            trendUp: status === 'live' || status === 'approved',
            icon: <FleetIcons.Money className="w-4 h-4 text-amber-500" />,
            accent: 'from-amber-500 to-orange-600',
          },
          {
            label: 'Effective CPM',
            value: `₹ ${cpm}`,
            sub: 'Cost per 1k impressions',
            trend: '',
            trendUp: true,
            icon: <FleetIcons.Zap className="w-4 h-4 text-purple-500" />,
            accent: 'from-purple-500 to-pink-600',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accent}`} />
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-semibold mb-1">
                <span>{card.label}</span>
                <span className="shrink-0">{card.icon}</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mt-1">{card.value}</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-zinc-400 font-medium truncate">{card.sub}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Navigation for Detailed Telemetry Views */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Performance Trend & Charts', icon: <FleetIcons.BarChart className="w-3.5 h-3.5" /> },
          { id: 'routes', label: 'Transit Routes & Display Nodes', icon: <FleetIcons.Bus className="w-3.5 h-3.5" /> },
          { id: 'qr', label: 'Smart QR Attribution', icon: <FleetIcons.QrCode className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Daily Performance Bars & Trend */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 tracking-tight">{t('advertiser.analytics.telemetry_log')}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('advertiser.analytics.telemetry_sub')}</p>
            </div>
            {/* Period filter */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {[{ k: '7d', l: '7 Days' }, { k: '30d', l: '30 Days' }, { k: 'all', l: 'All' }].map((p) => (
                <button
                  key={p.k}
                  type="button"
                  onClick={() => { setPeriod(p.k); setTelemetryPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                    period === p.k
                      ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-slate-900 dark:border-zinc-100'
                      : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {p.l}
                </button>
              ))}
            </div>
          </div>

          {dailyTelemetry.length === 0 ? (
            <div className="py-10 text-center">
              <FleetIcons.BarChart className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-black text-slate-900 dark:text-zinc-100">{t('advertiser.analytics.no_telemetry')}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Proof-of-play rows appear here once the campaign goes live and transit screens report playbacks.
              </p>
            </div>
          ) : (
            <>
              {/* Daily Telemetry Bar Visual */}
              <div className="space-y-3">
                <div className="flex items-end gap-2 pt-4 pb-2 overflow-x-auto no-scrollbar">
                  {dailyTelemetry.map((item, idx) => {
                    const maxVal = Math.max(...dailyTelemetry.map((d) => d.impressions || 0), 1);
                    const heightPct = Math.max(8, Math.round(((item.impressions || 0) / maxVal) * 100));
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 min-w-[40px] flex-1">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400">{item.impressions}</span>
                        <div className="w-full max-w-[42px] h-32 bg-slate-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex flex-col justify-end p-1">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-lg transition-all duration-500 hover:opacity-90"
                            title={`${item.date}: ${item.impressions} impressions, ${item.playbacks} playbacks`}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">{item.date}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-[11px] text-slate-400 dark:text-zinc-500 font-medium">{t('advertiser.analytics.impressions_delivered_desc')}</p>
              </div>

              {/* Table representation */}
              <div className="overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-zinc-800 pt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">{t('advertiser.analytics.th_date')}</th>
                      <th className="py-2.5 px-3">{t('advertiser.analytics.th_impressions')}</th>
                      <th className="py-2.5 px-3">{t('advertiser.analytics.th_playbacks')}</th>
                      <th className="py-2.5 px-3 text-right">{t('advertiser.analytics.delivery_status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-700 dark:text-zinc-300">
                    {paginatedTelemetry.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-zinc-100">{row.date}</td>
                        <td className="py-2.5 px-3">{row.impressions?.toLocaleString() || 0}</td>
                        <td className="py-2.5 px-3">{row.playbacks?.toLocaleString() || 0}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Telemetry Pagination */}
              <Pagination
                currentPage={telemetryPage}
                totalPages={totalTelemetryPages}
                totalItems={dailyTelemetry.length}
                pageSize={telemetryPageSize}
                pageSizeOptions={[5, 10, 20, 50]}
                onPageChange={setTelemetryPage}
                onPageSizeChange={(newSize) => {
                  setTelemetryPageSize(newSize);
                  setTelemetryPage(1);
                }}
              />
            </>
          )}
        </div>
      )}

      {/* Tab 2: Transit Routes & Display Nodes */}
      {activeTab === 'routes' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 tracking-tight">{t('advertiser.analytics.targeted_corridors')}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('advertiser.analytics.targeted_corridors_desc')}</p>
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
              {targetRoutes.length} Corridors
            </span>
          </div>

          {targetRoutes.length === 0 ? (
            <div className="py-10 text-center">
              <FleetIcons.Bus className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-black text-slate-900 dark:text-zinc-100">{t('advertiser.analytics.no_targeted_routes')}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                {isOverview ? 'Select a specific campaign to view its targeted transit corridors.' : 'This campaign has no route targets configured yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {paginatedRoutes.map((route, idx) => (
                  <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 rounded-xl px-2 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-zinc-100">{route.name}</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold border border-blue-100 dark:border-blue-800">
                          {route.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        City: <span className="font-semibold text-slate-700 dark:text-zinc-300">{route.city}</span>
                        {route.startPoint && route.endPoint ? ` · From ${route.startPoint} ➔ ${route.endPoint}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-xs">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{t('advertiser.analytics.screens')}</span>
                        <p className="text-sm font-black text-slate-900 dark:text-zinc-100">{route.screens} Displays</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{t('advertiser.analytics.vehicles')}</span>
                        <p className="text-sm font-black text-slate-900 dark:text-zinc-100">{route.vehicles} Buses</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${status === 'live' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'}`}>
                          {status === 'live' ? 'Broadcasting' : (status ? status.toUpperCase() : 'IDLE')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Routes Pagination */}
              <Pagination
                currentPage={routesPage}
                totalPages={totalRoutePages}
                totalItems={targetRoutes.length}
                pageSize={routesPageSize}
                pageSizeOptions={[5, 10, 20, 50]}
                onPageChange={setRoutesPage}
                onPageSizeChange={(newSize) => {
                  setRoutesPageSize(newSize);
                  setRoutesPage(1);
                }}
              />
            </>
          )}
        </div>
      )}

      {/* Tab 3: Smart QR Telemetry */}
      {activeTab === 'qr' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 tracking-tight">{t('advertiser.analytics.smart_qr_title')}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('advertiser.analytics.smart_qr_desc')}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
              {scans} Total Conversions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* QR Visual Card */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 flex flex-col items-center text-center space-y-3">
              <div className="w-36 h-36 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 dark:bg-zinc-950 rounded-xl flex flex-col items-center justify-center text-white p-2">
                  <div className="font-mono text-[10px] font-bold tracking-widest uppercase">VMOVEXA</div>
                  <FleetIcons.QrCode className="w-8 h-8 my-1 text-white" />
                  <div className="text-[8px] opacity-75 font-mono">{t('advertiser.analytics.scan_to_engage')}</div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 font-mono">
                  {campaignAnalytics?.qrCode || `VMX-QR-${code}`}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('advertiser.analytics.dynamic_attribution_tag')}</p>
              </div>
            </div>

            {/* QR Stats Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-slate-900">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">{t('advertiser.analytics.passenger_scans')}</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">{scans.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-slate-900">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">{t('advertiser.analytics.conversion_rate')}</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">{ctr}%</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('advertiser.analytics.target_redirect_url')}</span>
                <p className="text-xs font-mono font-medium text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 break-all">
                  {currentCampaign?.qr_redirect_url || 'Default VMOVEXA Smart Gateway'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                  Every passenger who scans the QR on transit screens is redirected through VMOVEXA's attribution engine before landing on your destination page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Reviews (from public QR scans) */}
      {!isOverview && reviews && (
        <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 uppercase tracking-wider">{t('advertiser.analytics.customer_reviews')}</h3>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold">
              {reviews.count || 0} reviews
            </span>
          </div>
          {reviews.count > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Driver', val: reviews.averages?.driver },
                  { label: 'Bus', val: reviews.averages?.bus },
                  { label: 'Service', val: reviews.averages?.service },
                ].map((a) => (
                  <div key={a.label} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-center">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">{a.label}</span>
                    <p className="text-2xl font-black text-amber-500 mt-1">★ {a.val ?? 0}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {(reviews.reviews || []).map((r) => (
                  <div key={r.id} className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Driver {r.driverRating}★ · Bus {r.busRating}★ · Service {r.serviceRating}★
                    </div>
                    {r.comment && <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 dark:text-zinc-400">{t('advertiser.analytics.no_reviews')}</p>
          )}
        </div>
      )}

    </div>
  );
};

export default CampaignAnalyticsPage;
