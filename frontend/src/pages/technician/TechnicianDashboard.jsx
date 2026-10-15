import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';
import { useAuth } from '../../hooks/useAuth';

export const TechnicianDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const canView = hasPermission('technician.dashboard.view');
  const { workOrders, devices, loadWorkOrders, loadDevices } = useTechnicianApp();

  useEffect(() => {
    if (canView) {
      loadWorkOrders().catch(() => {});
      loadDevices().catch(() => {});
    }
  }, [canView, loadWorkOrders, loadDevices]);

  const deviceList = Array.isArray(devices) ? devices : (devices?.rows || []);
  const todaysTasks = Array.isArray(workOrders) ? workOrders : (workOrders?.rows || []);

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Access Revoked</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Your administrator has revoked your permission (<strong>technician.dashboard.view</strong>) to view the Technician dashboard.
        </p>
      </div>
    );
  }

  const kpis = useMemo(() => {
    const list = deviceList;
    const onlineDevices = list.filter((d) => (d.status || '').toLowerCase() === 'online').length;
    const offlineDevices = list.filter((d) => (d.status || '').toLowerCase() === 'offline').length;
    return {
      onlineDevices,
      offlineDevices,
      brokenWithIssues: Math.max(list.length - onlineDevices - offlineDevices, 0),
      totalDevices: list.length,
    };
  }, [deviceList]);

  const profile = {
    name: user?.name ?? '—',
    role: typeof user?.role === 'object' && user?.role !== null ? (user.role.name || user.role.code || 'Technician') : (user?.role ?? 'Technician'),
    depot: typeof user?.depot === 'object' && user?.depot !== null ? (user.depot.name || user.depot.code || '—') : (user?.depot ?? '—'),
    badgeId: user?.badgeId ?? user?.id ?? '—',
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'resolved':
      case 'closed':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'approved':
      case 'dispatched':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const quickActions = [
    {
      title: 'Field Work Orders',
      desc: 'View & resolve assigned depot tasks',
      path: '/technician/work-orders',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800',
      icon: <FleetIcons.Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      badge: `${todaysTasks.length} Assigned`,
    },
    {
      title: 'Display Devices',
      desc: 'View & manage all active display units',
      path: '/technician/devices',
      iconBg: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700',
      icon: <FleetIcons.Layers className="w-5 h-5 text-slate-600 dark:text-slate-400" />,
      badge: `${deviceList.length} Total`,
    },
    {
      title: 'Hardware Config',
      desc: 'Screen, network & power settings',
      path: deviceList[0]?.id ? `/technician/devices/${deviceList[0].id}/config` : '/technician/devices',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800',
      icon: <FleetIcons.Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      badge: 'Configure',
    },
    {
      title: 'GPS Installation',
      desc: 'Assign and wire GPS telematics units',
      path: '/technician/gps',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800',
      icon: <FleetIcons.Gps className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      badge: 'Install',
    },
    {
      title: 'Device Diagnostics',
      desc: 'Run real-time subsystem tests',
      path: '/technician/diagnostics',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/50 dark:border-purple-800',
      icon: <FleetIcons.Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      badge: 'Run Test',
    },
    {
      title: 'Hardware Status',
      desc: 'Live telemetry health & error codes',
      path: '/technician/hardware-status',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800',
      icon: <FleetIcons.Gauge className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      badge: 'Live Status',
    },
    {
      title: 'Connectivity Troubleshooting',
      desc: 'Test pings & remote reboot / reset',
      path: '/technician/connectivity',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:border-rose-800',
      icon: <FleetIcons.Speed className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      badge: 'Resolve',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Welcome, {profile.name}! 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {profile.role} · {profile.depot} · {profile.badgeId}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
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

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('technician.offline_devices', 'Offline Devices')}</span>
            <span className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
              <FleetIcons.Alert className="w-4 h-4 text-red-600 dark:text-red-400" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{kpis.offlineDevices}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
              {t('technician.needs_attention', 'Needs Attention')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-2">{kpis.offlineDevices} {kpis.offlineDevices === 1 ? 'unit requires' : 'units require'} field check</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('technician.online_devices', 'Online Devices')}</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{kpis.onlineDevices}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              {t('technician.all_active', 'All Active')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-2">{t('technician.transmitting', 'Transmitting live telemetry')}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('technician.broken_issues', 'Broken with Issues')}</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <FleetIcons.Settings className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{kpis.brokenWithIssues}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              {kpis.brokenWithIssues} {t('common.pending', 'Unrepaired')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-2">{t('technician.temp_faults', 'High temp & power faults')}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('common.devices', 'Total Devices')}</span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <FleetIcons.Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{kpis.totalDevices}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              {t('common.active', 'In Network')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-2">{t('dashboard.operating_depots', 'Registered across transit depots')}</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">{t('dashboard.quick_actions', 'Quick Actions')}</h2>
          <span className="text-xs text-slate-400 font-medium">Hardware Management Console</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.path}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl border transition-colors ${action.iconBg}`}>
                  {action.icon}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {action.badge}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{action.desc}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-blue-600">
                <span>Open Module</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's Tasks & Urgent Work Orders */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Assigned Tasks</h2>
            <p className="text-xs text-slate-500 font-medium">Field work orders dispatched by Organization Admin</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
              {todaysTasks.length} Active Tasks
            </span>
            <Link
              to="/technician/work-orders"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {todaysTasks.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">No assigned tasks</div>
          )}
          {todaysTasks.map((task) => (
            <div key={task.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900">{task.code ?? task.id ?? '—'}</span>
                  <span className="text-xs font-bold text-slate-800">• {task.issue_category ?? task.description ?? '—'}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(task.status)}`}>
                    {task.status ?? '—'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-medium flex items-center gap-3">
                  <span>Vehicle: <strong className="text-slate-800">{task.bus_number ?? '—'}</strong></span>
                  <span>Urgency: <strong className="text-slate-800">{task.urgency ?? '—'}</strong></span>
                  <span>Category: <strong className="text-slate-800">{task.issue_category ?? '—'}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link
                  to={`/technician/work-orders/${task.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span>Open Work Order</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
