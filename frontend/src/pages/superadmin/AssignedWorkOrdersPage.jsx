import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperTechnician } from '../../hooks/superadmin/useSuperTechnician';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
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

const SLA_PRESETS = [
  { hours: 2, label: '2 Hours (Emergency Grounded Bus)' },
  { hours: 4, label: '4 Hours (Critical Display / GPS Fault)' },
  { hours: 24, label: '24 Hours (Standard Maintenance)' },
  { hours: 48, label: '48 Hours (New Bus Provisioning)' },
];

function formatSlaCountdown(slaDueAt, status) {
  const st = (status || '').toLowerCase();
  if (['resolved', 'closed', 'rejected'].includes(st)) {
    return { text: 'Resolved', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' };
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

export const AssignedWorkOrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    workOrders,
    workOrdersStatus,
    loadWorkOrders,
    centralTechnicians,
    loadCentralTechnicians,
    assignWorkOrder,
    updateWorkOrderStatus,
    rejectWorkOrder,
    loadWorkOrderDetail,
  } = useSuperTechnician();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'All';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [refreshing, setRefreshing] = useState(false);

  const autoOpenedRef = useRef(false);

  // Modals & Drawer State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignOrder, setAssignOrder] = useState(null);
  const [assignTechId, setAssignTechId] = useState('');
  const [assignSlaHours, setAssignSlaHours] = useState('4');
  const [assignEta, setAssignEta] = useState('Within 2 hours');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveOrder, setResolveOrder] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolveSubmitting, setResolveSubmitting] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // 3-Dot Kebab Action Menu State
  const [openActionDropdownId, setOpenActionDropdownId] = useState(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest('[data-kebab-menu]')) {
        setOpenActionDropdownId(null);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpenActionDropdownId(null);
    };
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    loadWorkOrders().catch(() => {});
    loadCentralTechnicians().catch(() => {});
  }, [loadWorkOrders, loadCentralTechnicians]);

  // Sync tab & tech filter with URL query params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['All', 'pending', 'dispatched', 'on_site', 'resolved', 'critical'].includes(tab)) {
      setActiveTab(tab);
    }
    const techId = searchParams.get('techId');
    if (techId && centralTechnicians?.length > 0) {
      const matchedTech = centralTechnicians.find((t) => String(t.id) === String(techId));
      if (matchedTech) {
        setSearchQuery(matchedTech.name || '');
      }
    }
  }, [searchParams, centralTechnicians]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadWorkOrders(), loadCentralTechnicians()]);
      toast.success('Work orders refreshed!');
    } catch {
      toast.error('Failed to refresh work orders.');
    } finally {
      setRefreshing(false);
    }
  };

  const ordersList = useMemo(() => {
    return Array.isArray(workOrders) ? workOrders : [];
  }, [workOrders]);

  const techsList = useMemo(() => {
    return Array.isArray(centralTechnicians) ? centralTechnicians : [];
  }, [centralTechnicians]);

  // Compute technician workload: is technician busy with an active job?
  const getTechnicianWorkload = (techId) => {
    if (!techId) return { isBusy: false, activeJobs: [], currentJob: null };
    const activeJobs = ordersList.filter((wo) =>
      Number(wo.assigned_technician_id) === Number(techId) &&
      ['dispatched', 'on_site'].includes((wo.status || '').toLowerCase())
    );
    return {
      isBusy: activeJobs.length > 0,
      activeJobs,
      currentJob: activeJobs[0] || null,
    };
  };

  // Tab filters
  const pendingCount = ordersList.filter((o) => {
    const st = (o.status || '').toLowerCase();
    return st === 'submitted' || !o.assigned_technician_id;
  }).length;

  const filterTabs = [
    { key: 'All', label: 'All Orders', count: ordersList.length },
    { key: 'pending', label: 'Pending Requests', count: pendingCount, highlight: pendingCount > 0 },
    { key: 'dispatched', label: 'Dispatched', count: ordersList.filter((o) => (o.status || '').toLowerCase() === 'dispatched').length },
    { key: 'on_site', label: 'On Site', count: ordersList.filter((o) => (o.status || '').toLowerCase() === 'on_site').length },
    { key: 'resolved', label: 'Resolved', count: ordersList.filter((o) => ['resolved', 'closed'].includes((o.status || '').toLowerCase())).length },
    { key: 'critical', label: 'Critical / High', count: ordersList.filter((o) => ['critical', 'high'].includes((o.urgency || '').toLowerCase())).length },
  ];

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ordersList.filter((wo) => {
      const code = String(wo.code || '').toLowerCase();
      const bus = String(wo.bus_number || wo.busNumber || '').toLowerCase();
      const issue = String(wo.issue_category || wo.issueCategory || '').toLowerCase();
      const org = String(wo.organization?.name || '').toLowerCase();
      const tech = String(wo.technician?.name || '').toLowerCase();
      const depot = String(wo.depot_name || wo.depotName || wo.depot?.name || '').toLowerCase();

      const matchesSearch = !q || code.includes(q) || bus.includes(q) || issue.includes(q) || org.includes(q) || tech.includes(q) || depot.includes(q);
      if (!matchesSearch) return false;

      const st = (wo.status || '').toLowerCase();
      const urg = (wo.urgency || '').toLowerCase();
      if (activeTab === 'All') return true;
      if (activeTab === 'pending') return st === 'submitted' || !wo.assigned_technician_id;
      if (activeTab === 'dispatched') return st === 'dispatched';
      if (activeTab === 'on_site') return st === 'on_site';
      if (activeTab === 'resolved') return st === 'resolved' || st === 'closed';
      if (activeTab === 'critical') return urg === 'critical' || urg === 'high';
      return true;
    });
  }, [ordersList, searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Open Assign Modal
  const openAssignModal = (order) => {
    setAssignOrder(order);
    setAssignTechId(order.assigned_technician_id ? String(order.assigned_technician_id) : '');
    setAssignSlaHours('4');
    setAssignEta(order.eta || 'Within 2 hours');
    setAssignInstructions(order.instructions || order.description || '');
    setAssignModalOpen(true);
  };

  // Submit Assignment
  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!assignTechId) {
      toast.error('Please select a technician.');
      return;
    }
    setAssignSubmitting(true);
    try {
      await assignWorkOrder(assignOrder.id, {
        technicianId: Number(assignTechId),
        slaHours: Number(assignSlaHours),
        eta: assignEta,
        instructions: assignInstructions,
      });
      toast.success(`Technician successfully dispatched for ${assignOrder.code}!`);
      setAssignModalOpen(false);
      loadWorkOrders().catch(() => {});
    } catch (err) {
      toast.error(err?.message || 'Failed to assign technician.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Open Resolve Modal
  const openResolveModal = (order) => {
    setResolveOrder(order);
    setResolutionNotes(order.resolution_notes || 'Diagnosed and fixed issue. Systems tested and nominal.');
    setResolveModalOpen(true);
  };

  // Submit Resolution
  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    setResolveSubmitting(true);
    try {
      await updateWorkOrderStatus(resolveOrder.id, 'resolved', resolutionNotes);
      toast.success(`Work order ${resolveOrder.code} marked resolved!`);
      setResolveModalOpen(false);
      loadWorkOrders().catch(() => {});
    } catch (err) {
      toast.error(err?.message || 'Failed to update work order.');
    } finally {
      setResolveSubmitting(false);
    }
  };

  // Open Reject Modal
  const openRejectModal = (order) => {
    setRejectOrder(order);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  // Submit Rejection
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    setRejectSubmitting(true);
    try {
      await rejectWorkOrder(rejectOrder.id, rejectReason);
      toast.success(`Work order ${rejectOrder.code} rejected.`);
      setRejectModalOpen(false);
      loadWorkOrders().catch(() => {});
    } catch (err) {
      toast.error(err?.message || 'Failed to reject work order.');
    } finally {
      setRejectSubmitting(false);
    }
  };

  // Auto-redirect to dedicated detail page or assign route if query params specify orderId
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      if (searchParams.get('assign') === 'true' && ordersList?.length > 0) {
        const matchedOrder = ordersList.find((o) => String(o.id) === String(orderId) || String(o.code) === String(orderId));
        if (matchedOrder) {
          navigate(`/superadmin/technicians/assign/${matchedOrder.id}/assign`);
          return;
        }
      }
      navigate(`/superadmin/technicians/assign/${orderId}`);
    }
  }, [searchParams, ordersList, navigate]);

  // Summary KPIs
  const totalOrders = ordersList.length;
  const activeDispatches = ordersList.filter((o) => ['dispatched', 'approved'].includes((o.status || '').toLowerCase())).length;
  const onSiteInterventions = ordersList.filter((o) => (o.status || '').toLowerCase() === 'on_site').length;
  const resolvedOrders = ordersList.filter((o) => ['resolved', 'closed'].includes((o.status || '').toLowerCase())).length;

  const selectedTechWorkload = assignTechId ? getTechnicianWorkload(assignTechId) : null;

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Breadcrumb Navigation Banner */}
      <div className="w-full p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 flex-wrap">
          <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <FleetIcons.Dashboard className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </Link>
          <span className="text-slate-300 dark:text-zinc-600">/</span>
          <Link to="/superadmin/technicians" className="text-blue-600 dark:text-blue-400 hover:underline">
            Central Technicians
          </Link>
          <span className="text-slate-300 dark:text-zinc-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">Work Orders & Assignments</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 flex-wrap">
              <span>{t('technician.work_orders_title', 'Central Technician Work Orders & Dispatches')}</span>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                  {pendingCount} Pending
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">
              {t('technician.work_orders_sub', 'Review tenant repair requests, dispatch central technicians with live busy status radar, and track resolution timelines.')}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <RefreshButton
              onClick={handleRefresh}
              loading={refreshing || workOrdersStatus === 'loading'}
              title="Refresh work orders"
            />

            <Link
              to="/superadmin/technicians/assign/new"
              className="px-4 py-2.5 bg-gradient-to-r from-[#1C68FD] via-indigo-600 to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 hover:shadow-lg hover:shadow-[#DA29F4]/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial text-center"
            >
              <FleetIcons.Plus className="w-4 h-4 shrink-0" />
              <span>Initiate New Dispatch</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 4 Stat KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Total Work Orders
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalOrders}
          </div>
        </div>

        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>Pending Action</span>
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>}
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingCount}
          </div>
        </div>

        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Dispatched / On Site
          </span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {activeDispatches + onSiteInterventions}
          </div>
        </div>

        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Resolved & Closed
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {resolvedOrders}
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                  : tab.highlight
                  ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : tab.highlight
                    ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-black'
                    : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Code, Bus, Depot, Tech..."
            className="w-full px-3.5 py-2 pl-9 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 4. Work Orders Table */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {workOrdersStatus === 'loading' && ordersList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Loading work orders & central pool dispatches...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <FleetIcons.Target className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Work Orders Found</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              {searchQuery
                ? `No assigned work orders match your search query "${searchQuery}".`
                : 'No work orders currently match this filter. Select another tab or initiate a new dispatch.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (responsive overflow wrapper) */}
            <div className="hidden lg:block overflow-x-auto min-h-[360px] pb-16">
              <table className="w-full min-w-[980px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <th className="py-3.5 px-4 whitespace-nowrap">Order Code & Date</th>
                    <th className="py-3.5 px-4 min-w-[150px]">Tenant & Depot</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Target Bus</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Issue Category</th>
                    <th className="py-3.5 px-4 min-w-[170px]">Assigned Engineer</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 text-right w-24 min-w-[90px] whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                  {paginatedOrders.map((wo, idx) => {
                    const statusKey = (wo.status || 'submitted').toLowerCase();
                    const statusCfg = STATUS_BADGES[statusKey] || STATUS_BADGES.submitted;
                    const urgencyKey = (wo.urgency || 'normal').toLowerCase();
                    const urgencyBadge = URGENCY_BADGES[urgencyKey] || URGENCY_BADGES.normal;
                    const bus = wo.bus_number || wo.busNumber || '—';
                    const depot = wo.depot_name || wo.depotName || wo.depot?.name || 'Main Depot';
                    const tech = wo.technician;
                    const org = wo.organization;
                    const dateStr = wo.created_at || wo.createdAt ? new Date(wo.created_at || wo.createdAt).toLocaleDateString() : 'Recent';
                    const slaCountdown = formatSlaCountdown(wo.sla_due_at, wo.status);
                    const techWorkload = tech?.id ? getTechnicianWorkload(tech.id) : null;

                    const isPending = statusKey === 'submitted' || !wo.assigned_technician_id;
                    const isDispatched = statusKey === 'dispatched' || statusKey === 'approved';
                    const isOnSite = statusKey === 'on_site';
                    const isResolved = statusKey === 'resolved' || statusKey === 'closed';

                    const isNearBottom = idx >= paginatedOrders.length - 2 && paginatedOrders.length > 2;

                    return (
                      <tr
                        key={wo.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        {/* Code & Date */}
                        <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                          <Link
                            to={`/superadmin/technicians/assign/${wo.id}`}
                            className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px] hover:underline"
                            title="View Details"
                          >
                            {wo.code || `WO-${wo.id}`}
                          </Link>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                            {dateStr}
                          </div>
                        </td>

                        {/* Tenant & Depot */}
                        <td className="py-3.5 px-4 min-w-[150px]">
                          <div className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]" title={org?.name || 'Fleet Operator'}>
                            {org?.name || 'Fleet Operator'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[180px]" title={depot}>
                            {depot}
                          </div>
                        </td>

                        {/* Target Bus */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700 shadow-2xs">
                            {bus}
                          </span>
                        </td>

                        {/* Issue Category */}
                        <td className="py-3.5 px-4 min-w-[160px]">
                          <div className="font-semibold text-slate-900 dark:text-white max-w-[180px] truncate" title={wo.issue_category || wo.issueCategory}>
                            {wo.issue_category || wo.issueCategory || 'Hardware Maintenance'}
                          </div>
                          {wo.description && (
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 max-w-[180px] truncate mt-0.5" title={wo.description}>
                              {wo.description}
                            </div>
                          )}
                        </td>

                        {/* Assigned Engineer & Busy Radar */}
                        <td className="py-3.5 px-4 min-w-[150px]">
                          {tech ? (
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                <span>{tech.name}</span>
                                {techWorkload?.isBusy ? (
                                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500" title={`Busy on ${techWorkload.currentJob?.bus_number || 'active job'}`}></span>
                                ) : (
                                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Available"></span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono truncate">
                                {tech.phone || tech.email || 'Central Pool'}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                              <span>Unassigned</span>
                            </span>
                          )}
                        </td>

                        {/* Status (Never wrapped, crisp capsule badge) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border whitespace-nowrap shadow-2xs ${statusCfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot}`}></span>
                            <span className="whitespace-nowrap">{statusCfg.label}</span>
                          </span>
                        </td>

                        {/* Actions: 3-Dot Kebab Menu + Quick View */}
                        <td className="py-3.5 px-4 text-right w-24 min-w-[90px] whitespace-nowrap relative">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick Details Eye Button */}
                            <Link
                              to={`/superadmin/technicians/assign/${wo.id}`}
                              className="p-1.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                              title="View Full Details & Audit Trail"
                            >
                              <FleetIcons.Eye className="w-3.5 h-3.5" />
                            </Link>

                            {/* 3-Dot Kebab Menu Dropdown */}
                            <div className="relative inline-block text-left" data-kebab-menu>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionDropdownId(openActionDropdownId === wo.id ? null : wo.id);
                                }}
                                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                                  openActionDropdownId === wo.id
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                    : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                                }`}
                                title="More Actions (Reassign, Done, Details)"
                                aria-label="More actions"
                              >
                                <span className="text-sm font-black leading-none pb-1 tracking-tighter">⋮</span>
                              </button>

                              {openActionDropdownId === wo.id && (
                                <div
                                  className={`absolute right-0 ${
                                    isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                  } w-52 rounded-2xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-zinc-700/80 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-zinc-800/80`}
                                >
                                  <div className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                    Work Order Actions
                                  </div>

                                  <div className="py-1">
                                    {/* Reassign / Assign Tech */}
                                    {!isResolved && statusKey !== 'rejected' && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenActionDropdownId(null);
                                          navigate(`/superadmin/technicians/assign/${wo.id}/assign`);
                                        }}
                                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <span className="text-sm">⚡</span>
                                        <span>{isPending ? 'Assign Technician' : 'Reassign Technician'}</span>
                                      </button>
                                    )}

                                    {/* Mark as Done / Resolved */}
                                    {(isDispatched || isOnSite) && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenActionDropdownId(null);
                                          openResolveModal(wo);
                                        }}
                                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <span className="text-sm font-black">✓</span>
                                        <span>Mark as Done</span>
                                      </button>
                                    )}

                                    {/* View Details */}
                                    <Link
                                      to={`/superadmin/technicians/assign/${wo.id}`}
                                      onClick={() => setOpenActionDropdownId(null)}
                                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <FleetIcons.Eye className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
                                      <span>View Details & Audit Trail</span>
                                    </Link>
                                  </div>

                                  {/* Reject Option (if pending) */}
                                  {isPending && (
                                    <div className="py-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenActionDropdownId(null);
                                          openRejectModal(wo);
                                        }}
                                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <span className="text-sm font-bold">✕</span>
                                        <span>Reject Request</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Card List View (hidden on lg, visible on mobile & tablet) */}
            <div className="lg:hidden divide-y divide-slate-100 dark:divide-zinc-800/80">
              {paginatedOrders.map((wo) => {
                const statusKey = (wo.status || 'submitted').toLowerCase();
                const statusCfg = STATUS_BADGES[statusKey] || STATUS_BADGES.submitted;
                const urgencyKey = (wo.urgency || 'normal').toLowerCase();
                const urgencyBadge = URGENCY_BADGES[urgencyKey] || URGENCY_BADGES.normal;
                const bus = wo.bus_number || wo.busNumber || '—';
                const depot = wo.depot_name || wo.depotName || wo.depot?.name || 'Main Depot';
                const tech = wo.technician;
                const org = wo.organization;
                const dateStr = wo.created_at || wo.createdAt ? new Date(wo.created_at || wo.createdAt).toLocaleDateString() : 'Recent';
                const slaCountdown = formatSlaCountdown(wo.sla_due_at, wo.status);
                const techWorkload = tech?.id ? getTechnicianWorkload(tech.id) : null;

                const isPending = statusKey === 'submitted' || !wo.assigned_technician_id;
                const isDispatched = statusKey === 'dispatched' || statusKey === 'approved';
                const isOnSite = statusKey === 'on_site';
                const isResolved = statusKey === 'resolved' || statusKey === 'closed';

                return (
                  <div key={wo.id} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                    {/* Top Row: Code, Date & Status / Urgency */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <Link
                          to={`/superadmin/technicians/assign/${wo.id}`}
                          className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm hover:underline inline-flex items-center gap-1"
                        >
                          <span>{wo.code || `WO-${wo.id}`}</span>
                          <span className="text-[11px] text-blue-400 dark:text-blue-500">↗</span>
                        </Link>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                          {dateStr}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border uppercase tracking-wider font-bold ${urgencyBadge}`}>
                          {wo.urgency || 'Normal'}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${statusCfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                          <span>{statusCfg.label}</span>
                        </span>

                        {/* 3-Dot Kebab Menu on Mobile Card */}
                        <div className="relative inline-block text-left" data-kebab-menu>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionDropdownId(openActionDropdownId === `m-${wo.id}` ? null : `m-${wo.id}`);
                            }}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                              openActionDropdownId === `m-${wo.id}`
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                            }`}
                            title="Actions Menu"
                            aria-label="Actions Menu"
                          >
                            <span className="text-sm font-black leading-none pb-1">⋮</span>
                          </button>

                          {openActionDropdownId === `m-${wo.id}` && (
                            <div
                              className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-zinc-700/80 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-zinc-800/80"
                            >
                              <div className="py-1">
                                {!isResolved && statusKey !== 'rejected' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenActionDropdownId(null);
                                      navigate(`/superadmin/technicians/assign/${wo.id}/assign`);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 cursor-pointer"
                                  >
                                    <span>⚡</span>
                                    <span>{isPending ? 'Assign Tech' : 'Reassign Tech'}</span>
                                  </button>
                                )}

                                {(isDispatched || isOnSite) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenActionDropdownId(null);
                                      openResolveModal(wo);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <span>✓</span>
                                    <span>Mark as Done</span>
                                  </button>
                                )}

                                <Link
                                  to={`/superadmin/technicians/assign/${wo.id}`}
                                  onClick={() => setOpenActionDropdownId(null)}
                                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                >
                                  <FleetIcons.Eye className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Details</span>
                                </Link>
                              </div>

                              {isPending && (
                                <div className="py-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenActionDropdownId(null);
                                      openRejectModal(wo);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <span>✕</span>
                                    <span>Reject Request</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bus & Depot Quick Info */}
                    <div className="p-2.5 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                          Depot & Operator
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white truncate block">
                          {depot}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate block">
                          {org?.name || 'Fleet Operator'}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                          Target Bus
                        </span>
                        <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700 text-xs inline-block mt-0.5 shadow-2xs">
                          {bus}
                        </span>
                      </div>
                    </div>

                    {/* Issue Category & Description */}
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="text-blue-500">🔧</span>
                        <span>{wo.issue_category || wo.issueCategory || 'Hardware Maintenance'}</span>
                      </div>
                      {wo.description && (
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {wo.description}
                        </p>
                      )}
                    </div>

                    {/* SLA Countdown & Assigned Engineer Radar */}
                    <div className="flex items-center justify-between gap-2 pt-1 text-xs flex-wrap">
                      <div>
                        {slaCountdown ? (
                          <span className={`text-[10px] px-2 py-0.5 rounded-md border font-mono inline-flex items-center gap-1 ${slaCountdown.color}`}>
                            {slaCountdown.text}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">SLA: Standard 24h</span>
                        )}
                      </div>

                      <div>
                        {tech ? (
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs">
                            <span className="text-slate-400 text-[10px]">Tech:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{tech.name}</span>
                            {techWorkload?.isBusy ? (
                              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" title="Busy on active job"></span>
                            ) : (
                              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Available"></span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                            <span>Unassigned</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Responsive Mobile Button Column / Action Bar */}
                    <div className="pt-2 flex items-center gap-2 flex-wrap border-t border-slate-100 dark:border-zinc-800/80">
                      {/* Assign / Reassign */}
                      {(!isResolved && statusKey !== 'rejected') && (
                        <button
                          type="button"
                          onClick={() => navigate(`/superadmin/technicians/assign/${wo.id}/assign`)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                            isPending
                              ? 'bg-gradient-to-r from-[#1C68FD] to-indigo-600 text-white hover:opacity-95'
                              : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          <span>⚡</span>
                          <span>{isPending ? 'Assign Tech' : 'Reassign'}</span>
                        </button>
                      )}

                      {/* Mark Done / Resolved */}
                      {(isDispatched || isOnSite) && (
                        <button
                          type="button"
                          onClick={() => openResolveModal(wo)}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span>✓</span>
                          <span>Mark Resolved</span>
                        </button>
                      )}

                      {/* Reject */}
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => openRejectModal(wo)}
                          className="py-2 px-3 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          ✕ Reject
                        </button>
                      )}

                      {/* View Details Link Button */}
                      <Link
                        to={`/superadmin/technicians/assign/${wo.id}`}
                        className={`${
                          isResolved || statusKey === 'rejected'
                            ? 'w-full justify-center'
                            : ''
                        } py-2 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 shadow-2xs`}
                      >
                        <FleetIcons.Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Global Pagination */}
        {filteredOrders.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-zinc-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[6, 10, 20, 50]}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL: QUICK ASSIGN TECHNICIAN                                         */}
      {/* ========================================================================= */}
      {assignModalOpen && assignOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⚡ Dispatch Central Technician</span>
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                    {assignOrder.code}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Target: {assignOrder.depot_name || 'Main Depot'} • Bus: {assignOrder.bus_number || 'N/A'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleConfirmAssign} className="p-5 space-y-4 overflow-y-auto">
              {/* Request Summary Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-zinc-300">Tenant Fleet:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{assignOrder.organization?.name || 'Fleet Operator'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-zinc-300">Issue Category:</span>
                  <span className="text-slate-900 dark:text-white">{assignOrder.issue_category || 'Hardware Maintenance'}</span>
                </div>
                {assignOrder.description && (
                  <div className="pt-1 text-[11px] text-slate-500 dark:text-zinc-400 italic">
                    "{assignOrder.description}"
                  </div>
                )}
              </div>

              {/* Technician Selector with Live Busy Status */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                  Select Central Technician <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignTechId}
                  onChange={(e) => setAssignTechId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Choose an Available Technician --</option>
                  {techsList.map((tech) => {
                    const workload = getTechnicianWorkload(tech.id);
                    const statusText = workload.isBusy
                      ? `🟡 BUSY — on Bus ${workload.currentJob?.bus_number || 'N/A'} @ ${workload.currentJob?.depot_name || 'Depot'} (${workload.currentJob?.status})`
                      : '🟢 AVAILABLE (0 active jobs)';
                    return (
                      <option key={tech.id} value={tech.id}>
                        {tech.name} — {statusText}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Conflict Notice if Busy */}
              {selectedTechWorkload?.isBusy && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                  <span className="text-base">⚠️</span>
                  <div>
                    <span className="font-bold">Workload Conflict Warning:</span>
                    <p className="mt-0.5 text-[11px]">
                      This technician is currently engaged on active work order{' '}
                      <span className="font-mono font-bold">{selectedTechWorkload.currentJob?.code}</span> (Bus {selectedTechWorkload.currentJob?.bus_number || 'N/A'} at {selectedTechWorkload.currentJob?.depot_name || 'Depot'}). Dispatching will add this job to their queue.
                    </p>
                  </div>
                </div>
              )}

              {/* SLA Target Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                  Resolution SLA Target
                </label>
                <select
                  value={assignSlaHours}
                  onChange={(e) => setAssignSlaHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SLA_PRESETS.map((p) => (
                    <option key={p.hours} value={p.hours}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* ETA */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                  Estimated Arrival Time (ETA)
                </label>
                <input
                  type="text"
                  value={assignEta}
                  onChange={(e) => setAssignEta(e.target.value)}
                  placeholder="e.g. 45 mins, 2 hours, Tomorrow 10:00 AM"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                  Dispatch Instructions & Engineering Notes
                </label>
                <textarea
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  rows={3}
                  placeholder="Special instructions, gate entry details, tools needed..."
                  className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Footer */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-gradient-to-r from-[#1C68FD] via-indigo-600 to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-center"
                >
                  {assignSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>Confirm Dispatch & Notify</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: MARK WORK ORDER RESOLVED                                        */}
      {/* ========================================================================= */}
      {resolveModalOpen && resolveOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>✓ Mark Work Order Resolved</span>
                </h3>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {resolveOrder.code} • Bus {resolveOrder.bus_number || 'N/A'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                  Resolution Notes & Technical Findings
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  placeholder="Details of the repair, replaced components, telematics link verification, test run results..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                ></textarea>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                  This note will be recorded permanently in the audit trail and sent to the tenant fleet admin.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolveSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-center"
                >
                  {resolveSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>Confirm Resolved</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: REJECT REQUEST                                                  */}
      {/* ========================================================================= */}
      {rejectModalOpen && rejectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span>✕ Reject Technician Request</span>
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
                  {rejectOrder.code} • Bus {rejectOrder.bus_number || 'N/A'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Duplicate request, Depot out of warranty scope, Bus currently in route..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                ></textarea>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                  The tenant will be immediately notified with this explanation.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-center"
                >
                  {rejectSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>Confirm Reject</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedWorkOrdersPage;
