import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

const STATUS_UI = {
  pending_approval: { label: 'PENDING', cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  approved: { label: 'APPROVED · LIVE', cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  rejected: { label: 'REJECTED', cls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  revoked: { label: 'REVOKED', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
  expired: { label: 'EXPIRED', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
};

export const SuperEmergencyApprovalsPage = () => {
  const { broadcasts, loadBroadcasts, approveBroadcast, rejectBroadcast, revokeBroadcast } = useGovernmentRole();
  const [filter, setFilter] = useState('pending');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    loadBroadcasts({ active: 'all' }).catch(() => {});
  }, [loadBroadcasts]);

  const list = useMemo(() => {
    const arr = Array.isArray(broadcasts) ? broadcasts : (broadcasts?.items || broadcasts?.rows || []);
    if (filter === 'all') return arr;
    if (filter === 'pending') return arr.filter((b) => (b.status || 'pending_approval') === 'pending_approval');
    if (filter === 'live') return arr.filter((b) => b.status === 'approved');
    return arr;
  }, [broadcasts, filter]);

  const counts = useMemo(() => {
    const arr = Array.isArray(broadcasts) ? broadcasts : (broadcasts?.items || broadcasts?.rows || []);
    return {
      pending: arr.filter((b) => (b.status || 'pending_approval') === 'pending_approval').length,
      live: arr.filter((b) => b.status === 'approved').length,
      all: arr.length,
    };
  }, [broadcasts]);

  const refresh = () => loadBroadcasts({ active: 'all' }).catch(() => {});

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await toast.promise(approveBroadcast(id), {
        loading: 'Approving & broadcasting to all screens...',
        success: 'Approved! Emergency is now LIVE across transit screens.',
        error: (e) => e?.message || 'Approval failed',
      });
      await refresh();
    } catch { /* toast */ } finally { setBusyId(null); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejecting this emergency broadcast?') || '';
    setBusyId(id);
    try {
      await toast.promise(rejectBroadcast(id, reason), {
        loading: 'Rejecting...',
        success: 'Emergency broadcast rejected.',
        error: (e) => e?.message || 'Rejection failed',
      });
      await refresh();
    } catch { /* toast */ } finally { setBusyId(null); }
  };

  const handleRevoke = async (id) => {
    setBusyId(id);
    try {
      await toast.promise(revokeBroadcast(id), {
        loading: 'Revoking...',
        success: 'Broadcast revoked. Screens restored to normal.',
        error: (e) => e?.message || 'Revoke failed',
      });
      await refresh();
    } catch { /* toast */ } finally { setBusyId(null); }
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'SuperAdmin', to: '/superadmin/dashboard' },
          { label: 'Government', to: '/superadmin/government' },
          { label: 'Emergency Broadcast Approvals' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Emergency Broadcast Approvals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Review and approve government emergency overrides before they go live on all transit screens.</p>
        </div>
        <RefreshButton onClick={refresh} title="Refresh emergency broadcast approvals" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { k: 'pending', l: 'Pending', c: counts.pending },
          { k: 'live', l: 'Live', c: counts.live },
          { k: 'all', l: 'All', c: counts.all },
        ].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 ${filter === f.k ? 'bg-slate-900 text-white dark:bg-blue-600 border-slate-900 dark:border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            {f.l} <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${filter === f.k ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{f.c}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <FleetIcons.Siren className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <p className="text-base font-black text-slate-900 dark:text-white">No emergency broadcasts in this view</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Government-submitted emergencies awaiting approval will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((b) => {
            const status = b.status || 'pending_approval';
            const ui = STATUS_UI[status] || STATUS_UI.pending_approval;
            const busy = busyId === b.id;
            return (
              <div key={b.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded">{b.code || `EMG-${b.id}`}</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{b.headline || b.title || 'Emergency Advisory'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${ui.cls}`}>● {ui.label}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 uppercase">{b.severity || 'high'}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{b.body_text || b.message || '—'}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Area: {b.target_area || 'Platform-wide'} · Issued by: {b.issued_by || 'Authority'}
                      {status === 'rejected' && b.rejection_reason ? ` · Reason: ${b.rejection_reason}` : ''}
                      {status === 'approved' && b.affected_buses_count != null ? ` · ${b.affected_buses_count} screens` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                    {status === 'pending_approval' && (
                      <>
                        <button disabled={busy} onClick={() => handleApprove(b.id)} className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">Approve & Broadcast</button>
                        <button disabled={busy} onClick={() => handleReject(b.id)} className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50 transition-colors">Reject</button>
                      </>
                    )}
                    {status === 'approved' && (
                      <button disabled={busy} onClick={() => handleRevoke(b.id)} className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors">Revoke</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SuperEmergencyApprovalsPage;
