import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { useAdminFleetOperator } from '../../hooks/admin/useAdminFleetOperator';
import { useAdminTechnicianRequest } from '../../hooks/admin/useAdminTechnicianRequest';
import { useAuth } from '../../hooks/useAuth';

const formatName = (v, fallback = '—') => {
  if (!v) return fallback;
  if (typeof v === 'object') return v.name || v.code || fallback;
  return String(v);
};

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { kpis: apiKpis, loadKpis } = useAdminDashboard();
  const { fleetOperators, loadFleetOperators } = useAdminFleetOperator();
  const { workOrders, loadWorkOrders } = useAdminTechnicianRequest();

  useEffect(() => {
    loadKpis().catch(() => {});
    loadFleetOperators().catch(() => {});
    loadWorkOrders().catch(() => {});
  }, [loadKpis, loadFleetOperators, loadWorkOrders]);

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([loadKpis(), loadFleetOperators(), loadWorkOrders()]);
    } finally {
      setRefreshing(false);
    }
  };

  const kpis = apiKpis || {};
  const orgName = user?.organization?.name || user?.org?.name || '';
  const operatorsList = Array.isArray(fleetOperators) ? fleetOperators : (fleetOperators?.items || fleetOperators?.rows || []);
  const workOrdersList = Array.isArray(workOrders) ? workOrders : (workOrders?.items || workOrders?.rows || []);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Org Scope Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {orgName || 'Operations'} {t('common.console', 'Operations Console')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {user?.name ?? ''}{user?.email ? ` · ${user.email}` : ''}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title="Refresh console metrics"
          />
          <Link
            to="/admin/technician-requests/new"
            className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 w-full sm:w-auto text-center"
          >
            <FleetIcons.Target className="w-4 h-4" />
            <span>{t('technician.assign_ticket', 'Request Central Tech')}</span>
          </Link>
          <Link
            to="/admin/fleet-operators/add"
            className="px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto text-center"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>+ {t('fleet.add_fleet', 'Add Fleet Operator')}</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Tenant KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('nav.fleets', 'Total Fleet')}</span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FleetIcons.Bus className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{kpis.totalBuses ?? '—'} {t('common.buses', 'Buses')}</div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{kpis.activeOnRoute ?? '—'} {t('dashboard.on_route', 'On Route')}</span>
            <span className="text-slate-400 dark:text-zinc-500">{kpis.inDepotMaintenance ?? '—'} {t('dashboard.in_maintenance', 'Maintenance')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('nav.drivers', 'Licensed Drivers')}</span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FleetIcons.Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{kpis.totalDrivers ?? '—'} {t('common.drivers', 'Drivers')}</div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{kpis.validDrivers ?? '—'} {t('common.approved', 'DL Valid')}</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{kpis.expiringDrivers ?? '—'} {t('common.pending', 'Expiring Soon')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('dashboard.revenue', 'Ad Revenue Share (35%)')}</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FleetIcons.Check className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {kpis.tenantMonthlyRevenueShare !== undefined ? `₹ ${Number(kpis.tenantMonthlyRevenueShare || 0).toLocaleString('en-IN')}` : '—'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('dashboard.revenue_live', 'Earned this month on')} {kpis.activeDisplays ?? '—'} {t('common.screens', 'screens')}</p>
        </div>

        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('driver.shifts', 'Schedule Adherence')}</span>
            <span className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FleetIcons.Speed className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{kpis.scheduleAdherenceRate ?? '—'}</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('nav.depots', 'Across')} {kpis.depotsCount ?? '—'} {t('nav.depots', 'operating depots')}</p>
        </div>
      </div>

      {/* Fleet Operators Overview & Central Tech Work Orders Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Assigned Fleet Operators */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {t('fleet.operators', 'Depot Fleet Operators')} ({operatorsList.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('fleet.route_assigned', 'Managers responsible for vehicle & driver shifts')}</p>
            </div>
            <Link to="/admin/fleet-operators" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              {t('common.view_details', 'Manage All')} →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {operatorsList.length === 0 && (
              <p className="py-3 text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('common.no_data', 'No fleet operators yet')}</p>
            )}
            {operatorsList.slice(0, 4).map((opr) => (
              <div key={opr.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{opr.name}</span>
                    <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.2 rounded">
                      {opr.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                    {formatName(opr.depot)} · {opr.assignedBuses ?? '—'} {t('common.buses', 'Buses')} · {opr.activeDriversCount ?? '—'} {t('common.drivers', 'Drivers')}
                  </p>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  {opr.status ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Central Technician Request Desk */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {t('technician.work_orders', 'Central Technician Work Orders')} ({workOrdersList.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('technician.hardware_health', 'Hardware installation & GPS repair tickets dispatched from VMOVEXA Pool')}</p>
            </div>
            <Link to="/admin/technician-requests" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              {t('common.view_details', 'View Desk')} →
            </Link>
          </div>

          <div className="space-y-3">
            {workOrdersList.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('common.no_data', 'No work orders yet')}</p>
            )}
            {workOrdersList.slice(0, 2).map((req) => {
              const tech = req.assignedTech || req.technician;
              return (
                <div key={req.id} className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{req.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      {req.status ?? '—'}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">{req.issueCategory ?? req.title ?? 'Work Order'}</div>
                  <div className="text-slate-500 dark:text-zinc-400 text-[11px]">Target: {req.busNumber ?? '—'} ({formatName(req.depot)})</div>
                  {tech && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                      Assigned Tech: {formatName(tech)} {tech.phone ? `(${tech.phone})` : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
