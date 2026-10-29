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
              {orgName ? `${orgName} Dashboard` : 'Admin Dashboard'}
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
            title={t('admin.dashboard.refresh')}
          />
          <Link
            to="/admin/technician-requests/new"
            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 w-full sm:w-auto text-center cursor-pointer"
          >
            <FleetIcons.Tracking className="w-4 h-4 text-blue-500" />
            <span>{t('admin.dashboard.request_tech')}</span>
          </Link>
          <Link
            to="/admin/fleet-operators/add"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto text-center cursor-pointer active:scale-95"
          >
            <FleetIcons.Plus className="w-4 h-4 text-white" />
            <span>{t('admin.dashboard.add_operator')}</span>
          </Link>
        </div>
      </div>

      {/* Primary Tenant KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('admin.dashboard.total_fleet')}</span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FleetIcons.Bus className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{kpis.totalBuses ?? '—'} {t('fleet.buses') || 'Buses'}</div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{kpis.activeOnRoute ?? '—'} {t('admin.dashboard.on_route')}</span>
            <span className="text-slate-400 dark:text-zinc-500">{kpis.inDepotMaintenance ?? '—'} {t('admin.dashboard.in_maintenance')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('admin.dashboard.active_drivers')}</span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FleetIcons.Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{kpis.totalDrivers ?? '—'} {t('nav.drivers') || 'Drivers'}</div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{kpis.validDrivers ?? '—'} {t('admin.dashboard.dl_valid')}</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{kpis.expiringDrivers ?? '—'} {t('admin.dashboard.expiring_soon')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('admin.dashboard.ad_rev_share')}</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FleetIcons.Check className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {kpis.tenantMonthlyRevenueShare !== undefined ? `₹ ${Number(kpis.tenantMonthlyRevenueShare || 0).toLocaleString('en-IN')}` : '—'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('admin.dashboard.earned_this_month')} {kpis.activeDisplays ?? '—'} {t('admin.dashboard.screens')}</p>
        </div>
      </div>

      {/* Fleet Operators Overview & Central Tech Work Orders Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Assigned Fleet Operators */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {t('nav.fleet_operators') || 'Fleet Operators'} ({operatorsList.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('admin.dashboard.operators_desc')}</p>
            </div>
            <Link to="/admin/fleet-operators" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              <span className="flex items-center gap-1">{t('admin.dashboard.view_all')} <FleetIcons.ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400" /></span>
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {operatorsList.length === 0 && (
              <p className="py-3 text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('admin.dashboard.no_operators')}</p>
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
                    {formatName(opr.depot)} · {opr.assignedBuses ?? '—'} {t('fleet.buses') || 'Buses'} · {opr.activeDriversCount ?? '—'} {t('nav.drivers') || 'Drivers'}
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
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {t('nav.technician_requests') || 'Technician Requests'} ({workOrdersList.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('admin.dashboard.tech_desc')}</p>
            </div>
            <Link to="/admin/technician-requests" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              <span className="flex items-center gap-1">{t('admin.dashboard.view_all')} <FleetIcons.ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400" /></span>
            </Link>
          </div>

          <div className="space-y-3">
            {workOrdersList.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('admin.dashboard.no_tech_requests')}</p>
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
                  <div className="text-slate-500 dark:text-zinc-400 text-[11px]">{t('admin.dashboard.target_bus')}: {req.busNumber ?? '—'} ({formatName(req.depot)})</div>
                  {tech && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                      {t('admin.dashboard.assigned_tech')}: {formatName(tech)} {tech.phone ? `(${tech.phone})` : ''}
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
