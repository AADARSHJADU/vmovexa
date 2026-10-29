import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { resolveFileUrl } from '../../api/services/upload.service.js';

export const GovEmergencyDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const dashboardPath = isSuperAdmin ? '/superadmin/dashboard' : '/government/dashboard';
  const parentLabel = isSuperAdmin ? 'Super Admin' : 'Government';
  const listPath = isSuperAdmin ? '/superadmin/government/emergency' : '/government/emergency';

  const {
    currentBroadcast,
    loading,
    loadBroadcastById,
    revokeBroadcast,
    approveBroadcast,
    rejectBroadcast,
    deleteBroadcast,
  } = useGovernmentRole();

  const [broadcast, setBroadcast] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setFetching(true);
    try {
      const data = await loadBroadcastById(id);
      setBroadcast(data);
    } catch (err) {
      toast.error(err?.message || 'Failed to load emergency broadcast details.');
    } finally {
      setFetching(false);
    }
  }, [id, loadBroadcastById]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Sync with currentBroadcast if updated in store
  useEffect(() => {
    if (currentBroadcast && String(currentBroadcast.id) === String(id)) {
      setBroadcast(currentBroadcast);
    }
  }, [currentBroadcast, id]);

  const handleRevoke = async () => {
    if (!broadcast) return;
    if (!window.confirm(`Are you sure you want to REVOKE emergency broadcast ${broadcast.code || `#${broadcast.id}`}? Connected transit screens will immediately restore normal scheduled loop.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await toast.promise(revokeBroadcast(broadcast.id), {
        loading: 'Revoking emergency override…',
        success: 'Emergency override revoked! Screens restoring normal loop.',
        error: (e) => e?.message || 'Failed to revoke broadcast.',
      });
      fetchDetail();
    } catch {
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!broadcast) return;
    setActionLoading(true);
    try {
      await toast.promise(approveBroadcast(broadcast.id), {
        loading: 'Approving & dispatching emergency broadcast override…',
        success: `Broadcast ${broadcast.code || `#${broadcast.id}`} approved and broadcast live to transit screens!`,
        error: (e) => e?.message || 'Approval failed.',
      });
      fetchDetail();
    } catch {
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!broadcast) return;
    const reason = window.prompt(`Enter reason for rejecting broadcast ${broadcast.code || `#${broadcast.id}`}:`);
    if (reason === null) return;
    setActionLoading(true);
    try {
      await toast.promise(rejectBroadcast(broadcast.id, reason), {
        loading: 'Rejecting emergency submission…',
        success: 'Emergency submission rejected.',
        error: (e) => e?.message || 'Rejection failed.',
      });
      fetchDetail();
    } catch {
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!broadcast) return;
    if (!window.confirm(`Are you sure you want to permanently delete emergency broadcast ${broadcast.code || `#${broadcast.id}`}? This action cannot be undone.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await toast.promise(deleteBroadcast(broadcast.id), {
        loading: 'Deleting emergency broadcast…',
        success: 'Emergency broadcast permanently deleted!',
        error: (e) => e?.message || 'Failed to delete broadcast.',
      });
      navigate(listPath);
    } catch {
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return String(d);
    }
  };

  if (fetching && !broadcast) {
    return (
      <div className="w-full space-y-6 pb-12 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-zinc-800 rounded"></div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl h-36"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl"></div>
          <div className="h-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!broadcast) {
    return (
      <div className="w-full py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center">
          <FleetIcons.Alert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('gov.emergency.not_found_title')}</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{t('gov.emergency.not_found_desc')}</p>
        <Link
          to={listPath}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold"
        >
          <FleetIcons.ArrowLeft className="w-4 h-4" />
          <span>{t('gov.emergency.back_directory')}</span>
        </Link>
      </div>
    );
  }

  const isAct = broadcast.active === true || broadcast.active === 1 || String(broadcast.active) === 'true';
  const st = String(broadcast.status || '').toLowerCase();
  const isPending = st === 'pending_approval' || st === 'pending';
  const isApproved = st === 'approved';
  const isRevoked = st === 'revoked';
  const isExpired = st === 'expired';

  // Crucial Rule: Can only edit if NOT approved and NOT active/revoked
  const canEdit = isPending && !isAct && !isApproved;

  const agencyName = broadcast.agency?.agency_name || broadcast.agency?.name || broadcast.authority || 'Sovereign Government Authority';

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Breadcrumb */}
      <Breadcrumb
        items={[
          { label: parentLabel, path: dashboardPath, icon: FleetIcons.Dashboard },
          { label: 'Emergency Broadcasts', path: listPath },
          { label: broadcast.code || `Alert #${broadcast.id}` },
        ]}
        className="mb-1"
      />

      {/* 2. Top Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              {broadcast.code || `EMG-${broadcast.id}`}
            </span>

            {/* Severity Pill */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              String(broadcast.severity).toLowerCase() === 'critical'
                ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 shadow-xs'
                : String(broadcast.severity).toLowerCase() === 'high'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
            }`}>
              <FleetIcons.Siren className="w-3.5 h-3.5 animate-pulse" />
              <span>{broadcast.severity || 'Critical'} Priority</span>
            </span>

            {/* Status Pill */}
            {isAct ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{t('gov.emergency.live_active')}</span>
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                <FleetIcons.Clock className="w-3 h-3 text-amber-600" />
                <span>{t('gov.emergency.pending_superadmin')}</span>
              </span>
            ) : isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
                <FleetIcons.Check className="w-3 h-3 text-blue-600" />
                <span>{t('gov.emergency.approved_broadcast')}</span>
              </span>
            ) : isRevoked ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                <FleetIcons.Close className="w-3 h-3 text-rose-600" />
                <span>{t('gov.emergency.override_revoked')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                <span>{t('gov.emergency.expired_broadcast')}</span>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            {broadcast.headline || broadcast.title || 'Emergency Advisory'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Issued by <strong className="text-slate-700 dark:text-zinc-300">{agencyName}</strong> on {formatDate(broadcast.created_at || broadcast.createdAt)}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={listPath}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('gov.emergency.back_to_list')}</span>
          </Link>

          {/* EDIT BUTTON: Only visible/enabled when NOT approved */}
          {canEdit ? (
            <Link
              to={`${listPath}/${broadcast.id}/edit`}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shadow-amber-500/20"
              title={t('gov.emergency.edit_broadcast')}
            >
              <FleetIcons.Edit className="w-3.5 h-3.5 text-white" />
              <span>{t('gov.emergency.edit_broadcast')}</span>
            </Link>
          ) : (
            <div
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-slate-400 dark:text-zinc-500 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-zinc-800 cursor-not-allowed"
              title={t('gov.emergency.edit_locked_hint')}
            >
              <FleetIcons.Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Edit Locked ({isApproved ? 'Approved' : isAct ? 'Live' : 'Terminated'})</span>
            </div>
          )}

          {/* REVOKE BUTTON if Live or Approved */}
          {(isAct || isApproved) && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRevoke}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shadow-red-500/20"
            >
              <FleetIcons.Close className="w-3.5 h-3.5 text-white" />
              <span>{t('gov.emergency.revoke_broadcast')}</span>
            </button>
          )}

          {/* DELETE BUTTON if Unapproved or Terminated */}
          {!(isAct || isApproved) && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleDelete}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5 cursor-pointer"
              title={t('gov.emergency.delete_broadcast')}
            >
              <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500" />
              <span>{t('gov.emergency.delete_broadcast')}</span>
            </button>
          )}

          {/* SuperAdmin Approve & Reject Controls */}
          {isSuperAdmin && isPending && (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
              >
                Reject Submission
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shadow-emerald-500/20"
              >
                <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                <span>{t('gov.emergency.approve_override')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. Status Warning / Notice Alert Banner */}
      {isAct && (
        <div className="w-full bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <FleetIcons.Siren className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-black tracking-wide">{t('gov.emergency.active_preemption')}</p>
              <p className="text-xs text-red-100 mt-0.5">{t('gov.emergency.preemption_desc')}</p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-xl bg-white/20 text-xs font-mono font-bold tracking-wider uppercase">
            Auto-Expires: {broadcast.auto_expire || '6 Hours'}
          </span>
        </div>
      )}

      {isPending && (
        <div className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 text-amber-900 dark:text-amber-200">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FleetIcons.Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-bold">{t('gov.emergency.awaiting_clearance')}</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              This advisory has been submitted and is currently in verification. While pending, you can make modifications by clicking <strong className="underline">{t('gov.emergency.edit_broadcast')}</strong> above.
            </p>
          </div>
        </div>
      )}

      {isRevoked && (
        <div className="w-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs">
          <FleetIcons.Close className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold">{t('gov.emergency.overridden_revoked')}</span>
            <span className="ml-1">Revoked on {formatDate(broadcast.revoked_at)}. All transit screens have restored regular scheduling.</span>
          </div>
        </div>
      )}

      {broadcast.rejection_reason && (
        <div className="w-full bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 rounded-2xl p-4 text-xs text-red-800 dark:text-red-300 space-y-1">
          <span className="font-bold flex items-center gap-1.5">
            <FleetIcons.Close className="w-4 h-4 text-red-600" />
            <span>{t('gov.emergency.superadmin_rejection')}</span>
          </span>
          <p className="pl-5 text-red-700 dark:text-red-300 font-medium">{broadcast.rejection_reason}</p>
        </div>
      )}

      {/* 4. Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Visual Asset & Message Display */}
        <div className="lg:col-span-2 space-y-6">

          {/* Visual Creative Display */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FleetIcons.Image className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                  Transit Screen Override Visual
                </h3>
              </div>
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                {broadcast.media_type ? broadcast.media_type.toUpperCase() : 'TEXT-ONLY PREEMPTION'}
              </span>
            </div>

            {broadcast.media_url ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-black min-h-[260px] max-h-[460px] flex items-center justify-center relative shadow-inner">
                {broadcast.media_type === 'video' ? (
                  <video
                    src={resolveFileUrl(broadcast.media_url) || broadcast.media_url}
                    controls
                    autoPlay
                    muted
                    loop
                    className="w-full max-h-[460px] object-contain"
                  />
                ) : (
                  <img
                    src={resolveFileUrl(broadcast.media_url) || broadcast.media_url}
                    alt="Emergency Creative"
                    className="w-full max-h-[460px] object-contain"
                  />
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 p-8 text-center space-y-2">
                <FleetIcons.Megaphone className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.emergency.no_media')}</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Transit displays will render this alert in standard high-contrast red warning typography with civil defense banner.
                </p>
              </div>
            )}
          </div>

          {/* Full Advisory Message & Screen Ticker */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <FleetIcons.Megaphone className="w-4 h-4 text-red-600 dark:text-red-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Full Advisory Text &commat; Screens
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('gov.emergency.headline')}</span>
                <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {broadcast.headline || broadcast.title}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('gov.emergency.message_content')}</span>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap mt-1">
                  {broadcast.message || broadcast.body_text || 'No detailed message specified.'}
                </div>
              </div>

              {/* Ticker marquee preview */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('gov.emergency.bottom_ticker')}</span>
                <div className="w-full bg-red-600 text-white rounded-xl py-2 px-3 overflow-hidden shadow-inner flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-red-900/60 text-[10px] font-black tracking-widest uppercase rounded shrink-0">
                    URGENT
                  </span>
                  <div className="overflow-hidden whitespace-nowrap text-xs font-mono font-bold tracking-wide">
                    {broadcast.ticker_text || broadcast.message || broadcast.headline}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Targeting, Schedule, Authority Specs */}
        <div className="space-y-6">

          {/* Target Network & Reach */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <FleetIcons.Target className="w-4 h-4 text-red-600 dark:text-red-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Targeting & Reach
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('gov.emergency.broadcast_scope_label')}</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">
                  {broadcast.target_scope === 'all' ? 'Entire Transit Network' : 'Selected Corridors / Fleets'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('gov.emergency.target_area_label')}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {broadcast.target_area || (broadcast.target_scope === 'all' ? 'All Operating Zones' : 'Specified Routes')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('gov.emergency.affected_displays_label')}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {broadcast.affected_buses_count || (broadcast.target_scope === 'all' ? 'All Online Displays' : 'Targeted Screens')}
                </span>
              </div>

              {/* Target Routes list if present */}
              {Array.isArray(broadcast.target_routes) && broadcast.target_routes.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-400 font-semibold block mb-1.5">Specified Routes ({broadcast.target_routes.length}):</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {broadcast.target_routes.map((rt, i) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[11px] flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">{rt.routeName || `Route #${rt.routeId}`}</span>
                        <span className="text-slate-400 text-[10px]">{rt.city || 'Transit Line'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Schedule & Timing Audit */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <FleetIcons.Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Schedule & Auto-Expiry
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('gov.emergency.auto_expire_duration_label')}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {broadcast.auto_expire || '6 Hours'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('gov.emergency.submitted_at_label')}</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200">
                  {formatDate(broadcast.created_at || broadcast.createdAt)}
                </span>
              </div>

              {broadcast.expires_at && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('gov.emergency.auto_expiry_at_label')}</span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200">
                    {formatDate(broadcast.expires_at)}
                  </span>
                </div>
              )}

              {broadcast.approved_at && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('gov.emergency.approved_at_label')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatDate(broadcast.approved_at)}
                  </span>
                </div>
              )}

              {broadcast.revoked_at && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('gov.emergency.revoked_at_label')}</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {formatDate(broadcast.revoked_at)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Telemetry & Notification Channels */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <FleetIcons.Shield className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Dispatch Protocols
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('gov.emergency.push_notifications_label')}</span>
                <span className={`font-bold ${broadcast.push_notification ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {broadcast.push_notification ? 'Dispatched to Fleet & Crew' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('gov.emergency.siren_sound_label')}</span>
                <span className={`font-bold ${broadcast.siren_sound ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                  {broadcast.siren_sound ? 'High-Decibel Siren' : 'Silent Preemption'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('gov.emergency.audio_chime_label')}</span>
                <span className={`font-bold ${broadcast.audio_chime_enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {broadcast.audio_chime_enabled ? 'Audible Chime On' : 'Off'}
                </span>
              </div>
            </div>
          </div>

          {/* Issuing Authority Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 text-xs space-y-3">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
              Official Issuing Authority & Audit
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-bold">
                <FleetIcons.Building className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{agencyName}</p>
                <p className="text-[10px] text-slate-400">{broadcast.agency?.department || 'Civil Defense & Transit Oversight'}</p>
              </div>
            </div>

            {broadcast.creator && (
              <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{t('gov.emergency.created_by_label')}</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300">{broadcast.creator.name} ({broadcast.creator.email})</span>
              </div>
            )}

            {broadcast.approver && (
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{t('gov.emergency.reviewed_by_label')}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{broadcast.approver.name}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default GovEmergencyDetailsPage;
