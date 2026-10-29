import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminTechnicianRequest } from '../../hooks/admin/useAdminTechnicianRequest';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getStatusConfig,
  getUrgencyConfig,
  formatDisplayValue,
  formatExactDateTime,
  formatSlaCountdown,
  formatWorkOrderCode,
} from '../../features/workOrders/workOrderPresentation';

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

function getRoleBadgeConfig(roleCode) {
  const r = String(roleCode || '').toUpperCase();
  if (r.includes('SUPER')) {
    return {
      label: 'Super Admin',
      color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    };
  }
  if (r.includes('TECH') || r.includes('CENTRAL')) {
    return {
      label: 'Technician',
      color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    };
  }
  if (r.includes('TENANT') || r.includes('ADMIN')) {
    return {
      label: 'Tenant Admin',
      color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    };
  }
  if (r.includes('FLEET') || r.includes('OPERATOR')) {
    return {
      label: 'Fleet Operator',
      color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    };
  }
  if (r.includes('DRIVER')) {
    return {
      label: 'Driver',
      color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    };
  }
  return {
    label: roleCode ? String(roleCode).replace(/^ROLE[-_]/i, '').replace(/[-_]/g, ' ') : 'System',
    color: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700',
  };
}

function getEventBadgeConfig(event, description = '') {
  const ev = String(event || '').toLowerCase();
  const desc = String(description).toLowerCase();

  if (ev === 'created' || desc.includes('created') || desc.includes('filed')) {
    return {
      label: 'Request Created',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dotClass: 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60',
    };
  }
  if (desc.includes('dispatched') || desc.includes('assigned') || ev === 'assigned' || ev === 'dispatched') {
    return {
      label: 'Technician Assigned',
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
      label: 'Resolved',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold',
      dotClass: 'bg-emerald-600 ring-4 ring-emerald-200 dark:ring-emerald-900',
    };
  }
  if (desc.includes('rejected') || desc.includes('cancelled') || ev === 'rejected') {
    return {
      label: 'Rejected',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      dotClass: 'bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950/60',
    };
  }
  return {
    label: 'Activity Log',
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

export const AdminTechRequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFleetPortal = location.pathname.startsWith('/fleet-operator');
  const basePath = isFleetPortal ? '/fleet-operator/technician-requests' : '/admin/technician-requests';
  const { hasPermission } = useAuth();
  const { t } = useTranslation();
  const canView = hasPermission('work_orders.view');

  const { loadWorkOrderDetail } = useAdminTechnicianRequest();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canView) return;
    if (id) {
      loadWorkOrderDetail(id)
        .then((res) => {
          if (res) {
            setRequest(res);
          } else {
            toast.error('Technician work order not found');
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
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
          <FleetIcons.Key className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_denied', 'Access Denied')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
          You do not have permission to view technician requests. Please contact your administrator.
        </p>
        <Link
          to={basePath}
          className="inline-block px-4 py-2 bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold rounded-xl"
        >
          Back to Technician Requests
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t('admin.tech_requests.loading_details', 'Loading work order details...')}</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-slate-400 font-bold text-sm">{t('admin.tech_requests.not_found', 'Technician request not found')}</div>
        <Link
          to={basePath}
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
        >
          Back to Technician Requests
        </Link>
      </div>
    );
  }

  const reqNo = formatWorkOrderCode(request.id, request.code);
  const urgencyCfg = getUrgencyConfig(request.urgency);
  const statusCfg = getStatusConfig(request.status);
  const depot = formatDisplayValue(request.depot_name || request.depot?.name);
  const vehicle = formatDisplayValue(request.bus_number || request.vehicle?.bus_number || request.vehicle?.registration_number);
  const tech = request.assignedTechnician || request.technician;
  const slaCountdown = formatSlaCountdown(request.sla_due_at, request.status);
  const canEdit = Boolean(request.capabilities?.canEdit);
  const canRate = Boolean(request.capabilities?.canRate);
  const activities = request.activities || request.activityLogs || [];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16 min-w-0 max-w-full overflow-hidden">
      {/* 1. Breadcrumb Navigation & Action Header */}
      <div className="w-full p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm min-w-0 overflow-hidden">
        <Breadcrumb
          items={[
            { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
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
              <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-md border ${urgencyCfg.color}`}>
                {urgencyCfg.badge} Priority
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
              Issue Category: <strong className="text-slate-700 dark:text-zinc-200">{formatDisplayValue(request.issue_category)}</strong> • Created: {formatExactDateTime(request.created_at || request.requested_at)}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            {canEdit && (
              <Link
                to={`${basePath}/edit/${request.id}`}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer text-center"
              >
                <FleetIcons.Edit className="w-3.5 h-3.5 text-white" />
                <span>{t('admin.tech_requests.edit_details_btn', 'Edit Request')}</span>
              </Link>
            )}

            {canRate && !request.rating && (
              <Link
                to={`${basePath}/${request.id}/rate`}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer text-center active:scale-95"
              >
                <FleetIcons.Star className="w-4 h-4 text-white" filled />
                <span>{t('admin.tech_requests.rate_technician_btn', 'Rate Technician')}</span>
              </Link>
            )}

            {Boolean(request.rating) && (
              <div
                className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 w-full sm:w-auto select-none"
              >
                <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verified Rating ({request.rating}★ Final)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. 4-Stat Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
            {t('admin.tech_requests.target_depot', 'Target Depot')}
          </span>
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
            {depot}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            Depot Hub
          </p>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
            {t('admin.tech_requests.target_bus', 'Target Vehicle')}
          </span>
          <div className="text-sm sm:text-base font-mono font-bold text-blue-600 dark:text-blue-400 truncate">
            {vehicle}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            Transit Fleet Asset
          </p>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
            {t('admin.tech_requests.th_technician', 'Assigned Technician')}
          </span>
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
            {tech ? formatDisplayValue(tech.name) : 'Pending assignment'}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">
            {tech ? formatDisplayValue(tech.phone || tech.email) : 'Central pool'}
          </p>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            {t('admin.tech_requests.resolution_sla', 'Resolution SLA')}
          </span>
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
            {slaCountdown ? (
              <span className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-md border ${slaCountdown.color}`}>
                {slaCountdown.text}
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-normal">Pending assignment</span>
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            {request.eta ? `ETA: ${request.eta}` : '—'}
          </p>
        </div>
      </div>

      {/* 3. Details & Findings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0 max-w-full">
        {/* Request Description */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm min-w-0 overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-1.5">
            <FleetIcons.Document className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{t('admin.tech_requests.initial_issue_desc', 'Initial Request Description')}</span>
          </h3>
          <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium leading-relaxed break-words [overflow-wrap:anywhere] break-all">
            {formatDisplayValue(request.description, 'Not provided')}
          </p>
        </div>

        {/* Central Dispatch Instructions */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm min-w-0 overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-1.5">
            <FleetIcons.Wrench className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{t('admin.tech_requests.dispatch_instructions', 'Central Dispatch Instructions')}</span>
          </h3>
          <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium leading-relaxed break-words [overflow-wrap:anywhere] break-all">
            {formatDisplayValue(request.instructions, 'Not provided')}
          </p>
          {request.assignedByUser && (
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 pt-1 font-mono break-words [overflow-wrap:anywhere] break-all">
              Dispatched by: {formatDisplayValue(request.assignedByUser.name)} ({formatDisplayValue(request.assignedByUser.email)})
            </div>
          )}
        </div>
      </div>

      {/* 4. Resolution Findings */}
      {request.resolution_notes && (
        <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm bg-emerald-50/20 min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-emerald-100 dark:border-emerald-900/60 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{t('admin.tech_requests.findings_results', 'Resolution Findings')}</span>
            </h3>
            {request.resolved_at && (
              <span className="text-[10px] font-mono font-normal text-slate-400">
                ({formatExactDateTime(request.resolved_at)})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed font-medium break-words [overflow-wrap:anywhere] break-all">
            {request.resolution_notes}
          </p>
          {request.resolvedByUser && (
            <div className="text-[10px] text-slate-400 font-mono pt-1 break-words [overflow-wrap:anywhere] break-all">
              Verified & closed by: {formatDisplayValue(request.resolvedByUser.name)}
            </div>
          )}
        </div>
      )}

      {/* 4.5 Technician Performance Rating */}
      {request.rating ? (
        <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm bg-gradient-to-br from-amber-50/20 via-white to-transparent dark:from-amber-950/10 dark:via-zinc-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 dark:border-amber-900/50 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <FleetIcons.Star className="w-5 h-5 text-amber-500" filled />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span>{t('admin.tech_requests.client_rating', 'Client Service Rating')}</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                    {request.rating}.0 / 5.0
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                  Verified rating for technician {tech?.name ? formatDisplayValue(tech.name) : 'Technician'}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold self-start sm:self-auto select-none">
              <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('admin.tech_requests.verified_rating_locked', 'Verified Rating Locked')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <FleetIcons.Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= request.rating
                      ? 'text-amber-400 fill-amber-400 filter drop-shadow-xs'
                      : 'text-slate-200 dark:text-zinc-700'
                  }`}
                  filled={s <= request.rating}
                />
              ))}
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 ml-2">
                {request.rating === 5 ? 'Exceptional 5★ Service' : request.rating >= 4 ? 'Very Good Service' : 'Satisfactory Service'}
              </span>
            </div>

            {Array.isArray(request.rating_tags) && request.rating_tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {request.rating_tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 shadow-2xs flex items-center gap-1"
                  >
                    <FleetIcons.Check className="w-3.5 h-3.5 text-amber-800 dark:text-amber-300 inline" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}

            {request.rating_comment && (
              <p className="text-xs text-slate-700 dark:text-zinc-200 bg-white/70 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 leading-relaxed font-medium break-words">
                "{request.rating_comment}"
              </p>
            )}

            <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono pt-1">
              Rated by {formatDisplayValue(request.ratedByUser?.name)} • {formatExactDateTime(request.rated_at)}
            </div>
          </div>
        </div>
      ) : null}

      {/* 5. Complete Activity Logs & Audit Trail Timeline */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3.5">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-xs">
                <FleetIcons.Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </span>
              <span>{t('admin.tech_requests.activity_audit_trail', 'Activity & Audit Trail')}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Verified actor credentials, role designations, dispatch timestamps, and lifecycle transitions.
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
            {activities.length} Events
          </span>
        </div>

        {activities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs font-medium bg-slate-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
            No activity log entries recorded for this work order.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 min-w-0 max-w-full overflow-hidden before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-purple-500/30">
            {activities.map((log, idx) => {
              const relativeTime = formatRelativeTime(log.created_at);
              const exactTime = formatExactDateTime(log.created_at);
              const actor = log.actor || {};
              const isSystemActor = Boolean(actor.isSystem || log.causer_type === 'System' || (!actor.name && !log.actor_name && !log.causer_id));
              const actorName = isSystemActor ? 'System' : formatDisplayValue(actor.name || log.actor_name, 'Actor unavailable');
              const actorEmail = actor.email || log.actor_email;
              const actorRole = actor.roleCode || log.actor_role;
              const roleCfg = isSystemActor ? { label: 'System', color: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700' } : getRoleBadgeConfig(actorRole);
              const eventCfg = getEventBadgeConfig(log.event, log.description);
              const auditProps = extractAuditProperties(log.properties);
              const actorInitial = (isSystemActor ? 'S' : (actorName.charAt(0) || 'U')).toUpperCase();

              return (
                <div key={log.id || idx} className="relative group min-w-0 max-w-full">
                  {/* Timeline Dot Node */}
                  <div className="absolute -left-6 sm:-left-8 top-3 flex items-center justify-center">
                    <span className={`w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${eventCfg.dotClass} shadow-md group-hover:scale-125 transition-transform`} />
                  </div>

                  <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/90 rounded-2xl space-y-3.5 shadow-xs hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-800/70 min-w-0 max-w-full overflow-hidden">
                    {/* Row 1: Actor Identity & Time Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 dark:border-zinc-800/80 pb-3">
                      {/* Actor Information */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0 uppercase">
                          {actorInitial}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
                              {actorName}
                            </span>

                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleCfg.color}`}>
                              <span>{roleCfg.label}</span>
                            </span>
                          </div>

                          <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate mt-0.5 flex items-center gap-2">
                            {actorEmail && <span className="truncate">{actorEmail}</span>}
                            {actor.id && (
                              <span className="text-[10px] bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.2 rounded text-slate-600 dark:text-zinc-300 font-mono shrink-0">
                                ID: #{actor.id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Time Details */}
                      <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1 shrink-0 bg-white/70 dark:bg-zinc-800/50 p-2 sm:p-0 rounded-xl sm:bg-transparent border border-slate-100 sm:border-0 dark:border-zinc-800">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 shadow-xs">
                          <FleetIcons.Clock className="w-3.5 h-3.5" />
                          <span>{relativeTime || 'Just now'}</span>
                        </span>

                        <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 mt-0.5">
                          <FleetIcons.Clock className="w-3 h-3 text-slate-400" />
                          <span>{exactTime}</span>
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Event Type Badge & Description */}
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${eventCfg.badgeClass}`}>
                          <span>{eventCfg.label}</span>
                        </span>

                        {log.severity && log.severity !== 'INFO' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                            {log.severity}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-800 dark:text-zinc-200 font-medium leading-relaxed break-words [overflow-wrap:anywhere] break-all">
                        {log.description || 'Work order event recorded.'}
                      </p>
                    </div>

                    {/* Row 3: Audit Parameters & Properties */}
                    {auditProps.length > 0 && (
                      <div className="p-3 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl space-y-1.5 min-w-0 max-w-full overflow-hidden">
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
        )}
      </div>

      {/* 6. Bottom Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Link
          to={basePath}
          className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('admin.tech_requests.back_to_requests', 'Back to Technician Requests')}</span>
        </Link>

        {canEdit && (
          <Link
            to={`${basePath}/edit/${request.id}`}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <FleetIcons.Edit className="w-3.5 h-3.5 text-white" />
            <span>{t('admin.tech_requests.edit_request', 'Edit Request')}</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default AdminTechRequestDetailsPage;
