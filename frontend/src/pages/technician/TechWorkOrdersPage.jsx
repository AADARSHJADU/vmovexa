import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import toast from 'react-hot-toast';

const STATUS_BADGES = {
  dispatched: {
    label: 'Dispatched to Depot',
    color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  on_site: {
    label: 'On Site Troubleshooting',
    color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500 animate-pulse',
  },
  resolved: {
    label: 'Resolved & Tested',
    color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  approved: {
    label: 'Approved for Dispatch',
    color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  submitted: {
    label: 'Pending Assignment',
    color: 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-semibold',
    dot: 'bg-amber-500 animate-ping',
  },
  closed: {
    label: 'Closed & Archived',
    color: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-700',
    dot: 'bg-slate-400',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
};

const URGENCY_BADGES = {
  critical: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 font-bold',
  high: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 font-semibold',
  normal: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  low: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
};

function formatSlaCountdown(slaDueAt, status) {
  const st = (status || '').toLowerCase();
  if (['resolved', 'closed', 'rejected'].includes(st)) {
    return {
      text: 'Resolved',
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    };
  }
  if (!slaDueAt) return null;
  const due = new Date(slaDueAt).getTime();
  if (isNaN(due)) return null;
  const now = Date.now();
  const diff = due - now;
  if (diff <= 0) {
    const overdueMins = Math.abs(Math.round(diff / (60 * 1000)));
    const h = Math.floor(overdueMins / 60);
    const m = overdueMins % 60;
    const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return {
      text: `⚠️ Overdue ${timeStr}`,
      color: 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-800 font-bold animate-pulse',
    };
  }
  const remMins = Math.round(diff / (60 * 1000));
  const h = Math.floor(remMins / 60);
  const m = remMins % 60;
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return {
    text: `⏳ ${timeStr} left`,
    color: diff < 3600 * 1000
      ? 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 font-bold'
      : 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  };
}

export const TechWorkOrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    workOrders,
    workOrdersPagination,
    status: loadingStatus,
    actionLoading,
    loadWorkOrders,
    setWorkOrderStatus,
  } = useTechnicianApp();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [urgencyFilter, setUrgencyFilter] = useState(searchParams.get('urgency') || 'all');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get('limit')) || 20);

  // Resolution Modal State
  const [resolvingOrder, setResolvingOrder] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [quickChecklist, setQuickChecklist] = useState({
    hardwareFixed: true,
    firmwareUpdated: false,
    diagnosticsPassed: true,
    telemetryVerified: true,
  });

  const fetchData = useCallback(() => {
    const params = {
      page,
      limit: pageSize,
    };
    if (activeTab && activeTab !== 'all') {
      params.status = activeTab;
    }
    if (urgencyFilter && urgencyFilter !== 'all') {
      params.urgency = urgencyFilter;
    }
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    loadWorkOrders(params).catch(() => {});
  }, [page, pageSize, activeTab, urgencyFilter, searchTerm, loadWorkOrders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync state with URL params
  useEffect(() => {
    const p = {};
    if (activeTab !== 'all') p.tab = activeTab;
    if (searchTerm) p.search = searchTerm;
    if (urgencyFilter !== 'all') p.urgency = urgencyFilter;
    if (page > 1) p.page = page;
    if (pageSize !== 20) p.limit = pageSize;
    setSearchParams(p, { replace: true });
  }, [activeTab, searchTerm, urgencyFilter, page, pageSize, setSearchParams]);

  const ordersList = useMemo(() => {
    return Array.isArray(workOrders) ? workOrders : [];
  }, [workOrders]);

  // KPI calculations
  const kpis = useMemo(() => {
    const total = ordersList.length;
    const dispatched = ordersList.filter((w) => (w.status || '').toLowerCase() === 'dispatched').length;
    const onSite = ordersList.filter((w) => (w.status || '').toLowerCase() === 'on_site').length;
    const resolved = ordersList.filter((w) => ['resolved', 'closed'].includes((w.status || '').toLowerCase())).length;

    let overdue = 0;
    const now = Date.now();
    ordersList.forEach((w) => {
      const st = (w.status || '').toLowerCase();
      if (!['resolved', 'closed', 'rejected'].includes(st) && w.sla_due_at) {
        if (new Date(w.sla_due_at).getTime() < now) {
          overdue++;
        }
      }
    });

    return { total, dispatched, onSite, resolved, overdue };
  }, [ordersList]);

  // Filter tabs definition
  const tabs = [
    { id: 'all', label: 'All Jobs', count: ordersList.length },
    { id: 'dispatched', label: 'Dispatched', count: kpis.dispatched },
    { id: 'on_site', label: 'On-Site / Active', count: kpis.onSite },
    { id: 'resolved', label: 'Resolved', count: kpis.resolved },
  ];

  // Quick Action: Mark On-Site
  const handleMarkOnSite = async (e, order) => {
    e.stopPropagation();
    try {
      await toast.promise(
        setWorkOrderStatus(order.id, 'on_site'),
        {
          loading: `Marking arrival on ${order.code}...`,
          success: `Arrived on-site for Bus ${order.bus_number || order.code}!`,
          error: (err) => err?.message || 'Failed to update status',
        }
      );
      fetchData();
    } catch (_) {}
  };

  // Open Resolution Modal
  const handleOpenResolveModal = (e, order) => {
    e.stopPropagation();
    setResolvingOrder(order);
    setResolutionNotes('');
    setQuickChecklist({
      hardwareFixed: true,
      firmwareUpdated: false,
      diagnosticsPassed: true,
      telemetryVerified: true,
    });
  };

  // Submit Resolution
  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!resolvingOrder) return;
    if (!resolutionNotes.trim()) {
      toast.error('Please enter resolution notes describing what fix was applied.');
      return;
    }

    const checks = [];
    if (quickChecklist.hardwareFixed) checks.push('Hardware Inspected/Repaired');
    if (quickChecklist.firmwareUpdated) checks.push('Firmware/Config Updated');
    if (quickChecklist.diagnosticsPassed) checks.push('Diagnostics Self-Test Passed');
    if (quickChecklist.telemetryVerified) checks.push('Live Telemetry Verified');

    const fullNotes = `${resolutionNotes.trim()}${checks.length > 0 ? `\n[Checklist: ${checks.join(', ')}]` : ''}`;

    try {
      await toast.promise(
        setWorkOrderStatus(resolvingOrder.id, 'resolved', fullNotes),
        {
          loading: `Submitting resolution for ${resolvingOrder.code}...`,
          success: `Work order ${resolvingOrder.code} marked resolved successfully!`,
          error: (err) => err?.message || 'Failed to resolve work order',
        }
      );
      setResolvingOrder(null);
      fetchData();
    } catch (_) {}
  };

  const isLoading = loadingStatus === 'loading';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Technician', path: '/technician/dashboard' },
              { label: 'Work Orders' },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Field Work Orders
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {kpis.total} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Assigned hardware repair, telematics & installation dispatches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton
            onClick={fetchData}
            loading={isLoading}
          />
          <Link
            to="/technician/diagnostics"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/20 transition-colors"
          >
            <FleetIcons.Target className="w-4 h-4 text-white" />
            <span>Run Diagnostics</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Total Assigned
            </span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <FleetIcons.Ticket className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {kpis.total}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-1">
            Lifetime dispatched
          </p>
        </div>

        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Dispatched
            </span>
            <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <FleetIcons.Tracking className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {kpis.dispatched}
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
            En route to depot
          </p>
        </div>

        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              On Site
            </span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {kpis.onSite}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
            Troubleshooting now
          </p>
        </div>

        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Resolved
            </span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {kpis.resolved}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Completed & tested
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              SLA Overdue
            </span>
            <span className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800">
              <FleetIcons.Alert className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-red-600 dark:text-red-400">
            {kpis.overdue}
          </div>
          <p className="text-[11px] text-red-500 font-medium mt-1">
            {kpis.overdue > 0 ? 'Urgent attention required' : 'All SLAs on track'}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Bus #, Depot, Ticket ID, or Issue..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={urgencyFilter}
              onChange={(e) => {
                setUrgencyFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Urgencies</option>
              <option value="critical">Critical Urgency</option>
              <option value="high">High Urgency</option>
              <option value="normal">Normal Urgency</option>
              <option value="low">Low Urgency</option>
            </select>

            {(searchTerm || urgencyFilter !== 'all' || activeTab !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setUrgencyFilter('all');
                  setActiveTab('all');
                  setPage(1);
                }}
                className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Work Orders List & Cards */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading && ordersList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Loading your assigned work orders...
            </p>
          </div>
        ) : ordersList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-xl">
              📋
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Work Orders Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              {searchTerm || urgencyFilter !== 'all' || activeTab !== 'all'
                ? 'No assigned work orders match your search and filter criteria.'
                : 'You currently have no field work orders assigned. When a dispatcher assigns a job to you, it will appear here.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {ordersList.map((order) => {
              const statusCfg = STATUS_BADGES[order.status] || {
                label: order.status,
                color: 'bg-slate-100 text-slate-700 border-slate-200',
                dot: 'bg-slate-400',
              };
              const urgencyCls = URGENCY_BADGES[order.urgency] || URGENCY_BADGES.normal;
              const slaBadge = formatSlaCountdown(order.sla_due_at, order.status);

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/technician/work-orders/${order.id}`)}
                  className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left Column: Code, Issue, Bus, Depot */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400 group-hover:underline">
                        {order.code}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                        <span>{statusCfg.label}</span>
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${urgencyCls}`}
                      >
                        {order.urgency || 'normal'}
                      </span>

                      {slaBadge && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${slaBadge.color}`}
                        >
                          {slaBadge.text}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {order.issue_category || 'Hardware Diagnostic Request'}
                      </h4>
                      {order.description && (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                          {order.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      <div className="flex items-center gap-1">
                        <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-500" />
                        <span>
                          Bus:{' '}
                          <strong className="text-slate-800 dark:text-zinc-200">
                            {order.bus_number || 'Unassigned'}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-amber-500 text-xs">📍</span>
                        <span>
                          Depot:{' '}
                          <strong className="text-slate-800 dark:text-zinc-200">
                            {order.depot_name || order.depot?.name || 'Main Transit Yard'}
                          </strong>
                        </span>
                      </div>

                      {order.organization?.name && (
                        <div className="flex items-center gap-1">
                          <FleetIcons.Fleets className="w-3.5 h-3.5 text-purple-500" />
                          <span>
                            Org:{' '}
                            <strong className="text-slate-800 dark:text-zinc-200">
                              {order.organization.name}
                            </strong>
                          </span>
                        </div>
                      )}

                      {order.eta && (
                        <div className="flex items-center gap-1">
                          <FleetIcons.Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>
                            ETA:{' '}
                            <strong className="text-slate-800 dark:text-zinc-200">
                              {order.eta}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Quick Status Action Buttons */}
                  <div
                    className="flex items-center gap-2 self-start lg:self-center shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {order.status === 'dispatched' && (
                      <button
                        onClick={(e) => handleMarkOnSite(e, order)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <span>📍</span>
                        <span>Mark On-Site</span>
                      </button>
                    )}

                    {order.status === 'on_site' && (
                      <button
                        onClick={(e) => handleOpenResolveModal(e, order)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <span>✅</span>
                        <span>Resolve Job</span>
                      </button>
                    )}

                    <Link
                      to={`/technician/work-orders/${order.id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Details</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Pagination Component */}
        {workOrdersPagination && workOrdersPagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
            <Pagination
              currentPage={page}
              totalPages={workOrdersPagination.totalPages}
              onPageChange={setPage}
              totalItems={workOrdersPagination.total}
              pageSize={pageSize}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          </div>
        )}
      </div>

      {/* Resolution Notes Modal */}
      {resolvingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  ✅
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Complete & Resolve Work Order
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    {resolvingOrder.code} · Bus {resolvingOrder.bus_number || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResolvingOrder(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Resolution Notes & Fix Applied <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="E.g., Replaced damaged power adapter on RK3588 display unit. Reconnected HDMI harness. Verified live telematics ping and HDMI output OK at depot gate."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Service Completion Checklist */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Verification Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickChecklist.hardwareFixed}
                      onChange={(e) =>
                        setQuickChecklist((prev) => ({ ...prev, hardwareFixed: e.target.checked }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      Hardware Repaired
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickChecklist.diagnosticsPassed}
                      onChange={(e) =>
                        setQuickChecklist((prev) => ({ ...prev, diagnosticsPassed: e.target.checked }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      Self-Test Passed
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickChecklist.telemetryVerified}
                      onChange={(e) =>
                        setQuickChecklist((prev) => ({ ...prev, telemetryVerified: e.target.checked }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      Live GPS Verified
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickChecklist.firmwareUpdated}
                      onChange={(e) =>
                        setQuickChecklist((prev) => ({ ...prev, firmwareUpdated: e.target.checked }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      Firmware / Config
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setResolvingOrder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Resolution</span>
                      <span>✓</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechWorkOrdersPage;
