import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminTechnicianRequest } from '../../hooks/admin/useAdminTechnicianRequest';
import { useAuth } from '../../hooks/useAuth';

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
      icon: '🛡️',
      color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    };
  }
  if (r.includes('TECH') || r.includes('CENTRAL')) {
    return {
      label: 'Central Field Engineer',
      icon: '🔧',
      color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    };
  }
  if (r.includes('TENANT') || r.includes('FLEET') || r.includes('OPERATOR') || r.includes('ADMIN')) {
    return {
      label: 'Fleet Manager / Depot Admin',
      icon: '🏢',
      color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    };
  }
  if (r.includes('DRIVER')) {
    return {
      label: 'Transit Driver',
      icon: '🚍',
      color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    };
  }
  if (r.includes('FINANCE')) {
    return {
      label: 'Corporate Finance Officer',
      icon: '💳',
      color: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
    };
  }
  return {
    label: role ? String(role).replace(/^ROLE[-_]/i, '').replace(/[-_]/g, ' ') : 'System Engine',
    icon: role ? '👤' : '⚡',
    color: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700',
  };
}

function getEventBadgeConfig(event, description = '') {
  const ev = String(event || '').toLowerCase();
  const desc = String(description).toLowerCase();

  if (ev === 'created' || desc.includes('created') || desc.includes('filed')) {
    return {
      label: 'Work Order Filed',
      icon: '✨',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dotClass: 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60',
    };
  }
  if (desc.includes('dispatched') || desc.includes('assigned') || ev === 'assigned') {
    return {
      label: 'Technician Dispatched',
      icon: '🚀',
      badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      dotClass: 'bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-950/60',
    };
  }
  if (desc.includes('on_site') || desc.includes('on site') || desc.includes('arrival')) {
    return {
      label: 'On-Site Arrival',
      icon: '📍',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dotClass: 'bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/60 animate-pulse',
    };
  }
  if (desc.includes('resolved') || ev === 'resolved') {
    return {
      label: 'Resolved & Certified',
      icon: '✓',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold',
      dotClass: 'bg-emerald-600 ring-4 ring-emerald-200 dark:ring-emerald-900',
    };
  }
  if (desc.includes('rejected') || desc.includes('cancelled')) {
    return {
      label: 'Request Rejected',
      icon: '✕',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      dotClass: 'bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950/60',
    };
  }
  return {
    label: 'Lifecycle Audit',
    icon: '📝',
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
      }
      entries.push({ key: k, label, value: valStr });
    }
  }
  return entries;
}

