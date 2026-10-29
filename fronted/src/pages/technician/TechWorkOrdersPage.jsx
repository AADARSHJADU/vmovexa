import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { ActionDropdown } from '../../components/ui/ActionDropdown';
import toast from 'react-hot-toast';

const STATUS_BADGES = {
  dispatched: {
    label: 'Dispatched',
    color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  on_site: {
    label: 'On-Site',
    color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500 animate-pulse',
  },
  resolved: {
    label: 'Resolved',
    color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  approved: {
    label: 'Approved',
    color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  submitted: {
    label: 'Pending',
    color: 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-semibold',
    dot: 'bg-amber-500 animate-ping',
  },
  closed: {
    label: 'Closed',
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

function formatSlaInfo(slaDueAt, status) {
  const st = (status || '').toLowerCase();
  if (['resolved', 'closed', 'rejected'].includes(st)) {
    return {
      type: 'resolved',
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
      type: 'overdue',
      text: `Overdue by ${timeStr}`,
      color: 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-800 font-bold animate-pulse',
    };
  }
  const remMins = Math.round(diff / (60 * 1000));
  const h = Math.floor(remMins / 60);
  const m = remMins % 60;
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return {
    type: 'pending',
    text: `${timeStr} left`,
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
  const [snapshotTime] = useState(() => Date.now());

  // View Mode: 'table' or 'card'
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('tech_wo_view_mode') || 'table');

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('tech_wo_view_mode', mode);
    } catch {
      // Local storage can be unavailable in private/restricted browsers.
    }
  };

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
    ordersList.forEach((w) => {
      const st = (w.status || '').toLowerCase();
      if (!['resolved', 'closed', 'rejected'].includes(st) && w.sla_due_at) {
        if (new Date(w.sla_due_at).getTime() < snapshotTime) {
          overdue++;
        }
      }
    });

    return { total, dispatched, onSite, resolved, overdue };
  }, [ordersList, snapshotTime]);

  // Pagination calculation
  const isBackendPaginated = Boolean(workOrdersPagination && workOrdersPagination.totalPages);
  const totalPages = isBackendPaginated
    ? workOrdersPagination.totalPages
    : Math.max(1, Math.ceil(ordersList.length / pageSize));
  const totalItems = isBackendPaginated
    ? (workOrdersPagination.total ?? ordersList.length)
    : ordersList.length;

  const displayedOrders = useMemo(() => {
    if (isBackendPaginated) {
      return ordersList;
    }
    const startIndex = (page - 1) * pageSize;
    return ordersList.slice(startIndex, startIndex + pageSize);
  }, [ordersList, isBackendPaginated, page, pageSize]);

  // Filter tabs definition
  const tabs = [
    { id: 'all', label: 'All Orders', count: ordersList.length },
    { id: 'dispatched', label: 'Dispatched', count: kpis.dispatched },
    { id: 'on_site', label: 'On-Site', count: kpis.onSite },
    { id: 'resolved', label: 'Resolved', count: kpis.resolved },
  ];

  // Quick Action: {t('technician.work_orders.mark_on_site')}
  const handleMarkOnSite = async (e, order) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      await toast.promise(
        setWorkOrderStatus(order.id, 'on_site'),
        {
          loading: `Marking arrival on ${order.code}...`,
          success: `Arrived on-site for Vehicle ${order.bus_number || order.code}!`,
          error: (err) => err?.message || 'Failed to update status',
        }
      );
      fetchData();
    } catch {
      // toast.promise displays the API error.
    }
  };

  // Open Resolution Modal
  const handleOpenResolveModal = (e, order) => {
    if (e && e.stopPropagation) e.stopPropagation();
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
      toast.error('Please enter resolution notes describing the fix applied.');
      return;
    }

    const checks = [];
    if (quickChecklist.hardwareFixed) checks.push('Hardware Repaired');
    if (quickChecklist.firmwareUpdated) checks.push('Firmware Updated');
    if (quickChecklist.diagnosticsPassed) checks.push('Self-Test Passed');
    if (quickChecklist.telemetryVerified) checks.push('GPS Verified');

    const fullNotes = `${resolutionNotes.trim()}${checks.length > 0 ? `\n[Checklist: ${checks.join(', ')}]` : ''}`;

    try {
      await toast.promise(
        setWorkOrderStatus(resolvingOrder.id, 'resolved', fullNotes),
        {
          loading: `Submitting resolution for ${resolvingOrder.code}...`,
          success: `Work order ${resolvingOrder.code} resolved successfully!`,
          error: (err) => err?.message || 'Failed to resolve work order',
        }
      );
      setResolvingOrder(null);
      fetchData();
    } catch {
      // toast.promise displays the API error.
    }
  };

  const isLoading = loadingStatus === 'loading';
  const isSuperAdmin = window.location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/technician' : '/technician';

  // Construct ActionDropdown items for each work order
  const getOrderDropdownItems = (order) => {
    const canMarkOnSite = ['dispatched', 'submitted', 'approved'].includes((order.status || '').toLowerCase());
    const canResolve = !['resolved', 'closed', 'rejected'].includes((order.status || '').toLowerCase());

    const items = [
      {
        label: `${t('common.view')} ${t('common.details')}`,
        icon: <FleetIcons.Eye className="w-4 h-4 text-blue-500" />,
        onClick: () => navigate(`${basePath}/work-orders/${order.id}`),
      },
    ];

    if (canMarkOnSite) {
      items.push({
        label: 'Mark On-Site',
        icon: <FleetIcons.Pin className="w-4 h-4 text-amber-500" />,
        onClick: () => handleMarkOnSite(null, order),
      });
    }

    if (canResolve) {
      items.push({
        label: 'Resolve Order',
        icon: <FleetIcons.Check className="w-4 h-4 text-emerald-500" />,
        onClick: () => handleOpenResolveModal(null, order),
      });
    }

    return items;
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: isSuperAdmin ? 'Super Admin' : 'Technician', path: isSuperAdmin ? '/superadmin/dashboard' : '/technician/dashboard' },
              ...(isSuperAdmin ? [{ label: 'Technician', path: '/superadmin/technician/work-orders' }] : []),
              { label: 'Work Orders' },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Work Orders
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {kpis.total} {t('common.total')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Manage assigned repair requests and maintenance tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton
            onClick={fetchData}
            loading={isLoading}
          />
          <Link
            to={`${basePath}/diagnostics`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/20 transition-colors"
          >
            <FleetIcons.Target className="w-4 h-4 text-white" />
            <span>{t('technician.work_orders.diagnostics')}</span>
          </Link>
        </div>
      </div>

      {/* Simplified KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab('all');
            setPage(1);
          }}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-500 ring-1 ring-blue-500/20'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('common.total')}</span>
            <FleetIcons.Ticket className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {kpis.total}
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('dispatched');
            setPage(1);
          }}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'dispatched'
              ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-500 ring-1 ring-indigo-500/20'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('technician.work_orders.dispatched')}</span>
            <FleetIcons.Tracking className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {kpis.dispatched}
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('on_site');
            setPage(1);
          }}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'on_site'
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-500 ring-1 ring-amber-500/20'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('technician.work_orders.on_site')}</span>
            <FleetIcons.Pin className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {kpis.onSite}
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('resolved');
            setPage(1);
          }}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'resolved'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500/20'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('common.resolved')}</span>
            <FleetIcons.Check className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {kpis.resolved}
          </div>
        </button>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('technician.work_orders.sla_overdue')}</span>
            <FleetIcons.Alert className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
            {kpis.overdue}
          </div>
        </div>
      </div>

      {/* Filter Tabs, Search & View Toggle */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-4">
        {/* Status Tabs */}
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

        {/* Search, Filter & View Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <FleetIcons.Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder={t('technician.work_orders.search_ph')}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <FleetIcons.Close className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={urgencyFilter}
              onChange={(e) => {
                setUrgencyFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">{t('technician.work_orders.all_priorities')}</option>
              <option value="critical">{t('common.critical')}</option>
              <option value="high">{t('common.high')}</option>
              <option value="normal">{t('common.normal')}</option>
              <option value="low">{t('common.low')}</option>
            </select>

            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              tableValue="table"
              cardValue="card"
            />

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

      {/* Work Orders List: Table or Cards View */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading && displayedOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Loading work orders...
            </p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <FleetIcons.Ticket className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Work Orders Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              {searchTerm || urgencyFilter !== 'all' || activeTab !== 'all'
                ? 'No work orders match your search and filter criteria.'
                : 'No work orders have been assigned to you yet.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW - Fully responsive, cleanly budgeted columns */
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs table-auto">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 whitespace-nowrap">{t('technician.work_orders.ticket_col')}</th>
                  <th className="py-3 px-3 whitespace-nowrap">{t('technician.work_orders.vehicle_depot')}</th>
                  <th className="py-3 px-3">{t('technician.work_orders.issue_desc')}</th>
                  <th className="py-3 px-2.5 whitespace-nowrap">{t('common.priority')}</th>
                  <th className="py-3 px-2.5 whitespace-nowrap">{t('technician.work_orders.sla_due')}</th>
                  <th className="py-3 px-2.5 whitespace-nowrap">{t('common.status')}</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-700 dark:text-zinc-300">
                {displayedOrders.map((order) => {
                  const statusCfg = STATUS_BADGES[order.status] || {
                    label: order.status,
                    color: 'bg-slate-100 text-slate-700 border-slate-200',
                    dot: 'bg-slate-400',
                  };
                  const urgencyCls = URGENCY_BADGES[order.urgency] || URGENCY_BADGES.normal;
                  const sla = formatSlaInfo(order.sla_due_at, order.status);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`${basePath}/work-orders/${order.id}`)}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                    >
                      {/* Code */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                          {order.code}
                        </span>
                        {order.created_at && (
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Vehicle & Depot */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{order.bus_number || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          <FleetIcons.Pin className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate max-w-[130px]">
                            {order.depot_name || order.depot?.name || 'Main Depot'}
                          </span>
                        </div>
                      </td>

                      {/* Issue & Description with strict truncation & overflow safety */}
                      <td className="py-3 px-3 min-w-0 max-w-[200px] sm:max-w-[260px]">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {order.issue_category || 'Hardware Diagnostic Request'}
                        </div>
                        {order.description && (
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate break-all mt-0.5">
                            {order.description}
                          </div>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${urgencyCls}`}>
                          {order.urgency || 'normal'}
                        </span>
                      </td>

                      {/* SLA */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        {sla ? (
                          <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${sla.color}`}>
                            {sla.type === 'overdue' ? (
                              <FleetIcons.Alert className="w-3 h-3 text-red-500 shrink-0" />
                            ) : sla.type === 'resolved' ? (
                              <FleetIcons.Check className="w-3 h-3 text-emerald-500 shrink-0" />
                            ) : (
                              <FleetIcons.Clock className="w-3 h-3 text-blue-500 shrink-0" />
                            )}
                            <span>{sla.text}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                          <span>{statusCfg.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {order.status === 'dispatched' && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkOnSite(e, order)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-xs transition-colors"
                            >
                              <FleetIcons.Pin className="w-3 h-3 text-white" />
                              <span>{t('technician.work_orders.on_site')}</span>
                            </button>
                          )}

                          {order.status === 'on_site' && (
                            <button
                              type="button"
                              onClick={(e) => handleOpenResolveModal(e, order)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                            >
                              <FleetIcons.Check className="w-3 h-3 text-white" />
                              <span>{t('technician.work_orders.resolve_btn')}</span>
                            </button>
                          )}

                          <ActionDropdown
                            items={getOrderDropdownItems(order)}
                            menuWidth="w-44"
                            align="right"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARD VIEW */
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedOrders.map((order) => {
                const statusCfg = STATUS_BADGES[order.status] || {
                  label: order.status,
                  color: 'bg-slate-100 text-slate-700 border-slate-200',
                  dot: 'bg-slate-400',
                };
                const urgencyCls = URGENCY_BADGES[order.urgency] || URGENCY_BADGES.normal;
                const sla = formatSlaInfo(order.sla_due_at, order.status);

                return (
                  <div
                    key={order.id}
                    onClick={() => navigate(`${basePath}/work-orders/${order.id}`)}
                    className="bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3 min-w-0">
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                          {order.code}
                        </span>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                            <span>{statusCfg.label}</span>
                          </span>
                          <ActionDropdown
                            items={getOrderDropdownItems(order)}
                            menuWidth="w-44"
                            align="right"
                          />
                        </div>
                      </div>

                      {/* Issue Category & Description */}
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {order.issue_category || 'Hardware Diagnostic Request'}
                        </h4>
                        {order.description && (
                          <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 break-all mt-1">
                            {order.description}
                          </p>
                        )}
                      </div>

                      {/* Details Pills (Vehicle, Depot, Priority, SLA) */}
                      <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-zinc-800 text-xs">
                        <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                          <div className="flex items-center gap-1.5 truncate">
                            <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{t('common.vehicle')}:</span>
                            <strong className="text-slate-900 dark:text-white truncate">
                              {order.bus_number || 'Unassigned'}
                            </strong>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border shrink-0 ${urgencyCls}`}>
                            {order.urgency || 'normal'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                          <FleetIcons.Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">
                            {order.depot_name || order.depot?.name || 'Main Depot'}
                          </span>
                        </div>

                        {sla && (
                          <div className="pt-0.5">
                            <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${sla.color}`}>
                              {sla.type === 'overdue' ? (
                                <FleetIcons.Alert className="w-3 h-3 text-red-500 shrink-0" />
                              ) : sla.type === 'resolved' ? (
                                <FleetIcons.Check className="w-3 h-3 text-emerald-500 shrink-0" />
                              ) : (
                                <FleetIcons.Clock className="w-3 h-3 text-blue-500 shrink-0" />
                              )}
                              <span>{sla.text}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div
                      className="mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        {order.status === 'dispatched' && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkOnSite(e, order)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
                          >
                            <FleetIcons.Pin className="w-3.5 h-3.5 text-white" />
                            <span>{t('technician.work_orders.mark_on_site')}</span>
                          </button>
                        )}

                        {order.status === 'on_site' && (
                          <button
                            type="button"
                            onClick={(e) => handleOpenResolveModal(e, order)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                          >
                            <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                            <span>{t('technician.work_orders.resolve_btn')}</span>
                          </button>
                        )}
                      </div>

                      <Link
                        to={`${basePath}/work-orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200/70 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-colors ml-auto"
                      >
                        <span>{t('common.details')}</span>
                        <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Pagination Component */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Resolve Work Order
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    {resolvingOrder.code} · Vehicle {resolvingOrder.bus_number || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResolvingOrder(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-lg"
              >
                <FleetIcons.Close className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Resolution Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder={t('technician.work_orders.repair_ph')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Service Completion Checklist */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Verification Checks
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickChecklist.hardwareFixed}
                      onChange={(e) =>
                        setQuickChecklist((prev) => ({ ...prev, hardwareFixed: e.target.checked }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      Hardware Fixed
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 cursor-pointer">
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

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 cursor-pointer">
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

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickChecklist.firmwareUpdated}
                      onChange={(e) =>
                        setQuickChecklist((prev) => ({ ...prev, firmwareUpdated: e.target.checked }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      Firmware Updated
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
                      <span>{t('common.submitting')}</span>
                    </>
                  ) : (
                    <>
                      <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                      <span>{t('technician.work_orders.confirm_resolve')}</span>
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
