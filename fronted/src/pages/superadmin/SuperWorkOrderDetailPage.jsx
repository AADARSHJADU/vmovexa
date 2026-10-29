import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useSuperTechnician } from '../../hooks/superadmin/useSuperTechnician';
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
      text: `Overdue ${timeStr}`,
      color: 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-800 font-bold animate-pulse',
    };
  }
  const remMins = Math.round(diff / (60 * 1000));
  const h = Math.floor(remMins / 60);
  const m = remMins % 60;
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return {
    text: `${timeStr} remaining`,
    color: diff < 3600 * 1000
      ? 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 font-bold'
      : 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  };
}

function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 45) return 'Just now';
  if (diffSec < 90) return '1 min ago';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
  if (diffSec < 7200) return '1 hour ago';
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 172800) return 'Yesterday';
  return `${Math.floor(diffSec / 86400)} days ago`;
}

function formatExactDateTime(dateInput) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function getRoleBadgeConfig(role) {
  const r = String(role || '').toUpperCase();
  if (r.includes('SUPER') || r.includes('SUPERADMIN')) {
    return {
      label: 'Super Admin',
      color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    };
  }
  if (r.includes('TECH') || r.includes('CENTRAL')) {
    return {
      label: 'Central Field Engineer',
      color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    };
  }
  if (r.includes('TENANT') || r.includes('FLEET') || r.includes('OPERATOR') || r.includes('ADMIN')) {
    return {
      label: 'Fleet Manager / Depot Admin',
      color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    };
  }
  if (r.includes('DRIVER')) {
    return {
      label: 'Transit Driver',
      color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    };
  }
  if (r.includes('FINANCE')) {
    return {
      label: 'Corporate Finance Officer',
      color: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
    };
  }
  return {
    label: role ? String(role).replace(/^ROLE[-_]/i, '').replace(/[-_]/g, ' ') : '—',
    color: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700',
  };
}

function getEventBadgeConfig(event, description = '') {
  const ev = String(event || '').toLowerCase();
  const desc = String(description).toLowerCase();

  if (ev === 'created' || desc.includes('created') || desc.includes('filed')) {
    return {
      label: 'Work Order Filed',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dotClass: 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60',
    };
  }
  if (desc.includes('dispatched') || desc.includes('assigned') || ev === 'assigned') {
    return {
      label: 'Technician Dispatched',
      badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      dotClass: 'bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-950/60',
    };
  }
  if (desc.includes('on_site') || desc.includes('on site') || desc.includes('arrival')) {
    return {
      label: 'On-Site Arrival',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dotClass: 'bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/60 animate-pulse',
    };
  }
  if (desc.includes('resolved') || ev === 'resolved') {
    return {
      label: 'Resolved & Certified',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold',
      dotClass: 'bg-emerald-600 ring-4 ring-emerald-200 dark:ring-emerald-900',
    };
  }
  if (desc.includes('rejected') || desc.includes('cancelled')) {
    return {
      label: 'Request Rejected',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      dotClass: 'bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950/60',
    };
  }
  return {
    label: 'Lifecycle Audit',
    badgeClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    dotClass: 'bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-950/60',
  };
}

function extractAuditProperties(rawProps) {
  if (!rawProps) return [];
  let props = rawProps;
  if (typeof rawProps === 'string') {
    try {
      props = JSON.parse(rawProps);
    } catch {
      return [];
    }
  }
  if (typeof props !== 'object' || Array.isArray(props)) return [];

  const keyLabels = {
    bus_number: 'Target Bus',
    depot_name: 'Depot Hub',
    urgency: 'Urgency',
    issue_category: 'Category',
    assigned_technician_name: 'Assigned Tech',
    assigned_by: 'Assigned By ID',
    status: 'Status',
    eta: 'Target ETA',
    sla_due_at: 'SLA Deadline',
    description: 'Description',
    resolution_notes: 'Resolution Notes',
    instructions: 'Instructions',
    severity: 'Severity',
  };

  const entries = [];
  for (const [k, v] of Object.entries(props)) {
    if (v !== null && v !== undefined && v !== '' && typeof v !== 'object') {
      const label = keyLabels[k] || k.replace(/_/g, ' ');
      let valStr = String(v);
      if (k === 'sla_due_at') {
        const d = new Date(v);
        if (!isNaN(d.getTime())) valStr = d.toLocaleString('en-IN');
      } else if (valStr.length > 80) {
        valStr = valStr.slice(0, 80) + '...';
      }
      entries.push({ key: k, label, value: valStr });
    }
  }
  return entries;
}

