import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';
import { useAuth } from '../../hooks/useAuth';

export const TechnicianDashboard = () => {
  const { t } = useTranslation();
  const { user, hasPermission } = useAuth();
  const canView = hasPermission('technician.dashboard.view');
  const { workOrders, devices, stats, loadWorkOrders, loadDevices, loadStats } = useTechnicianApp();

  useEffect(() => {
    if (canView) {
      loadWorkOrders().catch(() => {});
      loadDevices().catch(() => {});
      loadStats().catch(() => {});
    }
  }, [canView, loadWorkOrders, loadDevices, loadStats]);

  const deviceList = useMemo(
    () => (Array.isArray(devices) ? devices : (devices?.rows || [])),
    [devices]
  );
  const todaysTasks = useMemo(
    () => (Array.isArray(workOrders) ? workOrders : (workOrders?.rows || [])),
    [workOrders]
  );

  const kpis = useMemo(() => {
    const onlineDevices = deviceList.filter((d) => (d.status || '').toLowerCase() === 'online').length;
    const offlineDevices = deviceList.filter((d) => (d.status || '').toLowerCase() === 'offline').length;
    return {
      onlineDevices,
      offlineDevices,
      brokenWithIssues: Math.max(deviceList.length - onlineDevices - offlineDevices, 0),
      totalDevices: deviceList.length,
    };
  }, [deviceList]);

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
        <div className="text-4xl"><FleetIcons.Key className="w-6 h-6 text-amber-600 dark:text-amber-400" /></div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('technician.dashboard.access_revoked')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Your administrator has revoked your permission (<strong>technician.dashboard.view</strong>) to view the Technician dashboard.
        </p>
      </div>
    );
  }

  const profile = {
    name: user?.name ?? '—',
    role: typeof user?.role === 'object' && user?.role !== null ? (user.role.name || user.role.code || 'Technician') : (user?.role ?? 'Technician'),
    depot: typeof user?.depot === 'object' && user?.depot !== null ? (user.depot.name || user.depot.code || '—') : (user?.depot ?? '—'),
    badgeId: user?.badgeId ?? user?.id ?? '—',
  };

  const avgRating = stats?.averageRating != null ? Number(stats.averageRating).toFixed(1) : null;
  const totalRatingsCount = Number(stats?.totalRatingsCount || 0);
  const recentRatings = Array.isArray(stats?.recentRatings) ? stats.recentRatings : [];

  const ratingBreakdown = [
    { stars: 5, count: Number(stats?.fiveStarCount || 0) },
    { stars: 4, count: Number(stats?.fourStarCount || 0) },
    { stars: 3, count: Number(stats?.threeStarCount || 0) },
    { stars: 2, count: Number(stats?.twoStarCount || 0) },
    { stars: 1, count: Number(stats?.oneStarCount || 0) },
  ];

  const parseTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [tags];
    }
  };

  const renderStars = (score, max = 5, sizeClass = 'w-4 h-4') => {
    const rounded = Math.round(Number(score || 0));
    return Array.from({ length: max }, (_, i) => (
      <FleetIcons.Star
        key={i}
        filled={i < rounded}
        className={`${sizeClass} ${i < rounded ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-zinc-700 fill-none'}`}
      />
    ));
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'resolved':
      case 'closed':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'approved':
      case 'dispatched':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    }
  };

  const isSuperAdmin = window.location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/technician' : '/technician';

  const quickActions = [
    {
      title: 'Field Work Orders',
      desc: 'View & resolve assigned depot tasks',
      path: `${basePath}/work-orders`,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800',
      icon: <FleetIcons.Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      badge: `${todaysTasks.length} Assigned`,
    },
    {
      title: 'Display Devices',
      desc: 'View & manage all active display units',
      path: `${basePath}/devices`,
      iconBg: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700',
      icon: <FleetIcons.Layers className="w-5 h-5 text-slate-600 dark:text-slate-400" />,
      badge: `${deviceList.length} Total`,
    },
    {
      title: 'Hardware Config',
      desc: 'Screen, network & power settings',
      path: deviceList[0]?.id ? `${basePath}/devices/${deviceList[0].id}/config` : `${basePath}/devices`,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800',
      icon: <FleetIcons.Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      badge: 'Configure',
    },
    {
      title: 'GPS Installation',
      desc: 'Assign and wire GPS telematics units',
      path: `${basePath}/gps`,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800',
      icon: <FleetIcons.Gps className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      badge: 'Install',
    },
    {
      title: 'Device Diagnostics',
      desc: 'Run real-time subsystem tests',
      path: `${basePath}/diagnostics`,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/50 dark:border-purple-800',
      icon: <FleetIcons.Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      badge: 'Run Test',
    },
    {
      title: 'Hardware Status',
      desc: 'Live telemetry health & error codes',
      path: `${basePath}/hardware-status`,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800',
      icon: <FleetIcons.Gauge className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      badge: 'Live Status',
    },
    {
      title: 'Connectivity Troubleshooting',
      desc: 'Test pings & remote reboot / reset',
      path: `${basePath}/connectivity`,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:border-rose-800',
      icon: <FleetIcons.Speed className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      badge: 'Resolve',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome, {profile.name}! 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {profile.role} · {profile.depot} · {profile.badgeId}
            {stats?.certLevel && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                {stats.certLevel}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {/* Live Rating Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-bold shadow-sm">
            <div className="flex items-center gap-1">
              <FleetIcons.Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" filled={true} />
              <span className="font-black text-amber-900 dark:text-amber-200">
                {avgRating ? `${avgRating}` : '—'}
              </span>
              <span className="text-amber-600/70 dark:text-amber-400/60 font-normal">/ 5.0</span>
            </div>
            <span className="text-amber-300 dark:text-amber-700">•</span>
            <span className="text-amber-700 dark:text-amber-300 font-semibold">
              {totalRatingsCount} {totalRatingsCount === 1 ? 'Client Rating' : 'Client Ratings'}
            </span>
          </div>

          {/* Online Devices Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{kpis.onlineDevices}/{kpis.totalDevices} devices online</span>
          </div>

          <Link
            to="/technician/devices/register"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all shadow-blue-600/20"
          >
            <FleetIcons.Plus className="w-4 h-4 text-white" />
            <span>{t('technician.register_device', 'Register Device')}</span>
          </Link>
        </div>
      </div>

      {/* 5 KPI Metric Cards (Including Average Rating & Reviewers Count) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Rating & Trust KPI Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Technician Rating
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <FleetIcons.Star className="w-4 h-4 text-amber-500 fill-amber-400" filled={true} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {avgRating ? avgRating : '—'}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">/ 5.0</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {totalRatingsCount > 0 ? `${totalRatingsCount} Verified` : 'No Reviews'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-2 flex items-center gap-1">
            <span>{t('technician.dashboard.rated_by')}</span>
            <strong className="text-slate-700 dark:text-zinc-300 font-bold">
              {totalRatingsCount} {totalRatingsCount === 1 ? 'client' : 'clients'}
            </strong>
            <span>{t('technician.dashboard.across_orders')}</span>
          </p>
        </div>

        {/* Offline Devices Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{t('technician.offline_devices', 'Offline Devices')}</span>
            <span className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800">
              <FleetIcons.Alert className="w-4 h-4 text-red-600 dark:text-red-400" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{kpis.offlineDevices}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              {t('technician.needs_attention', 'Needs Attention')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-2">{kpis.offlineDevices} {kpis.offlineDevices === 1 ? 'unit requires' : 'units require'} field check</p>
        </div>

        {/* Online Devices Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{t('technician.online_devices', 'Online Devices')}</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{kpis.onlineDevices}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {t('technician.all_active', 'All Active')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-2">{t('technician.transmitting', 'Transmitting live telemetry')}</p>
        </div>

        {/* Broken Issues Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{t('technician.broken_issues', 'Broken with Issues')}</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <FleetIcons.Settings className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{kpis.brokenWithIssues}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {kpis.brokenWithIssues} {t('common.pending', 'Unrepaired')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-2">{t('technician.temp_faults', 'High temp & power faults')}</p>
        </div>

        {/* Total Devices Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{t('common.devices', 'Total Devices')}</span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <FleetIcons.Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{kpis.totalDevices}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {t('common.active', 'In Network')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-2">{t('dashboard.operating_depots', 'Registered across transit depots')}</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{t('dashboard.quick_actions', 'Quick Actions')}</h2>
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('technician.dashboard.console_title')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.path}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl border transition-colors ${action.iconBg}`}>
                  {action.icon}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  {action.badge}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">{action.desc}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                <span>{t('technician.dashboard.open_module')}</span>
                <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Technician Rating & Client Reviews Section */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <FleetIcons.Star className="w-4 h-4 text-amber-500 fill-amber-400" filled={true} />
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Client Ratings & Service Reviews
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
              Verified performance evaluations submitted by Fleet Operators and Clients upon work order resolution
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {totalRatingsCount} {totalRatingsCount === 1 ? 'Client Review' : 'Client Reviews'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Overall Score & Star Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="text-center p-3.5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 min-w-[100px] shadow-sm">
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {avgRating ? avgRating : '—'}
                </div>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  {renderStars(avgRating || 0, 5, 'w-3 h-3')}
                </div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 mt-1">{t('technician.dashboard.out_of_5')}</div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('technician.dashboard.overall_satisfaction')}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Based on <strong>{totalRatingsCount} verified client {totalRatingsCount === 1 ? 'rating' : 'ratings'}</strong> from completed depot work orders.
                </p>
                {stats?.certLevel && (
                  <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 pt-0.5">
                    Clearance: {stats.certLevel}
                  </div>
                )}
              </div>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-700/60">
              {ratingBreakdown.map((item) => {
                const percentage = totalRatingsCount > 0 ? Math.round((item.count / totalRatingsCount) * 100) : 0;
                return (
                  <div key={item.stars} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                      <span>{item.stars}</span>
                      <FleetIcons.Star className="w-3 h-3 text-amber-400 fill-amber-400" filled={true} />
                    </span>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Recent Client Reviews (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Recent Client Feedback & Comments
              </h3>
              <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                {recentRatings.length} shown
              </span>
            </div>

            {recentRatings.length === 0 ? (
              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                  <FleetIcons.Star className="w-5 h-5 text-amber-500 fill-amber-400" filled={true} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">{t('technician.dashboard.no_client_reviews')}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  When fleet operators or clients rate and submit feedback on your resolved work orders, their star ratings, comments, and praises will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRatings.map((ratingItem) => {
                  const tags = parseTags(ratingItem.rating_tags);
                  const clientName = ratingItem.ratedByUser?.name || ratingItem.organization?.name || 'Verified Client';
                  const formattedDate = ratingItem.rated_at
                    ? new Date(ratingItem.rated_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recently';

                  return (
                    <div
                      key={ratingItem.id}
                      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                            {clientName.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{clientName}</span>
                              {ratingItem.organization?.name && (
                                <span className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">
                                  ({ratingItem.organization.name})
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                              {formattedDate} • Work Order:{' '}
                              <strong className="text-slate-600 dark:text-zinc-300 font-mono">
                                {ratingItem.code || `#${ratingItem.id}`}
                              </strong>
                              {ratingItem.bus_number && ` • Bus ${ratingItem.bus_number}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
                          <div className="flex items-center gap-0.5">
                            {renderStars(ratingItem.rating, 5, 'w-3 h-3')}
                          </div>
                          <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                            {Number(ratingItem.rating).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {ratingItem.rating_comment && (
                        <p className="text-xs text-slate-700 dark:text-zinc-300 italic bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                          "{ratingItem.rating_comment}"
                        </p>
                      )}

                      {tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                            >
                              <FleetIcons.Check className="w-3 h-3 text-emerald-600 inline mr-0.5" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Tasks & Urgent Work Orders */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('technician.dashboard.todays_assigned_tasks')}</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('technician.dashboard.tasks_desc')}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
              {todaysTasks.length} Active Tasks
            </span>
            <Link
              to={`${basePath}/work-orders`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <span>{t('common.view_all')}</span>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline ml-1" />
            </Link>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {todaysTasks.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('technician.dashboard.no_assigned_tasks')}</div>
          )}
          {todaysTasks.map((task) => (
            <div key={task.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{task.code ?? task.id ?? '—'}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">• {task.issue_category ?? task.description ?? '—'}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(task.status)}`}>
                    {task.status ?? '—'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-3">
                  <span>{t('common.vehicle')}: <strong className="text-slate-800 dark:text-zinc-200">{task.bus_number ?? '—'}</strong></span>
                  <span>{t('common.urgency')}: <strong className="text-slate-800 dark:text-zinc-200">{task.urgency ?? '—'}</strong></span>
                  <span>{t('common.category')}: <strong className="text-slate-800 dark:text-zinc-200">{task.issue_category ?? '—'}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link
                  to={`${basePath}/work-orders/${task.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span>{t('technician.dashboard.open_work_order')}</span>
                  <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