export const AdminTechRequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/technician-requests' : '/admin/technician-requests';
  const { hasPermission } = useAuth();
  const canView = hasPermission('work_orders.view');
  const canEdit = hasPermission('work_orders.edit') || hasPermission('work_orders.update') || hasPermission('work_orders.create');

  const { loadWorkOrderDetail } = useAdminTechnicianRequest();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canView) return;
    if (id) {
      setLoading(true);
      loadWorkOrderDetail(id)
        .then((res) => {
          if (res) {
            setRequest(res);
          } else {
            toast.error('Technician request work order not found');
            navigate(basePath);
          }
        })
        .catch((err) => {
          toast.error(err?.message || 'Failed to load technician request details');
          navigate(basePath);
        })
        .finally(() => setLoading(false));
    }
  }, [id, canView, loadWorkOrderDetail, navigate, basePath]);

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Access Revoked</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
          Your administrator has revoked your permission to view technician work orders.
        </p>
        <Link
          to={basePath}
          className="inline-block px-4 py-2 bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold rounded-xl"
        >
          ← Back to Technician Requests
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-slate-500 dark:text-zinc-400 font-bold text-sm">Loading technician work order details...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="w-full bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-slate-400 font-bold text-sm">Work order request not found.</div>
        <Link
          to={basePath}
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
        >
          Back to Work Orders
        </Link>
      </div>
    );
  }

  const reqNo = request.code || `WO-${request.id}`;
  const urgencyKey = (request.urgency || request.priority || 'normal').toLowerCase();
  const urgencyBadge = URGENCY_BADGES[urgencyKey] || URGENCY_BADGES.normal;
  const statusKey = (request.status || 'submitted').toLowerCase();
  const statusCfg = STATUS_BADGES[statusKey] || STATUS_BADGES.submitted;
  const depot = request.depot_name || request.depot?.name || 'Main Depot';
  const vehicle = request.bus_number || request.vehicle?.bus_number || '—';
  const tech = request.technician;
  const slaCountdown = formatSlaCountdown(request.sla_due_at, request.status);
  const isEditable = !['resolved', 'closed', 'rejected'].includes(statusKey);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Breadcrumb Navigation & Action Header */}
      <div className="w-full p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <Breadcrumb
          items={[
            { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard' },
            { label: 'Technician Requests', path: basePath },
            { label: reqNo },
          ]}
          className="mb-3"
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {reqNo}
              </h1>
                <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-md uppercase border ${urgencyBadge}`}>
                  {urgencyKey} Priority
                </span>
                <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                  <span>{statusCfg.label}</span>
                </span>
                {slaCountdown && (
                  <span className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-md border ${slaCountdown.color}`}>
                    {slaCountdown.text}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
                Service: <strong className="text-slate-700 dark:text-zinc-200">{request.issue_category || 'Hardware Maintenance'}</strong> • Created: {request.requested_at ? new Date(request.requested_at).toLocaleString('en-IN') : 'Recent'}
              </p>
            </div>

          {canEdit && isEditable && (
            <Link
              to={`${basePath}/edit/${request.id}`}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer text-center"
            >
              <FleetIcons.Edit className="w-3.5 h-3.5 text-white" />
              <span>Edit Request Details</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. 4-Stat Overview Grid (2-column on mobile, 4-column on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Target Depot</span>
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">{depot}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate">Service facility</p>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">Target Bus</span>
          <div className="text-sm sm:text-base font-mono font-bold text-blue-600 dark:text-blue-400 truncate">{vehicle}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate">Bus unit requiring service</p>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">Assigned Technician</span>
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
            {tech?.name || 'Awaiting Dispatch'}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">
            {tech?.phone || tech?.email || 'Central Pool'}
          </p>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Resolution SLA</span>
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
            {slaCountdown ? (
              <span className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-md border ${slaCountdown.color}`}>
                {slaCountdown.text}
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-normal">Pending Assignment</span>
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            {request.eta ? `ETA: ${request.eta}` : 'Target window'}
          </p>
        </div>
      </div>

      {/* 3. Details & Findings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request Description */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-1.5">
            <span>📝</span>
            <span>Initial Issue Description</span>
          </h3>
          <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium leading-relaxed break-words">
            {request.description || 'Hardware calibration required for dual passenger display screens and Edge IoT Gateway unit.'}
          </p>
        </div>

        {/* Central Dispatch Instructions */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-1.5">
            <span>⚡</span>
            <span>Dispatch Instructions & Engineering Notes</span>
          </h3>
          <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium leading-relaxed break-words">
            {request.instructions || 'No special dispatch instructions provided by platform supervisor.'}
          </p>
          {request.assignedByUser && (
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 pt-1 font-mono break-words">
              Dispatched by: {request.assignedByUser.name} ({request.assignedByUser.email})
            </div>
          )}
        </div>
      </div>

      {/* 4. Resolution Findings or Rejection Notice */}
      {request.resolution_notes && (
        <div className="bg-white dark:bg-[#11141d] border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm bg-emerald-50/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-emerald-100 dark:border-emerald-900/60 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <span>✓</span>
              <span>Resolution Findings & Test Results</span>
            </h3>
            {request.resolved_at && (
              <span className="text-[10px] font-mono font-normal text-slate-400">
                ({new Date(request.resolved_at).toLocaleString('en-IN')})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed font-medium break-words">
            {request.resolution_notes}
          </p>
          {request.resolvedByUser && (
            <div className="text-[10px] text-slate-400 font-mono pt-1">
              Verified & closed by: {request.resolvedByUser.name}
            </div>
          )}
        </div>
      )}

      {/* 5. Complete Activity Logs & Audit Trail Timeline */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3.5">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-xs">
                🕒
              </span>
              <span>Complete Activity Logs & Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Verified actor credentials, role designations, dispatch timestamps, and lifecycle transitions.
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
            {request.activityLogs?.length || 0} Events
          </span>
        </div>

        {(!request.activityLogs || request.activityLogs.length === 0) ? (
          <div className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs font-medium bg-slate-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
            No activity log entries recorded for this work order.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-purple-500/30">
            {request.activityLogs.map((log, idx) => {
              const relativeTime = formatRelativeTime(log.created_at);
              const exactTime = formatExactDateTime(log.created_at);
              const roleCfg = getRoleBadgeConfig(log.actor_role);
              const eventCfg = getEventBadgeConfig(log.event, log.description);
              const auditProps = extractAuditProperties(log.properties);

              const actorInitial = log.actor_name
                ? String(log.actor_name).trim().charAt(0).toUpperCase()
                : 'U';

              return (
                <div key={log.id || idx} className="relative group">
                  {/* Timeline Dot Node */}
                  <div className="absolute -left-6 sm:-left-8 top-3 flex items-center justify-center">
                    <span className={`w-4 h-4 rounded-full border-2 border-white dark:border-[#11141d] ${eventCfg.dotClass} shadow-md group-hover:scale-125 transition-transform`} />
                  </div>

                  <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/90 rounded-2xl space-y-3.5 shadow-xs hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-800/70">
                    {/* Row 1: Actor Identity & Time Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 dark:border-zinc-800/80 pb-3">
                      {/* Actor Information */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0 uppercase">
                          {actorInitial}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                              {log.actor_name || (log.causer_type === 'User' ? `User #${log.causer_id}` : 'System Dispatch Engine')}
                            </span>

                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleCfg.color}`}>
                              <span>{roleCfg.icon}</span>
                              <span>{roleCfg.label}</span>
                            </span>
                          </div>

                          <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate mt-0.5 flex items-center gap-2">
                            {log.actor_email && <span>✉ {log.actor_email}</span>}
                            {log.causer_id && (
                              <span className="text-[10px] bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.2 rounded text-slate-600 dark:text-zinc-300 font-mono">
                                Actor ID: #{log.causer_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Time Details */}
                      <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1 shrink-0 bg-white/70 dark:bg-zinc-800/50 p-2 sm:p-0 rounded-xl sm:bg-transparent border border-slate-100 sm:border-0 dark:border-zinc-800">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 shadow-xs">
                          <span>⏳</span>
                          <span>{relativeTime || 'Just now'}</span>
                        </span>

                        <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 mt-0.5">
                          <span>🕒</span>
                          <span>{exactTime}</span>
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Event Type Badge & Description */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${eventCfg.badgeClass}`}>
                          <span>{eventCfg.icon}</span>
                          <span>{eventCfg.label}</span>
                        </span>

                        {log.severity && log.severity !== 'INFO' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                            {log.severity}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                        {log.description || log.action || 'Work order event recorded.'}
                      </p>
                    </div>

                    {/* Row 3: Audit Parameters & Properties */}
                    {auditProps.length > 0 && (
                      <div className="p-3 bg-white dark:bg-[#0e1118] border border-slate-200/80 dark:border-zinc-800/80 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                          Audit Snapshot:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {auditProps.map((item) => (
                            <span
                              key={item.key}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-zinc-800/80 text-[11px] text-slate-700 dark:text-zinc-300 font-mono border border-slate-200 dark:border-zinc-700"
                            >
                              <span className="font-semibold text-slate-500 dark:text-zinc-400">{item.label}:</span>
                              <strong className="text-slate-900 dark:text-white font-bold">{item.value}</strong>
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
        )}
      </div>

      {/* 6. Bottom Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Link
          to={basePath}
          className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>←</span>
          <span>Back to Requests List</span>
        </Link>

        {canEdit && isEditable && (
          <Link
            to={`${basePath}/edit/${request.id}`}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <FleetIcons.Edit className="w-3.5 h-3.5 text-white" />
            <span>Edit Request</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default AdminTechRequestDetailsPage;