export const SuperWorkOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    loadWorkOrderDetail,
    loadCentralTechnicians,
    centralTechnicians,
    workOrders,
    loadWorkOrders,
    assignWorkOrder,
    updateWorkOrderStatus,
    rejectWorkOrder,
  } = useSuperTechnician();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTechId, setAssignTechId] = useState('');
  const [assignSlaHours, setAssignSlaHours] = useState('4');
  const [assignEta, setAssignEta] = useState('Within 2 hours');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolveSubmitting, setResolveSubmitting] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await loadWorkOrderDetail(id);
      if (data) {
        setOrder(data);
      } else {
        toast.error('Work order not found');
        navigate('/superadmin/technicians/assign');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load work order details');
      navigate('/superadmin/technicians/assign');
    } finally {
      setLoading(false);
    }
  }, [id, loadWorkOrderDetail, navigate]);

  useEffect(() => {
    fetchDetail();
    loadCentralTechnicians().catch(() => {});
    loadWorkOrders().catch(() => {});
  }, [fetchDetail, loadCentralTechnicians, loadWorkOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDetail(),
        loadCentralTechnicians(),
        loadWorkOrders(),
      ]);
      toast.success('Work order details updated!');
    } catch {
      toast.error('Failed to refresh.');
    } finally {
      setRefreshing(false);
    }
  };

  // Workload radar for technicians
  const ordersList = useMemo(() => Array.isArray(workOrders) ? workOrders : [], [workOrders]);
  const getTechnicianWorkload = useCallback((techId) => {
    if (!techId) return { isBusy: false, activeJobs: [], currentJob: null };
    const activeJobs = ordersList.filter((wo) =>
      Number(wo.assigned_technician_id) === Number(techId) &&
      wo.id !== Number(id) &&
      ['dispatched', 'on_site'].includes((wo.status || '').toLowerCase())
    );
    return {
      isBusy: activeJobs.length > 0,
      activeJobs,
      currentJob: activeJobs[0] || null,
    };
  }, [ordersList, id]);

  const selectedTechWorkload = assignTechId ? getTechnicianWorkload(assignTechId) : null;
  const currentAssignedTechWorkload = order?.assigned_technician_id ? getTechnicianWorkload(order.assigned_technician_id) : null;

  // Open Assign Modal
  const openAssignModal = () => {
    setAssignTechId(order.assigned_technician_id ? String(order.assigned_technician_id) : '');
    setAssignSlaHours('4');
    setAssignEta(order.eta || 'Within 2 hours');
    setAssignInstructions(order.instructions || order.description || '');
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!assignTechId) {
      toast.error('Please select a technician.');
      return;
    }
    setAssignSubmitting(true);
    try {
      await assignWorkOrder(order.id, {
        technicianId: Number(assignTechId),
        slaHours: Number(assignSlaHours),
        eta: assignEta,
        instructions: assignInstructions,
      });
      toast.success(`Technician successfully dispatched for ${order.code}!`);
      setAssignModalOpen(false);
      fetchDetail();
    } catch (err) {
      toast.error(err?.message || 'Failed to assign technician.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Open Resolve Modal
  const openResolveModal = () => {
    setResolutionNotes(order.resolution_notes || 'Diagnosed hardware and repaired telemetry wiring. Nominal operation verified.');
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    setResolveSubmitting(true);
    try {
      await updateWorkOrderStatus(order.id, 'resolved', resolutionNotes);
      toast.success(`Work order ${order.code} marked resolved!`);
      setResolveModalOpen(false);
      fetchDetail();
    } catch (err) {
      toast.error(err?.message || 'Failed to update work order.');
    } finally {
      setResolveSubmitting(false);
    }
  };

  // Open Reject Modal
  const openRejectModal = () => {
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    setRejectSubmitting(true);
    try {
      await rejectWorkOrder(order.id, rejectReason);
      toast.success(`Work order ${order.code} rejected.`);
      setRejectModalOpen(false);
      fetchDetail();
    } catch (err) {
      toast.error(err?.message || 'Failed to reject work order.');
    } finally {
      setRejectSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded-xl w-72 animate-pulse" />
        <div className="p-8 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-slate-500 dark:text-zinc-400 font-bold text-xs">{t('superadmin.work_order_detail.loading', 'Loading work order details & audit timeline...')}</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full p-12 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
        <div className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t('superadmin.work_order_detail.not_found', 'Work order not found.')}</div>
        <Link
          to="/superadmin/technicians/assign?tab=work-orders"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          ← Back to Work Orders
        </Link>
      </div>
    );
  }

  const statusKey = order.status ? String(order.status).toLowerCase() : 'unknown';
  const statusCfg = STATUS_BADGES[statusKey] || { label: statusKey, color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };
  const urgencyBadge = URGENCY_BADGES[(order.urgency || 'normal').toLowerCase()] || URGENCY_BADGES.normal;
  const slaCountdown = formatSlaCountdown(order.sla_due_at, order.status);

  const isPending = statusKey === 'submitted' || !order.assigned_technician_id;
  const isDispatched = statusKey === 'dispatched';
  const isOnSite = statusKey === 'on_site';
  const isResolved = ['resolved', 'closed'].includes(statusKey);
  const isRejected = statusKey === 'rejected';

  const assignedTech = order.technician;
  const targetBus = order.bus_number || (order.vehicle?.bus_number) || '—';
  const depotName = order.depot_name || (order.depot?.name) || '—';
  const orgName = order.organization?.name || 'Fleet Operator';

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'SuperAdmin', path: '/superadmin/dashboard' },
          { label: t('technician.central_technicians', 'Central Technicians'), path: '/superadmin/technicians' },
          { label: t('superadmin.work_orders.title', 'Work Orders & Assignments'), path: '/superadmin/technicians/assign?tab=work-orders' },
          { label: order.code },
        ]}
      />

      {/* Action Header Banner */}
      <div className="w-full p-5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <Link
              to="/superadmin/technicians/assign?tab=work-orders"
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs shrink-0 mt-0.5 sm:mt-0"
              title={t('superadmin.work_order_detail.return_desk_title', 'Return to Work Orders Desk')}
            >
              <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t('common.back', 'Back')}</span>
            </Link>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {order.code}
                </h1>
                <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                  <span>{statusCfg.label}</span>
                </span>
                <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${urgencyBadge}`}>
                  {order.urgency || 'Normal'} {t('superadmin.work_order_detail.priority_suffix', 'Priority')}
                </span>
                {slaCountdown && (
                  <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full border font-mono ${slaCountdown.color}`}>
                    {slaCountdown.text}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
                {t('superadmin.work_order_detail.requested_by', 'Requested by')} <strong>{order.requestedBy?.name || 'Tenant Admin'}</strong> ({orgName}) • {order.requested_at ? new Date(order.requested_at).toLocaleString('en-IN') : 'N/A'}
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            <RefreshButton
              onClick={handleRefresh}
              loading={refreshing}
              title={t('superadmin.work_order_detail.refresh_title', 'Refresh Details')}
            />

            {/* Quick Assign / Reassign */}
            {!isResolved && !isRejected && (
              <button
                type="button"
                onClick={() => navigate(`/superadmin/technicians/assign/${order.id}/assign`)}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 flex-1 sm:flex-initial text-center"
              >
                <FleetIcons.Speed className="w-3.5 h-3.5 text-white" />
                <span>{isPending ? 'Assign Central Tech' : 'Reassign Tech'}</span>
              </button>
            )}

            {/* Mark Done */}
            {(isDispatched || isOnSite) && (
              <button
                type="button"
                onClick={openResolveModal}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 flex-1 sm:flex-initial text-center"
              >
                <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                <span>{t('superadmin.work_orders.mark_resolved', 'Mark Resolved')}</span>
              </button>
            )}

            {/* Reject */}
            {isPending && (
              <button
                type="button"
                onClick={openRejectModal}
                className="px-3 py-2.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold transition-all cursor-pointer text-center inline-flex items-center justify-center gap-1"
              >
                <FleetIcons.Ban className="w-3 h-3 text-red-600 dark:text-red-400" />
                <span>{t('common.reject', 'Reject')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0 max-w-full">
        {/* LEFT COLUMN: Problem Details, Scope, Findings, Activity Logs Timeline */}
        <div className="lg:col-span-2 space-y-6 min-w-0 max-w-full">
          {/* Target Vehicle & Hardware Scope */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 min-w-0 max-w-full overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <FleetIcons.Bus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{t('superadmin.work_order_detail.scope_title', 'Target Bus & Depot Scope')}</span>
              </h2>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                {targetBus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.work_order_detail.depot_location', 'Depot Location')}</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{depotName}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.work_order_detail.terminal_gate', 'Terminal Gate / Bay Service Dock')}</div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.work_order_detail.problem_category', 'Problem Category')}</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{order.issue_category || '—'}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.work_order_detail.telemetry_diagnostics', 'Telemetry & Edge Diagnostics')}</div>
              </div>
            </div>

            {/* Problem Description Statement */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1.5 min-w-0 max-w-full overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.work_order_detail.problem_description', 'Problem Description')}</span>
              <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium leading-relaxed break-words [overflow-wrap:anywhere]">
                {order.description || 'No detailed symptom notes provided by requester.'}
              </p>
            </div>

            {/* Special Depot Instructions */}
            {order.instructions && (
              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl space-y-1 min-w-0 max-w-full overflow-hidden">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <FleetIcons.Pin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t('superadmin.work_order_detail.special_instructions', 'Special Depot Instructions for Engineer')}</span>
                </span>
                <p className="text-xs text-blue-900 dark:text-blue-200 font-medium leading-relaxed break-words [overflow-wrap:anywhere]">
                  {order.instructions}
                </p>
              </div>
            )}

            {/* Resolution Findings (if resolved) */}
            {order.resolution_notes && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5 min-w-0 max-w-full overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('superadmin.work_order_detail.resolution_findings', 'Resolution Findings & Field Signoff')}</span>
                  </span>
                  {order.resolved_at && (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      {new Date(order.resolved_at).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-900 dark:text-emerald-100 font-medium leading-relaxed break-words [overflow-wrap:anywhere]">
                  {order.resolution_notes}
                </p>
              </div>
            )}

            {/* {t('superadmin.work_order_detail.rating_feedback', 'Client Service Rating & Feedback')} */}
            {order.rating && (
              <div className="p-5 rounded-2xl bg-amber-50/30 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-3 min-w-0 max-w-full overflow-hidden">
                <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-900/50 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <FleetIcons.Star className="w-4 h-4 text-amber-500" filled />
                    <span>{t('superadmin.work_order_detail.rating_feedback', 'Client Service Rating & Feedback')}</span>
                  </span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800 font-mono">
                    {order.rating}.0 / 5.0
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FleetIcons.Star
                      key={s}
                      className={`w-4 h-4 ${s <= order.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-zinc-700'}`}
                      filled={s <= order.rating}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 ml-2">
                    {order.rating === 5 ? 'Exceptional (5★)' : order.rating >= 4 ? 'Very Good (4★)' : 'Satisfactory (3★)'}
                  </span>
                </div>

                {Array.isArray(order.rating_tags) && order.rating_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {order.rating_tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                )}

                {order.rating_comment && (
                  <p className="text-xs text-slate-700 dark:text-zinc-200 bg-white/80 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-amber-100 dark:border-zinc-800 font-medium break-words [overflow-wrap:anywhere]">
                    "{order.rating_comment}"
                  </p>
                )}

                <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                  Rated by {order.ratedByUser?.name || '—'} • {order.rated_at ? new Date(order.rated_at).toLocaleString('en-IN') : '—'}
                </div>
              </div>
            )}
          </div>

          {/* Chronological Activity Logs & Audit Timeline */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6 min-w-0 max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-sm">
                    <FleetIcons.Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </span>
                  <span>{t('superadmin.work_order_detail.audit_trail_title', 'Complete Activity Logs & Audit Trail')}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Immutable chronological audit record tracking all responsible actors, clearances, timestamps, and dispatch transitions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
                  {order.activityLogs?.length || 0} Recorded Events
                </span>
              </div>
            </div>

            {order.activityLogs && order.activityLogs.length > 0 ? (
              <div className="relative pl-6 sm:pl-8 space-y-6 min-w-0 max-w-full before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-purple-500/30">
                {order.activityLogs.map((log, idx) => {
                  const relativeTime = formatRelativeTime(log.created_at);
                  const exactTime = formatExactDateTime(log.created_at);
                  const roleCfg = getRoleBadgeConfig(log.actor_role);
                  const eventCfg = getEventBadgeConfig(log.event, log.description);
                  const auditProps = extractAuditProperties(log.properties);

                  const actorInitial = log.actor_name
                    ? String(log.actor_name).trim().charAt(0).toUpperCase()
                    : 'U';

                  return (
                    <div key={log.id || idx} className="relative group min-w-0 max-w-full">
                      {/* Timeline Dot Node */}
                      <div className="absolute -left-6 sm:-left-8 top-3 flex items-center justify-center">
                        <span className={`w-4 h-4 rounded-full border-2 border-white dark:border-[#11141d] ${eventCfg.dotClass} shadow-md group-hover:scale-125 transition-transform`} />
                      </div>

                      <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/90 rounded-2xl space-y-3.5 shadow-xs hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-800/70 min-w-0 max-w-full overflow-hidden">
                        {/* Row 1: Prominent Actor Identity & Time Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 dark:border-zinc-800/80 pb-3">
                          {/* Actor Information */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0 uppercase">
                              {actorInitial}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight break-words">
                                  {log.actor?.isSystem ? 'System' : (log.actor?.name || log.actor_name || 'Actor unavailable')}
                                </span>

                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${roleCfg.color}`}>
                                  <span>{roleCfg.label}</span>
                                </span>
                              </div>

                              <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate mt-0.5 flex items-center gap-2">
                                {log.actor_email && <span className="truncate">✉ {log.actor_email}</span>}
                                {log.causer_id && (
                                  <span className="text-[10px] bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.2 rounded text-slate-600 dark:text-zinc-300 font-mono shrink-0">
                                    Actor ID: #{log.causer_id}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Time Details (Clear & Prominent) */}
                          <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1 shrink-0 bg-white/70 dark:bg-zinc-800/50 p-2 sm:p-0 rounded-xl sm:bg-transparent border border-slate-100 sm:border-0 dark:border-zinc-800">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 shadow-xs">
                              <FleetIcons.Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span>{relativeTime || 'Just now'}</span>
                            </span>

                            <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 mt-0.5">
                              <FleetIcons.Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{exactTime}</span>
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Event Type Badge & Description */}
                        <div className="space-y-2 min-w-0 max-w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 ${eventCfg.badgeClass}`}>
                              <span>{eventCfg.label}</span>
                            </span>

                            {log.severity && log.severity !== 'INFO' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 shrink-0">
                                {log.severity}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-800 dark:text-zinc-200 font-medium leading-relaxed break-words [overflow-wrap:anywhere]">
                            {log.description || log.action || 'Work order event recorded.'}
                          </p>
                        </div>

                        {/* Row 3: Audit Parameters & Properties */}
                        {auditProps.length > 0 && (
                          <div className="p-3 bg-white dark:bg-[#0e1118] border border-slate-200/80 dark:border-zinc-800/80 rounded-xl space-y-1.5 min-w-0 max-w-full overflow-hidden">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                              Audit Snapshot:
                            </span>
                            <div className="flex flex-wrap gap-1.5 min-w-0 max-w-full">
                              {auditProps.map((item) => (
                                <span
                                  key={item.key}
                                  className="inline-flex max-w-full items-baseline gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-zinc-800/80 text-[11px] text-slate-700 dark:text-zinc-300 font-mono border border-slate-200 dark:border-zinc-700 min-w-0 break-words [overflow-wrap:anywhere]"
                                >
                                  <span className="font-semibold text-slate-500 dark:text-zinc-400 shrink-0">{item.label}:</span>
                                  <strong className="text-slate-900 dark:text-white font-bold break-all [overflow-wrap:anywhere]">{item.value}</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs font-medium bg-slate-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                No activity logs recorded yet for this work order.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Assigned Technician Radar, SLA Desk, Requester Org */}
        <div className="space-y-6 min-w-0 max-w-full">
          {/* Assigned Technician Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 min-w-0 max-w-full overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <FleetIcons.Tools className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{t('superadmin.work_order_detail.assigned_engineer', 'Assigned Field Engineer')}</span>
              </h2>
              {assignedTech && (
                <Link
                  to={`/superadmin/technicians/${assignedTech.id}`}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Profile →
                </Link>
              )}
            </div>

            {assignedTech ? (
              <div className="space-y-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                    {String(assignedTech.name || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {assignedTech.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {assignedTech.email}
                    </div>
                    <div className="text-xs font-mono text-slate-600 dark:text-zinc-400 mt-0.5 truncate">
                      {assignedTech.phone || 'Phone: Not provided'}
                    </div>
                  </div>
                </div>

                {/* Workload Status */}
                <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.work_order_detail.engineer_status', 'Engineer Status:')}</span>
                    {currentAssignedTechWorkload?.isBusy ? (
                      <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>{t('superadmin.work_order_detail.busy_another_job', 'Busy on another job')}</span>
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{t('superadmin.work_order_detail.available_field_visit', 'Available for field visit')}</span>
                      </span>
                    )}
                  </div>
                  {order.eta && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.work_order_detail.expected_eta', 'Expected ETA:')}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 truncate">{order.eta}</span>
                    </div>
                  )}
                  {order.dispatched_at && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.work_order_detail.dispatched_at', 'Dispatched At:')}</span>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">
                        {new Date(order.dispatched_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 text-center space-y-2 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl">
                <FleetIcons.Alert className="w-8 h-8 text-amber-500 mx-auto" />
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {t('superadmin.work_order_detail.no_eng_dispatched', 'No Engineer Dispatched Yet')}
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  {t('superadmin.work_order_detail.awaiting_allocation', 'This request is awaiting central engineer allocation.')}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/superadmin/technicians/assign/${order.id}/assign`)}
                  className="mt-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                >
                  <FleetIcons.Speed className="w-3.5 h-3.5 text-white" />
                  <span>{t('superadmin.work_order_detail.assign_now', 'Assign Now')}</span>
                </button>
              </div>
            )}
          </div>

          {/* SLA Target Desk */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3 min-w-0 max-w-full overflow-hidden">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <FleetIcons.Clock className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
              <span>{t('superadmin.work_order_detail.sla_countdown', 'SLA Target & Countdown')}</span>
            </h2>

            <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">{t('superadmin.work_order_detail.current_status', 'Current Status:')}</span>
                <span className={`px-2 py-0.5 rounded-full font-mono font-bold ${slaCountdown?.color || 'text-slate-600'}`}>
                  {slaCountdown?.text || 'No SLA defined'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">{t('superadmin.work_order_detail.sla_due_at', 'SLA Due At:')}</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">
                  {order.sla_due_at ? new Date(order.sla_due_at).toLocaleString('en-IN') : 'Not Set'}
                </span>
              </div>
            </div>
          </div>

          {/* Requester & Tenant Fleet Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3 min-w-0 max-w-full overflow-hidden">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <FleetIcons.Building className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
              <span>{t('superadmin.work_order_detail.requesting_fleet', 'Requesting Fleet Operator')}</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">{t('superadmin.work_order_detail.organization', 'Organization:')}</span>
                <span className="font-bold text-slate-900 dark:text-white truncate ml-2">{orgName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">{t('superadmin.work_order_detail.submitted_by', 'Submitted By:')}</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate ml-2">{order.requestedBy?.name || 'Admin'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">{t('superadmin.work_order_detail.requester_email', 'Requester Email:')}</span>
                <span className="font-mono text-slate-700 dark:text-zinc-300 truncate ml-2">{order.requestedBy?.email || '—'}</span>
              </div>
              {order.requestedBy?.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">{t('common.phone', 'Phone')}:</span>
                  <span className="font-mono text-slate-700 dark:text-zinc-300 ml-2">{order.requestedBy.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* {t('superadmin.work_order_detail.audit_metadata', 'Audit Metadata')} Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3 min-w-0 max-w-full overflow-hidden">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <FleetIcons.Shield className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
              <span>{t('superadmin.work_order_detail.audit_metadata', 'Audit Metadata')}</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.work_order_detail.assigned_by', 'Assigned By:')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {order.assignedByUser?.name || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.work_order_detail.last_updated_by', 'Last Updated By:')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {order.updatedByUser?.name || '—'}
                </span>
              </div>
              {order.resolved_by && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.work_order_detail.resolved_by', 'Resolved By:')}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {order.resolvedByUser?.name || '—'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN / REASSIGN TECHNICIAN                                       */}
      {/* ========================================================================= */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FleetIcons.Speed className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{t('superadmin.work_orders.dispatch_tech_title', 'Dispatch Central Technician')}</span>
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                    {order.code}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Target: {depotName} • Bus: {targetBus}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="p-5 space-y-4 overflow-y-auto">
              {/* Technician Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                  Select Certified Central Technician *
                </label>
                <select
                  required
                  value={assignTechId}
                  onChange={(e) => setAssignTechId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">{t('superadmin.work_order_detail.choose_pool_opt', '-- Choose from Available Central Pool --')}</option>
                  {centralTechnicians?.map((tech) => {
                    const workload = getTechnicianWorkload(tech.id);
                    const label = `${tech.name} (${tech.technicianProfile?.base_city || tech.city || 'Central'}) ${
                      workload.isBusy ? `• 🟡 Busy on ${workload.currentJob?.bus_number || 'job'}` : '• 🟢 Available'
                    }`;
                    return (
                      <option key={tech.id} value={tech.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Conflict Warning */}
              {selectedTechWorkload?.isBusy && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200">
                  <FleetIcons.Alert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>{t('superadmin.work_order_detail.engineer_engaged', 'Engineer Already Engaged:')}</strong> This technician has an active work order on bus{' '}
                    <strong>{selectedTechWorkload.currentJob?.bus_number || 'N/A'}</strong>. Assigning will create a queued dispatch.
                  </div>
                </div>
              )}

              {/* SLA Target Preset */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                  SLA Target Window *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SLA_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.hours}
                      onClick={() => setAssignSlaHours(String(preset.hours))}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        String(assignSlaHours) === String(preset.hours)
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="font-bold">{preset.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated ETA */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                  Estimated Field Arrival (ETA)
                </label>
                <input
                  type="text"
                  value={assignEta}
                  onChange={(e) => setAssignEta(e.target.value)}
                  placeholder={t('superadmin.work_order_detail.ph_eta', 'e.g. Within 45 minutes')}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Gate / Depot Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                  Special Dispatch Instructions & Access Notes
                </label>
                <textarea
                  rows={3}
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  placeholder={t('superadmin.work_order_detail.ph_instructions', 'e.g. Report to Bay 4, speak with Depot Manager Sharma...')}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >{t('common.cancel', 'Cancel')}</button>
                <button
                  type="submit"
                  disabled={assignSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 text-center"
                >
                  {assignSubmitting ? 'Dispatching...' : 'Confirm Dispatch & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MARK RESOLVED                                                      */}
      {/* ========================================================================= */}
      {resolveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('superadmin.work_order_detail.signoff_title', 'Signoff Work Order')}</span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                  {order.code}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                  Resolution Findings & Field Signoff Notes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder={t('superadmin.work_order_detail.ph_resolution', 'Detail the technical repair performed, replaced components, and telemetry verification results...')}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >{t('common.cancel', 'Cancel')}</button>
                <button
                  type="submit"
                  disabled={resolveSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 text-center"
                >
                  {resolveSubmitting ? 'Submitting...' : 'Mark as Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT REQUEST                                                     */}
      {/* ========================================================================= */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FleetIcons.Ban className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>{t('superadmin.work_orders.reject_request', 'Reject Request')}</span>
                <span className="text-xs font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                  {order.code}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                  Rejection Reason (will be notified to requester) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('superadmin.work_order_detail.ph_rejection', 'e.g. Duplicate work order, depot dock at maximum capacity, or invalid bus number...')}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >{t('common.cancel', 'Cancel')}</button>
                <button
                  type="submit"
                  disabled={rejectSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 text-center"
                >
                  {rejectSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperWorkOrderDetailPage;
