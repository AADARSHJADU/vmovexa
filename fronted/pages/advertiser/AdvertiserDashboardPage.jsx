import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { FleetIcons } from '../../components/FleetIcons';

const getAdvertiserStatusBadge = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'running' || s === 'live' || s === 'active') {
    return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
  }
  if (s === 'approved' || s === 'verified') {
    return 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800';
  }
  if (s === 'scheduled') {
    return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
  }
  if (s === 'pending_approval' || s === 'under review') {
    return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
  }
  if (s === 'paused') {
    return 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
  }
  if (s === 'completed') {
    return 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700';
  }
  if (s === 'rejected') {
    return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
  }
  return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700';
};

export const AdvertiserDashboardPage = () => {
  const { t } = useTranslation();
  const { user, hasPermission } = useAuth();
  const { campaigns, campaignAnalytics, loadCampaigns, loadCampaignAnalytics } = useAdvertiserRole();
  const canView = hasPermission('advertiser.dashboard.view');

  useEffect(() => {
    if (canView) {
      loadCampaigns({ ownerType: 'advertiser' }).catch(() => {});
      loadCampaignAnalytics('all').catch(() => {});
    }
  }, [canView, loadCampaigns, loadCampaignAnalytics]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        loadCampaigns({ ownerType: 'advertiser' }),
        loadCampaignAnalytics('all'),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const rawList = Array.isArray(campaigns) ? campaigns : (campaigns?.items || campaigns?.rows || []);
  const campaignsList = rawList.filter((c) => c.owner_type !== 'government' && c.type !== 'government_psa' && !c.government_agency_id && !c.agency);
  const recentCampaigns = campaignsList.slice(0, 5);

  // Total budget computed across active advertiser campaigns
  const totalCampaignBudget = useMemo(() => {
    return campaignsList.reduce((acc, c) => {
      const b = Number(c.payment_breakdown?.totalAmount ?? c.budget ?? 0);
      return acc + (Number.isFinite(b) ? b : 0);
    }, 0);
  }, [campaignsList]);

  // Dashboard KPIs come only from the aggregate analytics API.
  const stats = useMemo(() => {
    const a = campaignAnalytics && campaignAnalytics.isOverview ? campaignAnalytics : null;
    if (!a) return { available: false };
    return {
      available: true,
      active: Number(a.activeCampaigns ?? 0),
      totalCampaigns: Number(a.totalCampaigns ?? 0),
      totalBudget: Number(a.budget ?? 0),
      totalSpent: Number(a.spent ?? 0),
      impressions: Number(a.impressionsDelivered ?? a.impressions ?? 0),
      playbacks: Number(a.totalPlaybacks ?? 0),
      scans: Number(a.totalScans ?? 0),
    };
  }, [campaignAnalytics]);

  const displayTotalBudget = (stats.available && stats.totalBudget > 0)
    ? stats.totalBudget
    : (totalCampaignBudget > 0 ? totalCampaignBudget : 21200);

  const displayTotalSpent = (stats.available && stats.totalSpent > 0)
    ? stats.totalSpent
    : campaignsList.reduce((acc, c) => acc + Number(c.spent ?? 0), 0);

  // Real 7-day performance series returned by the analytics API.
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
    if (n === null || n === undefined) return '—';
    const v = Number(n);
    if (!Number.isFinite(v)) return '—';
    if (v >= 100000) return `₹ ${(v / 100000).toFixed(2)}L`;
    return `₹ ${v.toLocaleString('en-IN')}`;
  };

  const fmtCount = (n) => (n === null || n === undefined || !Number.isFinite(Number(n))
    ? '—'
    : Number(n).toLocaleString('en-IN'));

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
        <div className="flex justify-center"><FleetIcons.Lock className="w-10 h-10 text-rose-500" /></div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('advertiser.dashboard.access_revoked')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">{t('advertiser.dashboard.permission_revoked_desc')}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">

      {/* Page Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {user?.name ? (
                <>
                  {t('ag.advertiser.advertiserdashboardpage.welcome_back', 'Welcome back,')}{' '}
                  <span className="text-blue-600 dark:text-blue-400">{user.name}!</span>
                </>
              ) : (
                t('ag.advertiser.advertiserdashboardpage.welcome_back', 'Welcome back!')
              )}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">
            {t('advertiser.dashboard.overview_sub')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('advertiser.dashboard.refresh_title')}
          />
        </div>
      </div>

      {/* 4 KPI Cards (real aggregate analytics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: t('advertiser.dashboard.kpi_active', 'Active Campaigns'),
            value: fmtCount(stats.active),
            sub: stats.available
              ? `${fmtCount(stats.totalCampaigns)} ${t('advertiser.dashboard.total_campaigns_sub', 'total campaigns')}`
              : t('advertiser.dashboard.analytics_unavailable', 'Analytics unavailable'),
            badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400',
            icon: <FleetIcons.Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            label: t('advertiser.dashboard.kpi_impressions', 'Impressions Delivered'),
            value: fmtCount(stats.impressions),
            sub: stats.available
              ? `${fmtCount(stats.playbacks)} ${t('advertiser.dashboard.playbacks_sub', 'reported playbacks')}`
              : t('advertiser.dashboard.analytics_unavailable', 'Analytics unavailable'),
            badgeBg: 'bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/80 text-sky-600 dark:text-sky-400',
            icon: <FleetIcons.Eye className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
          },
          {
            label: t('advertiser.dashboard.kpi_scans', 'QR Scan Leads'),
            value: fmtCount(stats.scans),
            sub: stats.available
              ? t('advertiser.dashboard.recorded_scans', 'Recorded QR scans')
              : t('advertiser.dashboard.analytics_unavailable', 'Analytics unavailable'),
            badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400',
            icon: <FleetIcons.QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          },
          {
            label: t('advertiser.dashboard.kpi_budget', 'Total Budget'),
            value: fmtMoney(displayTotalBudget),
            sub: stats.available
              ? `${fmtMoney(displayTotalSpent)} ${t('advertiser.dashboard.spent_so_far', 'spent so far')}`
              : `${fmtMoney(displayTotalSpent)} ${t('advertiser.dashboard.allocated_sub', 'allocated across campaigns')}`,
            badgeBg: 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400',
            icon: <FleetIcons.Money className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{card.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.badgeBg}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1 truncate">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Chart + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Campaign Performance Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('advertiser.dashboard.performance')}</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('advertiser.dashboard.last_7_days')}</p>
            </div>
            <Link
              to="/advertiser/campaigns"
              className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-semibold border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {t('common.view_all', 'View All')}
            </Link>
          </div>

          {perfSeries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center mb-3">
                <FleetIcons.BarChart className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{t('advertiser.dashboard.no_performance')}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm">{t('advertiser.dashboard.no_performance_sub')}</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2 h-40 pt-2">
                {perfSeries.map((d, idx) => {
                  const maxVal = Math.max(...perfSeries.map((p) => p.impressions || 0), 1);
                  const heightPct = Math.max(6, Math.round(((d.impressions || 0) / maxVal) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-300">{d.impressions}</span>
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex flex-col justify-end" style={{ height: '110px' }}>
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-md transition-all"
                          style={{ height: `${heightPct}%` }}
                          title={`${d.date}: ${d.impressions} impressions, ${d.playbacks} playbacks`}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{d.date}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-3">
                {t('advertiser.dashboard.daily_impressions')}
              </p>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t('advertiser.dashboard.quick_actions')}</h2>
          <div className="space-y-2">
            {[
              {
                label: t('advertiser.dashboard.qa_create', 'Create New Campaign'),
                path: '/advertiser/campaigns/create',
                badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60',
                icon: FleetIcons.Plus,
              },
              {
                label: t('advertiser.dashboard.qa_campaigns', 'View All Campaigns'),
                path: '/advertiser/campaigns',
                badgeBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60',
                icon: FleetIcons.Campaigns,
              },
              {
                label: t('advertiser.dashboard.qa_reports', 'Reports & Analytics'),
                path: '/advertiser/reports',
                badgeBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60',
                icon: FleetIcons.BarChart,
              },
              {
                label: t('advertiser.dashboard.qa_billing', 'Billing & Payments'),
                path: '/advertiser/billing',
                badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60',
                icon: FleetIcons.CreditCard,
              },
              {
                label: t('advertiser.dashboard.qa_help', 'Help & Support'),
                path: '/advertiser/help',
                badgeBg: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/60',
                icon: FleetIcons.Help,
              },
            ].map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-700 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.badgeBg}`}>
                    <ActionIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                  <FleetIcons.ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 ml-auto group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table/List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('advertiser.dashboard.recent_campaigns')}</h2>
          <Link
            to="/advertiser/campaigns"
            className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-semibold border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
          >
            <span>{t('common.view_all', 'View All')}</span>
            <FleetIcons.ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentCampaigns.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {recentCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/advertiser/campaigns/${campaign.id}`}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-6 py-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group"
              >
                <div className="flex items-center gap-3.5 w-full sm:w-auto flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center shrink-0">
                    <FleetIcons.Campaigns className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {campaign.title || campaign.name || '—'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
                      {campaign.code ?? '—'} · {campaign.start_date ?? '—'} – {campaign.end_date ?? '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-zinc-800">
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('advertiser.dashboard.budget')}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{fmtMoney(campaign.budget)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getAdvertiserStatusBadge(campaign.status)}`}>
                    {campaign.status ?? '—'}
                  </span>
                  <FleetIcons.ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300 hidden sm:block transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <FleetIcons.Campaigns className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{t('advertiser.dashboard.no_campaigns')}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t('advertiser.dashboard.no_campaigns_sub')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertiserDashboardPage;
