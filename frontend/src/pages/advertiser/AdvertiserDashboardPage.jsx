import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { RefreshButton } from '../../components/ui/RefreshButton';

const statusColors = {
  Running: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  live: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Approved: 'bg-teal-50 text-teal-700 border border-teal-200',
  approved: 'bg-teal-50 text-teal-700 border border-teal-200',
  Verified: 'bg-blue-50 text-blue-700 border border-blue-200',
  verified: 'bg-blue-50 text-blue-700 border border-blue-200',
  Scheduled: 'bg-blue-50 text-blue-700 border border-blue-200',
  scheduled: 'bg-blue-50 text-blue-700 border border-blue-200',
  'Under Review': 'bg-amber-50 text-amber-700 border border-amber-200',
  pending_approval: 'bg-amber-50 text-amber-700 border border-amber-200',
  Paused: 'bg-orange-50 text-orange-700 border border-orange-200',
  paused: 'bg-orange-50 text-orange-700 border border-orange-200',
  Completed: 'bg-slate-100 text-slate-600 border border-slate-200',
  completed: 'bg-slate-100 text-slate-600 border border-slate-200',
  Draft: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
  draft: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
  rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
};

export const AdvertiserDashboardPage = () => {
  const { user, hasPermission } = useAuth();
  const { campaigns, mqttStatus, campaignAnalytics, loadCampaigns, loadMqttStatus, loadCampaignAnalytics } = useAdvertiserRole();
  const canView = hasPermission('advertiser.dashboard.view');

  useEffect(() => {
    if (canView) {
      loadCampaigns().catch(() => {});
      loadMqttStatus().catch(() => {});
      loadCampaignAnalytics('all').catch(() => {});
    }
  }, [canView, loadCampaigns, loadMqttStatus, loadCampaignAnalytics]);

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        loadCampaigns(),
        loadMqttStatus(),
        loadCampaignAnalytics('all'),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const campaignsList = Array.isArray(campaigns) ? campaigns : (campaigns?.items || campaigns?.rows || []);
  const recentCampaigns = campaignsList.slice(0, 5);

  // Prefer the real aggregate analytics overview; fall back to deriving from the list.
  const stats = useMemo(() => {
    const a = campaignAnalytics && campaignAnalytics.isOverview ? campaignAnalytics : null;
    const active = a ? Number(a.activeCampaigns || 0)
      : campaignsList.filter((c) => c.status === 'Running' || c.status === 'live' || c.status === 'active').length;
    const scheduled = campaignsList.filter((c) => ['Scheduled', 'scheduled', 'pending_approval', 'draft', 'approved', 'Approved'].includes(c.status)).length;
    const totalCampaigns = a ? Number(a.totalCampaigns || campaignsList.length) : campaignsList.length;
    const totalBudget = a ? Number(a.budget || 0) : campaignsList.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
    const totalSpent = a ? Number(a.spent || 0) : campaignsList.reduce((sum, c) => sum + (Number(c.spent) || 0), 0);
    const impressions = a ? Number(a.impressionsDelivered ?? a.impressions ?? 0)
      : campaignsList.reduce((sum, c) => sum + (Number(c.impressions_delivered) || 0), 0);
    const playbacks = a ? Number(a.totalPlaybacks || 0) : 0;
    const scans = a ? Number(a.totalScans || 0) : 0;
    return { active, scheduled, totalCampaigns, totalBudget, totalSpent, impressions, playbacks, scans };
  }, [campaignAnalytics, campaignsList]);

  // Real 7-day performance series from verified proof-of-play telemetry.
  const perfSeries = useMemo(() => {
    const daily = campaignAnalytics?.daily;
    if (!Array.isArray(daily) || daily.length === 0) return [];
    return [...daily]
      .map((d) => ({
        rawDate: d.date,
        date: d.date ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
        impressions: Number(d.impressions || 0),
        playbacks: Number(d.screens_played ?? d.playbacks ?? 0),
      }))
      .sort((x, y) => new Date(x.rawDate) - new Date(y.rawDate))
      .slice(-7);
  }, [campaignAnalytics]);

  const fmtMoney = (n) => {
    const v = Number(n) || 0;
    if (v >= 100000) return `₹ ${(v / 100000).toFixed(2)}L`;
    return `₹ ${v.toLocaleString('en-IN')}`;
  };

  if (!canView) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-3">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-black text-slate-900">Access Revoked</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Your administrator has revoked your permission (<strong>advertiser.dashboard.view</strong>) to view the advertiser dashboard overview.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Welcome back, <span className="text-slate-900">{user?.name || 'Advertiser'}!</span>
            </h1>
            {mqttStatus && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-xs">
                <span className={`w-2 h-2 rounded-full ${(mqttStatus.mqttConnected ?? mqttStatus.brokerConnected) ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                <span>Fleet Telemetry: <strong className="text-emerald-300">{mqttStatus.onlineEdgeDevices ?? mqttStatus.onlineDevices ?? 0}</strong> Online</span>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">Here's an overview of your transit advertising campaigns.</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title="Refresh campaigns overview"
          />
          <Link
            to="/advertiser/campaigns/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Campaign</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards (real aggregate analytics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Campaigns',
            value: stats.active,
            sub: `${stats.totalCampaigns} total campaigns`,
            badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400',
            icon: (
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
          },
          {
            label: 'Impressions Delivered',
            value: stats.impressions.toLocaleString('en-IN'),
            sub: `${stats.playbacks.toLocaleString('en-IN')} screen playbacks`,
            badgeBg: 'bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400',
            icon: (
              <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ),
          },
          {
            label: 'QR Scan Leads',
            value: stats.scans.toLocaleString('en-IN'),
            sub: 'Passenger engagements',
            badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
            icon: (
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            ),
          },
          {
            label: 'Budget Spent',
            value: fmtMoney(stats.totalSpent),
            sub: `of ${fmtMoney(stats.totalBudget)} total`,
            badgeBg: 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
            icon: (
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.badgeBg}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Chart + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Campaign Performance Chart */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Campaign Performance</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 Days</p>
            </div>
            <Link to="/advertiser/campaigns" className="text-xs text-slate-600 hover:text-slate-900 font-semibold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              View All →
            </Link>
          </div>
          {perfSeries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700">No performance data yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">Verified impression telemetry will appear here once your campaigns go live on transit screens.</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2 h-40 pt-2">
                {perfSeries.map((d, idx) => {
                  const maxVal = Math.max(...perfSeries.map((p) => p.impressions || 0), 1);
                  const heightPct = Math.max(6, Math.round(((d.impressions || 0) / maxVal) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-600">{d.impressions}</span>
                      <div className="w-full bg-slate-100 rounded-lg overflow-hidden flex flex-col justify-end" style={{ height: '110px' }}>
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-md transition-all"
                          style={{ height: `${heightPct}%` }}
                          title={`${d.date}: ${d.impressions} impressions, ${d.playbacks} playbacks`}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">{d.date}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-[11px] text-slate-400 font-medium mt-3">Daily verified impressions across active transit screens</p>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Create New Campaign', path: '/advertiser/campaigns/create', badgeBg: 'bg-indigo-50 text-indigo-600', icon: <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" /></svg> },
              { label: 'View All Campaigns', path: '/advertiser/campaigns', badgeBg: 'bg-sky-50 text-sky-600', icon: <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
              { label: 'Reports & Analytics', path: '/advertiser/reports', badgeBg: 'bg-teal-50 text-teal-600', icon: <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
              { label: 'Billing & Payments', path: '/advertiser/billing', badgeBg: 'bg-emerald-50 text-emerald-600', icon: <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
              { label: 'Help & Support', path: '/advertiser/help', badgeBg: 'bg-violet-50 text-violet-600', icon: <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all group"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.badgeBg}`}>
                  {action.icon}
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{action.label}</span>
                <svg className="w-4 h-4 text-slate-400 ml-auto group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Recent Campaigns</h2>
          <Link to="/advertiser/campaigns" className="text-xs text-slate-600 hover:text-slate-900 font-semibold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            View All →
          </Link>
        </div>
        {recentCampaigns.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/advertiser/campaigns/${campaign.id}`}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-slate-700">{campaign.title || campaign.name || '—'}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                      {campaign.code ?? '—'} · {campaign.start_date ?? '—'} – {campaign.end_date ?? '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-slate-500">Budget</p>
                    <p className="text-sm font-bold text-slate-900">{fmtMoney(campaign.budget)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[campaign.status] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {campaign.status ?? '—'}
                  </span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-bold text-slate-700">No campaigns yet</p>
            <p className="text-xs text-slate-500 mt-1">Create your first campaign to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
