import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { useNotifications } from '../../hooks/shared/useNotifications';
import { useAuth } from '../../hooks/useAuth';

export const FleetManagerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canView = hasPermission('fleet.dashboard.view');
  const canViewVehicles = hasPermission('fleet.vehicles.view');
  const canCreateVehicles = hasPermission('fleet.vehicles.create');
  const canViewDrivers = hasPermission('fleet.drivers.view');
  const canViewDevices = hasPermission('fleet.devices.read');
  const canViewTracking = hasPermission('fleet.tracking.view');
  const canViewRoutes = hasPermission('fleet.routes.view');
  const canViewTrips = hasPermission('fleet.trips.view');
  const canViewReports = hasPermission('fleet.reports.view');

  const { vehicles, loadVehicles, pagination: vehiclePagination } = useFleetVehicle();
  const { devices, loadDevices } = useFleetGps();
  const { notifications, loadNotifications } = useNotifications();

  useEffect(() => { if (canView && canViewVehicles) loadVehicles().catch(() => {}); }, [canView, canViewVehicles, loadVehicles]);
  useEffect(() => { if (canView && canViewDevices) loadDevices().catch(() => {}); }, [canView, canViewDevices, loadDevices]);
  useEffect(() => { if (canView) loadNotifications({ page: 1, limit: 5 }).catch(() => {}); }, [canView, loadNotifications]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        ...(canViewVehicles ? [loadVehicles()] : []),
        ...(canViewDevices ? [loadDevices()] : []),
        loadNotifications({ page: 1, limit: 5 }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const vehicleList = useMemo(() => {
    return Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
  }, [vehicles]);

  const gpsList = useMemo(() => {
    return Array.isArray(devices) ? devices : (devices?.items || devices?.rows || []);
  }, [devices]);

  // 1. Vehicles metrics
  const totalVehicles = (vehiclePagination?.page === 1 && vehicleList.length < (vehiclePagination?.limit || 20))
    ? vehicleList.length
    : (vehiclePagination?.total ?? vehicleList.length);
  const onRouteVehicles = vehicleList.filter(v => v.status === 'on_route');
  const inDepotVehicles = vehicleList.filter(v => v.status === 'in_depot');

  // 2. Drivers strictly ASSIGNED to this operator's fleet vehicles
  const vehiclesWithDriver = useMemo(() => {
    return vehicleList.filter(v => Boolean(v.assigned_driver_id || v.driver));
  }, [vehicleList]);

  const assignedDriversCount = useMemo(() => {
    const ids = new Set();
    vehiclesWithDriver.forEach(v => {
      if (v.driver?.id) ids.add(v.driver.id);
      else if (v.assigned_driver_id) ids.add(v.assigned_driver_id);
    });
    return ids.size;
  }, [vehiclesWithDriver]);

  // 3. GPS Trackers strictly ASSIGNED to this operator's fleet vehicles
  const vehiclesWithGps = useMemo(() => {
    return vehicleList.filter(v => 
      Boolean(v.gpsDevice || v.gps_device_id || v.gps_status === 'active' || (gpsList && gpsList.some(g => Number(g.vehicle_id) === Number(v.id))))
    );
  }, [vehicleList, gpsList]);

  const totalAssignedGps = vehiclesWithGps.length;

  // 4. Live Tracking / On Route (strictly real count, 0 if none)
  const liveOnRouteCount = onRouteVehicles.length;

  const displayedVehicles = vehicleList.slice(0, 4);

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
      title: 'Fleet Vehicles', 
      desc: 'Fleet vehicles & status', 
      path: '/fleet-operator/vehicles',
      iconBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 border border-sky-200 dark:border-sky-800/60',
      allowed: canViewVehicles,
      icon: <FleetIcons.Car className="w-5 h-5 text-sky-600 dark:text-sky-400" />
    },
    { 
      title: 'Drivers', 
      desc: 'Assigned drivers & rosters', 
      path: '/fleet-operator/drivers',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800/60',
      allowed: canViewDrivers,
      icon: <FleetIcons.Driver className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    },
    { 
      title: 'Live Tracking', 
      desc: 'Real-time vehicle telematics', 
      path: '/fleet-operator/tracking',
      iconBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800/60',
      allowed: canViewTracking,
      icon: <FleetIcons.Compass className="w-5 h-5 text-rose-600 dark:text-rose-400" />
    },
    { 
      title: 'Edge Devices', 
      desc: 'Vehicle edge boxes & GPS', 
      path: '/fleet-operator/edge-devices',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 border border-cyan-200 dark:border-cyan-800/60',
      allowed: canViewDevices,
      icon: <FleetIcons.EdgeDevice className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
    },
    { 
      title: 'Routes', 
      desc: 'Transit lines & stops', 
      path: '/fleet-operator/routes',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 border border-indigo-200 dark:border-indigo-800/60',
      allowed: canViewRoutes,
      icon: <FleetIcons.Pin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
    },
    { 
      title: 'Trips & Dispatch', 
      desc: 'Scheduled & active trips', 
      path: '/fleet-operator/trips',
      iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 border border-purple-200 dark:border-purple-800/60',
      allowed: canViewTrips,
      icon: <FleetIcons.Tracking className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    },
    { 
      title: 'Reports & Analytics', 
      desc: 'Fleet logs & metrics', 
      path: '/fleet-operator/reports',
      iconBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 border border-teal-200 dark:border-teal-800/60',
      allowed: canViewReports,
      icon: <FleetIcons.BarChart className="w-5 h-5 text-teal-600 dark:text-teal-400" />
    },
  ].filter((action) => action.allowed);

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <FleetIcons.Lock className="w-12 h-12 text-slate-400 dark:text-zinc-600" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('fleet.dashboard.access_revoked')}</h2>
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
            Fleet Operations Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
            Manage fleet vehicles, assigned drivers, linked GPS trackers, and live route telematics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('fleet.dashboard.refresh_metrics')}
          />
          {canViewTracking && <button
            onClick={() => navigate('/fleet-operator/tracking')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:bg-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <FleetIcons.Compass className="w-3.5 h-3.5 text-rose-500" />
            <span>{t('fleet.dashboard.live_map')}</span>
          </button>}
          {canCreateVehicles && <button
            onClick={() => navigate('/fleet-operator/vehicles/add')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
          >
            <FleetIcons.Plus className="w-3.5 h-3.5 text-white" />
            <span>{t('fleet.dashboard.add_vehicle')}</span>
          </button>}
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards across 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Vehicles */}
        {canViewVehicles && <div
          onClick={() => navigate('/fleet-operator/vehicles')}
          className="p-5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('fleet.dashboard.fleet_vehicles')}</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800 flex items-center justify-center">
              <FleetIcons.Car className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalVehicles}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 dark:text-zinc-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{inDepotVehicles.length} In Depot · {onRouteVehicles.length} On Route</span>
            </div>
          </div>
        </div>}

        {/* Card 2: {t('fleet.dashboard.assigned_drivers')} */}
        {canViewDrivers && canViewVehicles && <div
          onClick={() => navigate('/fleet-operator/drivers')}
          className="p-5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('fleet.dashboard.assigned_drivers')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center">
              <FleetIcons.Driver className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{assignedDriversCount}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 dark:text-zinc-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{vehiclesWithDriver.length} of {totalVehicles} Vehicles Assigned</span>
            </div>
          </div>
        </div>}

        {/* Card 3: {t('fleet.dashboard.assigned_edge')} */}
        {canViewDevices && canViewVehicles && <div
          onClick={() => navigate('/fleet-operator/edge-devices')}
          className="p-5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('fleet.dashboard.assigned_edge')}</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center">
              <FleetIcons.EdgeDevice className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalAssignedGps}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 dark:text-zinc-300 font-semibold">
              <span className={`w-2 h-2 rounded-full ${totalAssignedGps > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              <span>{totalAssignedGps} of {totalVehicles} Buses Connected</span>
            </div>
          </div>
        </div>}

        {/* Card 4: {t('fleet.dashboard.live_telematics')} */}
        {canViewTracking && canViewVehicles && <div
          onClick={() => navigate('/fleet-operator/tracking')}
          className="p-5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('fleet.dashboard.live_telematics')}</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-800 flex items-center justify-center">
              <FleetIcons.Compass className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {liveOnRouteCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 dark:text-zinc-300 font-semibold">
              <span className={`w-2 h-2 rounded-full ${liveOnRouteCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'}`}></span>
              <span>{liveOnRouteCount > 0 ? `${liveOnRouteCount} Moving on Route` : `${inDepotVehicles.length} Idle in Depot`}</span>
            </div>
          </div>
        </div>}
      </div>

      {/* 3. Section: {t('fleet.dashboard.quick_actions')} */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('fleet.dashboard.quick_actions')}</h2>
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
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1 font-medium">
                {act.desc}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Desktop Split: Left (2/3) Assigned Fleet Vehicles & Right (1/3) Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Fleet Vehicles */}
        {canViewVehicles && <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('fleet.dashboard.fleet_vehicles')}</h2>
                {totalVehicles > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {t('common.showing')} {displayedVehicles.length} {t('common.of')} {totalVehicles}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('fleet.dashboard.manage_fleet_desc')}</p>
            </div>
            <Link to="/fleet-operator/vehicles" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0">
              <span>{t('common.view_all', 'View All')} Vehicles ({totalVehicles})</span>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {vehicleList.length === 0 && (
              <div className="md:col-span-2 p-8 rounded-2xl bg-white dark:bg-[#11141d] border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400 font-medium">
                No vehicles registered in this fleet yet
              </div>
            )}
            {displayedVehicles.map((vehicle) => {
              const statusStr = (vehicle.status ?? 'in_depot').toLowerCase();
              const hasGps = Boolean(vehicle.gpsDevice || vehicle.gps_device_id || vehicle.gps_status === 'active' || (gpsList && gpsList.some(g => Number(g.vehicle_id) === Number(vehicle.id))));

              return (
                <div
                  key={vehicle.id}
                  onClick={() => navigate(`/fleet-operator/vehicles/${vehicle.id}`)}
                  className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 shrink-0">
                          <FleetIcons.Car className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono tracking-tight truncate">
                            {vehicle.bus_number || vehicle.code || `Vehicle #${vehicle.id}`}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate font-medium">
                            {[vehicle.model, vehicle.vehicle_type].filter(Boolean).join(' · ') || 'Transit Bus'}
                          </p>
                        </div>
                      </div>

                      {statusStr === 'on_route' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>{t('fleet.dashboard.on_route')}</span>
                        </span>
                      )}
                      {statusStr === 'in_depot' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>{t('fleet.dashboard.in_depot')}</span>
                        </span>
                      )}
                      {statusStr === 'maintenance' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>{t('fleet.dashboard.maintenance')}</span>
                        </span>
                      )}
                      {statusStr === 'pending_approval' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          <span>{t('common.pending_review')}</span>
                        </span>
                      )}
                      {statusStr !== 'on_route' && statusStr !== 'in_depot' && statusStr !== 'maintenance' && statusStr !== 'pending_approval' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span className="capitalize">{vehicle.status || 'Offline'}</span>
                        </span>
                      )}
                    </div>

                    {/* 3 Metric Counters */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-center">
                      <div className="bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('common.driver')}</div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5 truncate">
                          {vehicle.driver?.name || (vehicle.assigned_driver_id ? `Driver #${vehicle.assigned_driver_id}` : 'Unassigned')}
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('common.gps')}</div>
                        <div className={`font-bold text-xs mt-0.5 truncate ${hasGps ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'}`}>
                          {hasGps ? (vehicle.gpsDevice?.code || 'Linked') : 'None'}
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('common.depot')}</div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5 truncate">
                          {vehicle.depot?.name || (vehicle.depot_id ? `Depot #${vehicle.depot_id}` : 'Main')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                    <span className="truncate max-w-[200px]">
                      Route: <strong className="text-slate-700 dark:text-zinc-300 font-medium">{vehicle.route?.name || vehicle.assigned_route || 'Not Assigned'}</strong>
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 shrink-0">
                      {t('fleet.dashboard.vehicle_details')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {totalVehicles > displayedVehicles.length && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm text-xs text-slate-600 dark:text-zinc-400 font-medium">
              <div className="flex items-center gap-2">
                <FleetIcons.Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{t('common.showing')} <strong>{displayedVehicles.length}</strong> {t('common.of')} <strong>{totalVehicles}</strong> {t('fleet.dashboard.fleet_vehicles')}</span>
              </div>
              <Link to="/fleet-operator/vehicles" className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <span>{t('fleet.dashboard.view_registry')}</span>
                <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline" />
              </Link>
            </div>
          )}
        </div>}

        {/* Right Column: Recent Alerts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('fleet.dashboard.recent_alerts')}</h2>
              {notifications.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </div>
            <Link to="/fleet-operator/notifications" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <span>{t('common.view_all', 'View All')}</span>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3 divide-y divide-slate-100 dark:divide-zinc-800">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-2">
                  <FleetIcons.CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">{t('fleet.dashboard.all_sys_operational')}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">{t('fleet.dashboard.no_alerts_desc')}</div>
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
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2 font-medium">
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
