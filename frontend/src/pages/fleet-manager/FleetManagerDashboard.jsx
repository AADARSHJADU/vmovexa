import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useFleetManager } from '../../hooks/fleet/useFleetManager';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useFleetDriver } from '../../hooks/fleet/useFleetDriver';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { useNotifications } from '../../hooks/shared/useNotifications';
import { useAuth } from '../../hooks/useAuth';

export const FleetManagerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canView = hasPermission('fleet.dashboard.view');

  const { fleets, loadFleets, pagination: fleetPagination } = useFleetManager();
  const { vehicles, loadVehicles, pagination: vehiclePagination } = useFleetVehicle();
  const { drivers, loadDrivers } = useFleetDriver();
  const { devices, loadDevices } = useFleetGps();
  const { notifications, loadNotifications } = useNotifications();

  useEffect(() => { if (canView) loadFleets({ page: 1, limit: 4 }).catch(() => {}); }, [canView, loadFleets]);
  useEffect(() => { if (canView) loadVehicles().catch(() => {}); }, [canView, loadVehicles]);
  useEffect(() => { if (canView) loadDrivers().catch(() => {}); }, [canView, loadDrivers]);
  useEffect(() => { if (canView) loadDevices().catch(() => {}); }, [canView, loadDevices]);
  useEffect(() => { if (canView) loadNotifications({ page: 1, limit: 5 }).catch(() => {}); }, [canView, loadNotifications]);

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        loadFleets({ page: 1, limit: 4 }),
        loadVehicles(),
        loadDrivers(),
        loadDevices(),
        loadNotifications({ page: 1, limit: 5 }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const fleetList = Array.isArray(fleets) ? fleets : (fleets?.items || fleets?.rows || []);
  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
  const driverList = Array.isArray(drivers) ? drivers : (drivers?.items || drivers?.rows || []);
  const gpsList = Array.isArray(devices) ? devices : (devices?.items || devices?.rows || []);

  const totalFleets = fleetPagination?.total ?? (Array.isArray(fleets) ? fleets.length : (fleets?.total ?? fleetList.length));
  const totalVehicles = vehiclePagination?.total ?? (Array.isArray(vehicles) ? vehicles.length : (vehicles?.total ?? vehicleList.length));
  const totalDrivers = driverList.length;
  const totalGps = gpsList.length;

  const displayedFleets = fleetList.slice(0, 4);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const quickActions = [
    { 
      title: t('nav.fleets', 'Fleets'), 
      desc: 'View and manage fleets', 
      path: '/fleet-manager/fleets',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 border border-indigo-200 dark:border-indigo-800/60',
      icon: <FleetIcons.Bus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
    },
    { 
      title: t('nav.vehicles', 'Vehicles'), 
      desc: 'Manage vehicles & status', 
      path: '/fleet-manager/vehicles',
      iconBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 border border-sky-200 dark:border-sky-800/60',
      icon: <FleetIcons.Car className="w-5 h-5 text-sky-600 dark:text-sky-400" />
    },
    { 
      title: t('nav.drivers', 'Drivers'), 
      desc: 'Manage drivers & rosters', 
      path: '/fleet-manager/drivers',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800/60',
      icon: <FleetIcons.Driver className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    },
    { 
      title: t('nav.trips', 'Trips & Dispatch'), 
      desc: 'Scheduled & active trips', 
      path: '/fleet-manager/trips',
      iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 border border-purple-200 dark:border-purple-800/60',
      icon: <FleetIcons.Tracking className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    },
    { 
      title: t('nav.tracking', 'Live Tracking'), 
      desc: 'Track vehicles in real time', 
      path: '/fleet-manager/tracking',
      iconBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800/60',
      icon: <FleetIcons.Compass className="w-5 h-5 text-rose-600 dark:text-rose-400" />
    },
    { 
      title: t('nav.gps', 'GPS Devices'), 
      desc: 'Manage GPS devices & SIMs', 
      path: '/fleet-manager/gps',
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border border-amber-200 dark:border-amber-800/60',
      icon: <FleetIcons.Gps className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    },
    { 
      title: t('nav.reports', 'Reports'), 
      desc: 'View & export telematics', 
      path: '/fleet-manager/reports',
      iconBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 border border-teal-200 dark:border-teal-800/60',
      icon: <FleetIcons.BarChart className="w-5 h-5 text-teal-600 dark:text-teal-400" />
    },
  ];

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <FleetIcons.Lock className="w-12 h-12 text-slate-400 dark:text-zinc-600" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Access Revoked</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 font-medium">
          Your administrator has revoked your permission to view the fleet dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* 1. Header Web Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('common.welcome', 'Good Morning')},</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            {t('nav.fleets', 'Fleet Operations Console')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Real-time telematics, vehicle dispatch, and operational telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title="Refresh fleet metrics"
          />
          <button 
            onClick={() => navigate('/fleet-manager/tracking')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:bg-slate-200 text-xs font-bold transition-all shadow-sm"
          >
            <FleetIcons.Compass className="w-3.5 h-3.5 text-rose-500" />
            <span>{t('nav.tracking', 'Live Tracking Map')}</span>
          </button>
          <button 
            onClick={() => navigate('/fleet-manager/fleets/add')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-600/20"
          >
            <FleetIcons.Plus className="w-3.5 h-3.5 text-white" />
            <span>+ {t('fleet.add_fleet', 'Register Fleet')}</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards across 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Fleets */}
        <div 
          onClick={() => navigate('/fleet-manager/fleets')}
          className="p-5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('nav.fleets', 'Fleets')}</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center">
              <FleetIcons.Bus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalFleets}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 dark:text-zinc-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{t('common.active', 'All Active')}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Vehicles */}
        <div 
          onClick={() => navigate('/fleet-manager/vehicles')}
          className="p-5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('nav.vehicles', 'Vehicles')}</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800 flex items-center justify-center">
              <FleetIcons.Car className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalVehicles}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 dark:text-zinc-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{vehicleList.filter(v => v.status === 'on_route' || v.status === 'active' || v.status === 'in_depot').length || totalVehicles} {t('common.active', 'Fleet Vehicles')}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Drivers */}
        <div 
          onClick={() => navigate('/fleet-manager/drivers')}
          className="p-5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('nav.drivers', 'Drivers')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center">
              <FleetIcons.Driver className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalDrivers}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 dark:text-zinc-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{driverList.filter(d => d.status === 'active' || d.status === 'on_duty').length || totalDrivers} {t('driver.shifts', 'Roster Assigned')}</span>
            </div>
          </div>
        </div>

        {/* Card 4: GPS Devices */}
        <div 
          onClick={() => navigate('/fleet-manager/gps')}
          className="p-5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('nav.gps', 'GPS Devices')}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-800 flex items-center justify-center">
              <FleetIcons.Gps className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalGps}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 dark:text-zinc-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{gpsList.filter(g => g.status === 'active' || g.status === 'online').length || totalGps} {t('common.active', 'Online Units')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section: Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('dashboard.quick_actions', 'Quick Actions')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {quickActions.map((act) => (
            <Link
              key={act.title}
              to={act.path}
              className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center text-center group shadow-sm"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${act.iconBg}`}>
                {act.icon}
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {act.title}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                {act.desc}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Desktop Split: Left (2/3) Active Fleet Groups & Right (1/3) Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Fleet Groups */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('nav.fleets', 'Active Fleet Groups')}</h2>
                {totalFleets > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    Showing {displayedFleets.length} of {totalFleets}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Manage regional divisions, vehicle assignments and live operations</p>
            </div>
            <Link to="/fleet-manager/fleets" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0">
              <span>{t('common.view_details', 'View All Fleets')} ({totalFleets})</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {fleetList.length === 0 && (
              <div className="md:col-span-2 p-8 rounded-2xl bg-white dark:bg-[#11141d] border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400">
                {t('common.no_data', 'No fleets yet')}
              </div>
            )}
            {displayedFleets.map((fleet) => (
              <div
                key={fleet.id}
                onClick={() => navigate(`/fleet-manager/fleets/${fleet.id}`)}
                className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 shrink-0">
                        <FleetIcons.Bus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{fleet.name ?? '—'}</h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{fleet.code ?? '—'}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                      (fleet.status ?? 'active') === 'active' || (fleet.status ?? 'Active') === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span className="capitalize">{fleet.status ?? 'Active'}</span>
                    </span>
                  </div>

                  {/* 3 Metric counters */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-center">
                    <div className="bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('nav.vehicles', 'Vehicles')}</div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">{fleet.vehicles_count ?? fleet.assigned_buses ?? 0}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('nav.drivers', 'Drivers')}</div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">{fleet.drivers_count ?? fleet.active_drivers_count ?? 0}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('nav.gps', 'GPS Online')}</div>
                      <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{fleet.gps_online_count ?? 0}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <span>{t('table.updated_at', 'Updated')}: {fleet.updated_at ? new Date(fleet.updated_at).toLocaleDateString() : '—'}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                    {t('common.view_details', 'Manage Fleet')} →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {totalFleets > displayedFleets.length && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <FleetIcons.Bus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Showing <strong>{displayedFleets.length}</strong> of <strong>{totalFleets}</strong> registered fleet divisions</span>
              </div>
              <Link to="/fleet-manager/fleets" className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <span>{t('common.view_all', 'View Full Fleet Registry')}</span>
                <span>→</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Recent Alerts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('common.alerts', 'Recent Alerts')}</h2>
              {notifications.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </div>
            <Link to="/fleet-manager/notifications" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <span>{t('common.view_details', 'View All')}</span>
              <span>→</span>
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3 divide-y divide-slate-100 dark:divide-zinc-800">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-2">
                  <FleetIcons.CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">All Systems Operational</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">No critical alerts or dispatch warnings.</div>
              </div>
            ) : (
              notifications.slice(0, 4).map((alert, idx) => {
                const isApproved = alert.title?.toLowerCase().includes('approved');
                const isPending = alert.title?.toLowerCase().includes('pending');
                const isOfflineOrAlert = alert.severity === 'error' || alert.severity === 'warning' || alert.title?.toLowerCase().includes('offline') || alert.title?.toLowerCase().includes('failed');

                let badgeColor = 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 border border-blue-200 dark:border-blue-800';
                let IconComponent = FleetIcons.Bell;

                if (isApproved) {
                  badgeColor = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800';
                  IconComponent = FleetIcons.CheckCircle;
                } else if (isPending) {
                  badgeColor = 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border border-amber-200 dark:border-amber-800';
                  IconComponent = FleetIcons.Clock;
                } else if (isOfflineOrAlert) {
                  badgeColor = 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800';
                  IconComponent = FleetIcons.Alert;
                }

                return (
                  <div key={alert.id || idx} className="pt-3 first:pt-0 flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${badgeColor}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={alert.title}>
                          {alert.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 whitespace-nowrap shrink-0">
                          {formatTimeAgo(alert.created_at || alert.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                        {alert.body || 'No description provided'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetManagerDashboard;
