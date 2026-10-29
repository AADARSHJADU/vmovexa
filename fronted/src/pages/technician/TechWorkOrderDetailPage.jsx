import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

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
    label: 'Pending Assignment',
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

function formatSlaCountdown(slaDueAt, status) {
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
      text: `SLA Overdue by ${timeStr}`,
      color: 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-800 font-bold animate-pulse',
    };
  }
  const remMins = Math.round(diff / (60 * 1000));
  const h = Math.floor(remMins / 60);
  const m = remMins % 60;
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return {
    type: 'pending',
    text: `SLA Target: ${timeStr} remaining`,
    color: diff < 3600 * 1000
      ? 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 font-bold'
      : 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  };
}

export const TechWorkOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isSuperAdmin = window.location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/technician' : '/technician';

  const {
    selectedWorkOrder: order,
    workOrderDetailLoading: loading,
    actionLoading,
    loadWorkOrderDetail,
    clearWorkOrderDetail,
    setWorkOrderStatus,
  } = useTechnicianApp();

  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [checklist, setChecklist] = useState({
    hardwareFixed: true,
    firmwareUpdated: false,
    diagnosticsPassed: true,
    telemetryVerified: true,
  });

  const fetchDetail = useCallback(() => {
    if (id) {
      loadWorkOrderDetail(id).catch((err) => {
        toast.error(err?.message || 'Work order not found or access denied');
      });
    }
  }, [id, loadWorkOrderDetail]);

  useEffect(() => {
    fetchDetail();
    return () => {
      clearWorkOrderDetail();
    };
  }, [fetchDetail, clearWorkOrderDetail]);

  // Action: Mark Arrived On-Site
  const handleMarkOnSite = async () => {
    if (!order) return;
    try {
      await toast.promise(
        setWorkOrderStatus(order.id, 'on_site'),
        {
          loading: 'Updating arrival status...',
          success: 'Status updated to On-Site!',
          error: (err) => err?.message || 'Failed to update status',
        }
      );
      fetchDetail();
    } catch {
      // toast.promise displays the API error.
    }
  };

  // {t('technician.work_orders.submit_resolution')}
  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!order) return;
    if (!resolutionNotes.trim()) {
      toast.error('Please describe what was repaired or resolved.');
      return;
    }

    const checks = [];
    if (checklist.hardwareFixed) checks.push('Hardware Repaired');
    if (checklist.firmwareUpdated) checks.push('Firmware Updated');
    if (checklist.diagnosticsPassed) checks.push('Self-Test Passed');
    if (checklist.telemetryVerified) checks.push('Live GPS Verified');

    const fullNotes = `${resolutionNotes.trim()}${checks.length > 0 ? `\n[Checklist: ${checks.join(', ')}]` : ''}`;

    try {
      await toast.promise(
        setWorkOrderStatus(order.id, 'resolved', fullNotes),
        {
          loading: 'Submitting resolution notes...',
          success: 'Work order marked resolved successfully!',
          error: (err) => err?.message || 'Failed to resolve work order',
        }
      );
      setIsResolveModalOpen(false);
      fetchDetail();
    } catch {
      // toast.promise displays the API error.
    }
  };

  const copyCode = () => {
    if (order?.code) {
      navigator.clipboard.writeText(order.code);
      toast.success(`Copied ${order.code} to clipboard!`);
    }
  };

  if (loading && !order) {
    return (
      <div className="w-full p-12 text-center space-y-4 animate-in fade-in duration-200">
        <div className="w-10 h-10 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
          Loading work order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <FleetIcons.Alert className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-base font-black text-slate-900 dark:text-white">
          Work Order Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
          The requested work order could not be loaded or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate(`${basePath}/work-orders`)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          Back to Work Orders
        </button>
      </div>
    );
  }

  const statusCfg = STATUS_BADGES[order.status] || {
    label: order.status,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };
  const urgencyCls = URGENCY_BADGES[order.urgency] || URGENCY_BADGES.normal;
  const slaInfo = formatSlaCountdown(order.sla_due_at, order.status);

  // Robust Arrived On-Site timestamp detection
  const onSiteTime = order.on_site_at || (['on_site', 'resolved', 'closed'].includes(order.status) ? (order.updated_at || order.updatedAt) : null);

  // Stepper steps (Streamlined for Field Execution)
  const steps = [
    {
      key: 'dispatched',
      label: '1. Dispatched',
      done: true,
      time: order.dispatched_at,
    },
    {
      key: 'on_site',
      label: '2. Arrived On-Site',
      done: ['on_site', 'resolved', 'closed'].includes(order.status),
      active: order.status === 'on_site',
      time: onSiteTime,
    },
    {
      key: 'resolved',
      label: '3. Resolved & Tested',
      done: ['resolved', 'closed'].includes(order.status),
      active: order.status === 'resolved',
      time: order.resolved_at,
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <Breadcrumb
          items={[
            { label: isSuperAdmin ? 'Super Admin' : 'Technician', path: isSuperAdmin ? '/superadmin/dashboard' : '/technician/dashboard' },
            ...(isSuperAdmin ? [{ label: 'Technician', path: '/superadmin/technician/work-orders' }] : []),
            { label: 'Work Orders', path: `${basePath}/work-orders` },
            { label: order.code },
          ]}
          className="mb-1"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-200 dark:border-blue-800 shadow-sm shrink-0">
              <FleetIcons.Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {order.code}
                </h1>
                <button
                  onClick={copyCode}
                  title={t('technician.work_orders.copy_code')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <FleetIcons.Copy className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
                </button>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`}></span>
                  <span>{statusCfg.label}</span>
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md border ${urgencyCls}`}
                >
                  {order.urgency || 'normal'} Urgency
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
                Assigned on {order.dispatched_at ? new Date(order.dispatched_at).toLocaleString() : new Date(order.createdAt).toLocaleString()}
                {order.assignedByUser?.name && ` by ${order.assignedByUser.name}`}
              </p>
            </div>
          </div>

          {/* SLA Pill / Badge */}
          {slaInfo && (
            <div className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 ${slaInfo.color}`}>
              {slaInfo.type === 'overdue' ? (
                <FleetIcons.Alert className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
              ) : slaInfo.type === 'resolved' ? (
                <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <FleetIcons.Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
              <span>{slaInfo.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Lifecycle Action Card & Stepper */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Field Execution Lifecycle
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              Current progress and mandatory stage updates for this ticket
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {order.status === 'dispatched' && (
              <button
                onClick={handleMarkOnSite}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <FleetIcons.Pin className="w-3.5 h-3.5 text-white" />
                <span>{t('technician.work_orders.mark_arrived')}</span>
              </button>
            )}

            {order.status === 'on_site' && (
              <button
                onClick={() => setIsResolveModalOpen(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                <span>{t('technician.work_orders.resolve_job')}</span>
              </button>
            )}

            {['resolved', 'closed'].includes(order.status) && (
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold">
                  <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('technician.work_orders.completed_tested')}</span>
                </div>
                {order.status === 'closed' && (
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1.5 rounded-xl">
                    Archived by Depot
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stepper Visualization */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
          {steps.map((s) => (
            <div
              key={s.key}
              className={`p-3.5 rounded-xl border transition-all min-w-0 ${
                s.active
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                  : s.done
                  ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{s.label}</span>
                {s.done ? (
                  <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : s.active ? (
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full border border-slate-300 dark:border-zinc-600 shrink-0"></span>
                )}
              </div>
              {s.time ? (
                <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mt-1">
                  {new Date(s.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              ) : s.done ? (
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 italic">
                  Recorded
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                  Pending arrival
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0 w-full">
        {/* Left 2 Cols: Issue & Depot Details */}
        <div className="lg:col-span-2 space-y-6 min-w-0 max-w-full">
          {/* Issue & Symptoms Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 overflow-hidden min-w-0">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 truncate">
                <FleetIcons.Document className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{t('technician.work_orders.issue_symptoms')}</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500 shrink-0">
                Category: <span className="text-blue-600 dark:text-blue-400">{order.issue_category || 'Hardware Issue'}</span>
              </span>
            </div>

            <div className="space-y-3 text-xs min-w-0">
              <div className="min-w-0">
                <span className="font-bold text-slate-700 dark:text-zinc-300">{t('technician.work_orders.reported_problem')}</span>
                <div className="mt-1 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere] break-all overflow-hidden max-w-full">
                  {order.description || 'No detailed description provided by requester.'}
                </div>
              </div>

              {order.instructions && (
                <div className="min-w-0">
                  <span className="font-bold text-amber-700 dark:text-amber-400">
                    Dispatcher / Supervisor Instructions:
                  </span>
                  <div className="mt-1 p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 whitespace-pre-wrap leading-relaxed font-medium break-words [overflow-wrap:anywhere] break-all overflow-hidden max-w-full">
                    {order.instructions}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resolution Card (if resolved) */}
          {order.resolution_notes && (
            <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3 overflow-hidden min-w-0">
              <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800 pb-3 gap-2">
                <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2 truncate">
                  <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{t('technician.work_orders.resolution_record')}</span>
                </h3>
                {order.resolved_at && (
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 shrink-0">
                    Resolved {new Date(order.resolved_at).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-100 dark:border-emerald-900 break-words [overflow-wrap:anywhere] break-all overflow-hidden max-w-full">
                {order.resolution_notes}
              </div>
            </div>
          )}

          {/* Client Feedback & Performance Rating Card (if rated) */}
          {Boolean(order.rating) && (
            <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 overflow-hidden min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200/60 dark:border-amber-900/40 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                    <FleetIcons.Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                      Client Performance Review
                    </h3>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      Verified customer feedback on ticket resolution
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 shadow-xs self-start sm:self-auto">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FleetIcons.Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= order.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 dark:text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-white ml-1">
                    {order.rating}.0
                  </span>
                  <span className="text-xs text-slate-400">/ 5</span>
                </div>
              </div>

              {order.rating_comment && (
                <div className="text-xs text-slate-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-amber-100 dark:border-zinc-800 break-words [overflow-wrap:anywhere] break-all overflow-hidden max-w-full italic">
                  "{order.rating_comment}"
                </div>
              )}

              {Array.isArray(order.rating_tags) && order.rating_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {order.rating_tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100/70 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                    >
                      <FleetIcons.Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {order.rated_at && (
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 pt-1">
                  Submitted on {new Date(order.rated_at).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Activity Logs & Audit History */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 overflow-hidden min-w-0">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FleetIcons.Clock className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{t('technician.work_orders.audit_trail')}</span>
            </h3>

            {Array.isArray(order.activityLogs) && order.activityLogs.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {order.activityLogs.map((log) => (
                  <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-xs min-w-0">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-zinc-200 break-words [overflow-wrap:anywhere]">
                        {log.description || log.action || 'Activity recorded'}
                      </p>
                      {log.causer_name && (
                        <p className="text-[11px] text-slate-400 truncate">
                          by <strong className="text-slate-600 dark:text-zinc-400">{log.causer_name}</strong>
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {new Date(log.createdAt || log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                Initial dispatch logged.
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Vehicle, Depot & Contact Cards */}
        <div className="space-y-6 min-w-0 max-w-full">
          {/* Vehicle Information */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 overflow-hidden min-w-0">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                <FleetIcons.Bus className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">
                  Target Vehicle
                </h3>
                <span className="text-[11px] text-slate-400 truncate block">{t('technician.work_orders.transit_assignment')}</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 min-w-0 gap-2">
                <span className="text-slate-500 font-medium shrink-0">{t('technician.work_orders.bus_registration')}</span>
                <strong className="text-sm font-mono font-black text-slate-900 dark:text-white truncate">
                  {order.bus_number || 'Unassigned'}
                </strong>
              </div>

              {order.vehicle?.model && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 min-w-0 gap-2">
                  <span className="text-slate-500 font-medium shrink-0">{t('technician.work_orders.chassis_model')}</span>
                  <strong className="text-slate-800 dark:text-zinc-200 truncate">{order.vehicle.model}</strong>
                </div>
              )}

              {order.organization?.name && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 min-w-0 gap-2">
                  <span className="text-slate-500 font-medium shrink-0">{t('technician.work_orders.operating_fleet')}</span>
                  <strong className="text-slate-800 dark:text-zinc-200 truncate">{order.organization.name}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Depot & Yard Location */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 overflow-hidden min-w-0">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <FleetIcons.Pin className="w-4 h-4 text-amber-500" />
              </span>
              <div className="min-w-0">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">
                  Depot Location
                </h3>
                <span className="text-[11px] text-slate-400 truncate block">{t('technician.work_orders.field_site')}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="min-w-0">
                <span className="text-slate-500 font-medium">{t('technician.work_orders.depot_name')}</span>
                <p className="mt-0.5 font-bold text-slate-900 dark:text-white text-sm truncate">
                  {order.depot_name || order.depot?.name || 'Main Transit Yard'}
                </p>
              </div>

              {order.eta && (
                <div className="min-w-0">
                  <span className="text-slate-500 font-medium">{t('technician.work_orders.eta_label')}</span>
                  <p className="mt-0.5 font-bold text-blue-600 dark:text-blue-400 truncate">
                    {order.eta}
                  </p>
                </div>
              )}

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  (order.depot_name || order.depot?.name || 'Depot') + ' depot bus stand'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold transition-colors"
              >
                <FleetIcons.Map className="w-3.5 h-3.5" />
                <span>{t('technician.work_orders.open_maps')}</span>
              </a>
            </div>
          </div>

          {/* Requesting Tenant Contact */}
          {order.requestedBy && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 overflow-hidden min-w-0">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <span className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                  <FleetIcons.Phone className="w-4 h-4 text-purple-500" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">
                    Depot Contact
                  </h3>
                  <span className="text-[11px] text-slate-400 truncate block">{t('technician.work_orders.requester_onsite')}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="min-w-0">
                  <span className="text-slate-500 font-medium">{t('common.name')}:</span>
                  <p className="font-bold text-slate-900 dark:text-white truncate">{order.requestedBy.name}</p>
                </div>

                {order.requestedBy.phone && (
                  <div className="min-w-0">
                    <span className="text-slate-500 font-medium">{t('common.phone')}:</span>
                    <p>
                      <a
                        href={`tel:${order.requestedBy.phone}`}
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1.5 mt-0.5 truncate"
                      >
                        <FleetIcons.Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{order.requestedBy.phone}</span>
                      </a>
                    </p>
                  </div>
                )}

                {order.requestedBy.email && (
                  <div className="min-w-0">
                    <span className="text-slate-500 font-medium">{t('common.email')}:</span>
                    <p>
                      <a
                        href={`mailto:${order.requestedBy.email}`}
                        className="font-mono text-slate-700 dark:text-zinc-300 hover:text-blue-600 break-all mt-0.5 block"
                      >
                        {order.requestedBy.email}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resolution Notes Modal */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Submit Work Order Resolution
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    {order.code} · Vehicle {order.bus_number || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-lg"
              >
                <FleetIcons.Close className="w-4 h-4" />
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
                  placeholder="Describe diagnosis and repair performed (e.g. Replaced power connector, verified boot sequence, display telemetry broadcasting live)."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Service Completion Checklist */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Verification Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.hardwareFixed}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, hardwareFixed: e.target.checked }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      Hardware Repaired
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.diagnosticsPassed}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, diagnosticsPassed: e.target.checked }))
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
                      checked={checklist.telemetryVerified}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, telemetryVerified: e.target.checked }))
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
                      checked={checklist.firmwareUpdated}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, firmwareUpdated: e.target.checked }))
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
                  onClick={() => setIsResolveModalOpen(false)}
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
                      <span>{t('technician.work_orders.submit_resolution')}</span>
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

export default TechWorkOrderDetailPage;
