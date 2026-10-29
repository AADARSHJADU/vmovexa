import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { MultipleDocumentUploader } from '../../components/ui/MultipleDocumentUploader';
import { useAdminDriver } from '../../hooks/admin/useAdminDriver';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl } from '../../api/services/upload.service';

const formatName = (v, fallback = '—') => {
  if (!v) return fallback;
  if (typeof v === 'object') return v.name || v.code || fallback;
  return String(v);
};

const normalizeDriverDocs = (rawDocs, driverRecord) => {
  const isDriverDocVerified = !Boolean(driverRecord?.kyc_rejected || driverRecord?.kycRejected) && Boolean(driverRecord?.documents_verified || driverRecord?.aadhaar_verified || driverRecord?.verified);
  return Array.isArray(rawDocs)
    ? rawDocs.map((d) => ({
        id: d.id || d.url || d.file_url || Date.now() + Math.random(),
        name: d.name || d.doc_name || d.file_name || d.originalName || d.purpose || 'Attached Document',
        category: d.category || d.doc_subtype || d.doc_type || d.purpose || 'Driving License & KYC',
        url: d.url || d.file_url || d.filePath || (typeof d === 'string' ? d : ''),
        size: d.size ?? (d.file_size ? Number(d.file_size) : null),
        formattedSize: d.formattedSize || (d.size ? (typeof d.size === 'number' ? `${(d.size / 1024).toFixed(1)} KB` : d.size) : (d.file_size ? `${(Number(d.file_size) / 1024).toFixed(1)} KB` : 'PDF / File')),
        uploadedAt: d.uploadedAt || d.uploaded_on || d.created_at || new Date().toISOString(),
        verified: Boolean(d.verified || d.is_verified || d.verification_status === 'verified' || d.approval_status === 'approved' || isDriverDocVerified),
      }))
    : [];
};

export const AdminDriverDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect if rendered inside Fleet Portal (/fleet-operator/*)
  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/drivers' : '/admin/drivers';
  const editPath = `${basePath}/edit/${id}`;

  const { loadDriver, loadDrivers, verifyDriverDocuments, updateDriver, approveDriver, rejectDriver } = useAdminDriver();
  const { hasPermission } = useAuth();

  // RBAC permission gates (always true for Admin portal)
  const canUpdate  = !isFleetPortal || hasPermission('fleet.drivers.update');
  const canView    = !isFleetPortal || hasPermission('fleet.drivers.view');
  const canApprove = !isFleetPortal || hasPermission('fleet.drivers.approve');

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [driverDocs, setDriverDocs] = useState([]);

  useEffect(() => {
    if (isFleetPortal && !canView) return;
    if (id) {
      setLoading(true);
      loadDriver(id)
        .catch(() => loadDrivers({ page: 1, limit: 100 }))
        .then((res) => {
          let found = null;
          if (res && res.id) {
            found = res;
          } else {
            const list = Array.isArray(res) ? res : (res?.items || res?.rows || []);
            found = list.find((d) => String(d.id) === String(id));
          }

          if (found) {
            setDriver(found);
            const rawDocs = found.documents || found.docs || [];
            setDriverDocs(normalizeDriverDocs(rawDocs, found));
          } else {
            toast.error('Driver profile not found');
            navigate(basePath);
          }
        })
        .catch((err) => {
          toast.error(err?.message || 'Failed to load driver details');
          navigate(basePath);
        })
        .finally(() => setLoading(false));
    }
  }, [id, canView, isFleetPortal, loadDriver, loadDrivers, navigate, basePath]);

  const handleVerifyDriver = () => {
    if (!driver) return;
    setVerifying(true);
    toast.promise(
      verifyDriverDocuments(driver.id, true),
      {
        loading: `Verifying KYC documents for ${driver.name}...`,
        success: (updatedDriver) => {
          setDriver((prev) => prev ? {
            ...prev,
            ...(updatedDriver || {}),
            documents_verified: true,
            aadhaar_verified: true,
          } : null);
          setDriverDocs((prev) => (prev || []).map((d) => ({ ...d, verified: true })));
          return `Driver ${driver.name} verified successfully!`;
        },
        error: (err) => err?.message || 'Failed to verify driver',
      }
    ).finally(() => setVerifying(false));
  };

  const handleApproveDriver = () => {
    if (!driver) return;
    setApprovingId(driver.id);
    toast.promise(
      approveDriver(driver.id),
      {
        loading: `Approving driver ${driver.name}...`,
        success: () => {
          setDriver((prev) => prev ? {
            ...prev,
            status: 'available',
            kyc_rejected: false,
            kycRejected: false,
            rejection_reason: null,
            rejectionReason: null,
            documents_verified: true,
            aadhaar_verified: true,
          } : null);
          setDriverDocs((prev) => (prev || []).map((d) => ({ ...d, verified: true })));
          return `Driver ${driver.name} approved and set to Available!`;
        },
        error: (err) => err?.message || 'Failed to approve driver',
      }
    ).finally(() => setApprovingId(null));
  };

  const handleRejectDriver = () => {
    if (!driver) return;
    const reason = window.prompt(`Rejection reason for ${driver.name}:`, 'Driver KYC documents incomplete.');
    if (reason === null) return;
    setRejectingId(driver.id);
    toast.promise(
      rejectDriver(driver.id, reason),
      {
        loading: `Rejecting driver ${driver.name}...`,
        success: () => {
          loadDriver(driver.id).then((fresh) => {
            if (fresh) setDriver(fresh);
          }).catch(() => {});
          setDriver((prev) => prev ? {
            ...prev,
            kyc_rejected: true,
            kycRejected: true,
            rejection_reason: reason,
            rejectionReason: reason,
            documents_verified: false,
            aadhaar_verified: false,
          } : null);
          return `Driver ${driver.name} KYC documents rejected.`;
        },
        error: (err) => err?.message || 'Failed to reject driver',
      }
    ).finally(() => setRejectingId(null));
  };

  const handleSaveDriverDocs = async (newDocs) => {
    setDriverDocs(newDocs);
    if (driver) {
      try {
        await toast.promise(
          updateDriver(driver.id, { documents: newDocs }),
          {
            loading: 'Saving driver compliance documents...',
            success: 'Driver documents updated!',
            error: (err) => err?.message || 'Failed to save documents',
          }
        );
        const refreshed = await loadDriver(driver.id).catch(() => null);
        if (refreshed) {
          setDriver(refreshed);
          const rawDocs = refreshed.documents || refreshed.docs || [];
          setDriverDocs(normalizeDriverDocs(rawDocs, refreshed));
        }
      } catch (err) {
        console.error('Failed to save driver documents:', err);
      }
    }
  };

  if (isFleetPortal && !canView) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <FleetIcons.Lock className="w-10 h-10 text-slate-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white dark:text-white">{t('common.access_revoked') || 'Access Revoked'}</h2>
        <p className="text-sm text-slate-500 font-medium">
          Your administrator has revoked your permission to view driver details.
        </p>
        <Link
          to={basePath}
          className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          {t('admin.drivers.back_to_drivers') || 'Back to Drivers'}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t('admin.drivers.loading_details') || 'Loading driver dossier & compliance details...'}</div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-slate-400 font-bold text-sm">{t('admin.drivers.not_found') || 'Driver not found on master roster.'}</div>
        <Link
          to={basePath}
          className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
        >
          Back to Roster
        </Link>
      </div>
    );
  }

  const badge = driver.badge_id || driver.badgeId || driver.code || driver.id;
  const dlNum = driver.dl_number || driver.dlNumber || '—';
  const dlStat = driver.dl_status || driver.dlStatus || 'valid';
  const dlExp = driver.dl_expiry || driver.dlExpiry || '—';
  const shift = driver.active_shift || driver.activeShift || 'General Shift';
  const bus =
    driver.assignedBus?.bus_number ||
    driver.assignedBus?.busNumber ||
    driver.assigned_bus_number ||
    driver.assignedBusNumber ||
    driver.assigned_bus_no ||
    (typeof driver.assignedBus === 'string' && driver.assignedBus.trim() && isNaN(Number(driver.assignedBus)) ? driver.assignedBus : null) ||
    (driver.assigned_bus_id ? `Bus #${driver.assigned_bus_id}` : 'Unassigned');
  const rejectionReason =
    driver.rejection_reason ||
    driver.rejectionReason ||
    (driver.notes && driver.notes.match(/\[Rejection Reason\]:\s*([^\n\r]+)/i)?.[1]?.trim()) ||
    null;
  const isRejected = Boolean(driver.kyc_rejected || driver.kycRejected || rejectionReason || (driver.status || '').toLowerCase() === 'rejected');
  const isVerified = !isRejected && Boolean(driver.documents_verified || driver.aadhaar_verified || driver.verified);
  const isPending = !isRejected && (driver.status || '').toLowerCase() === 'pending_approval';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4 min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
              { label: 'Drivers Roster', path: basePath },
              { label: driver.name },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-sm shrink-0">
              <img
                src={
                  (driver.avatar_url || driver.avatarUrl || driver.avatar || driver.user?.avatar_url || driver.user?.avatarUrl)
                    ? resolveFileUrl(driver.avatar_url || driver.avatarUrl || driver.avatar || driver.user?.avatar_url || driver.user?.avatarUrl)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name || 'Driver')}&background=0f172a&color=ffffff`
                }
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name || 'Driver')}&background=0f172a&color=ffffff`;
                }}
                alt={driver.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap min-w-0">
                <span className="break-words">{driver.name}</span>
                {/* KYC Verification / Application Status Badge */}
                {isRejected ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase border bg-rose-50 text-rose-700 border-rose-200 inline-flex items-center gap-1 shadow-2xs">
                    <FleetIcons.X className="w-3 h-3" />
                    <span>{t('admin.drivers.status_rejected') || 'Rejected'}</span>
                  </span>
                ) : isVerified ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase border bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
                    <FleetIcons.Check className="w-3 h-3" />
                    <span>{t('admin.drivers.stat_verified') || 'Verified'}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase border bg-amber-50 text-amber-700 border-amber-200 inline-flex items-center gap-1 shadow-2xs">
                    <FleetIcons.Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{t('admin.drivers.status_pending') || 'Pending Verification'}</span>
                  </span>
                )}

                {isPending && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase border bg-amber-50 text-amber-700 border-amber-200 inline-flex items-center gap-1 shadow-2xs">
                    <FleetIcons.Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{t('admin.drivers.awaiting_approval') || 'Awaiting Approval'}</span>
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5 break-all">
                Badge: {badge} · Phone: {driver.phone || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Responsive Header Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full md:w-auto">
          {/* Approve — shown if pending, rejected, or unverified */}
          {canApprove && (isPending || isRejected || !isVerified) && (
            <button
              type="button"
              disabled={approvingId === driver.id}
              onClick={handleApproveDriver}
              className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer text-center"
            >
              {approvingId === driver.id && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{t('admin.drivers.btn_approve') || 'Approve Driver'}</span>
            </button>
          )}

          {/* Reject — shown if not already rejected */}
          {canApprove && !isRejected && (
            <button
              type="button"
              disabled={rejectingId === driver.id}
              onClick={handleRejectDriver}
              className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer text-center"
            >
              {rejectingId === driver.id && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{t('admin.drivers.btn_reject_driver') || 'Reject Driver'}</span>
            </button>
          )}

          {/* Verify Documents — gated by canApprove */}
          {canApprove && !isVerified && (
            <button
              type="button"
              disabled={verifying}
              onClick={handleVerifyDriver}
              className="w-full sm:w-auto justify-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer text-center"
            >
              {verifying && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{t('admin.drivers.btn_verify_docs') || 'Verify Driver Documents'}</span>
            </button>
          )}

          {/* Edit — gated by canUpdate for fleet portal */}
          {canUpdate && (
            <Link
              to={editPath}
              className="w-full sm:w-auto justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 text-center"
            >
              <FleetIcons.Edit className="w-4 h-4" />
              <span>{t('admin.drivers.btn_edit_profile') || 'Edit Driver Profile'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Rejection Notice Banner with Reason */}
      {isRejected && (
        <div className="flex items-start gap-3.5 p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-2xl shadow-sm animate-in fade-in duration-200">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-base shrink-0 mt-0.5 border border-rose-200">
            ✕
          </div>
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-xs font-black uppercase tracking-wider text-rose-900 flex items-center gap-2">
                <span>{t('admin.drivers.rejected_alert') || 'Driver Registration Rejected'}</span>
                <span className="text-[10px] font-semibold text-rose-600 lowercase bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                  {t('admin.drivers.requires_reverification') || 'requires re-verification'}
                </span>
              </div>
              {driver.verifier && (
                <span className="text-[11px] font-semibold text-rose-700">
                  Reviewed by: {driver.verifier?.name || driver.verifier?.email || 'Administrator'}
                </span>
              )}
            </div>
            <p className="text-xs text-rose-700 font-medium">
              {t('admin.drivers.rejected_desc') || "This driver's registration was rejected. The driver cannot be scheduled or assigned to transit buses until re-approved."}
            </p>
            <div className="p-3.5 bg-white rounded-xl border border-rose-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
                Rejection Reason:
              </span>
              <p className="text-xs font-bold text-rose-950 mt-1 whitespace-pre-wrap break-words font-mono">
                {rejectionReason || 'No specific rejection reason provided.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Approval notice banner for Fleet Portal */}
      {isFleetPortal && isPending && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <FleetIcons.Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-amber-800">{t('admin.drivers.awaiting_approval') || 'Awaiting Admin Approval'}</div>
            <p className="text-xs text-amber-700 mt-0.5">
              {t('admin.drivers.awaiting_desc') || 'This driver is pending review by your Organization Admin. Once approved, they will be set to Active status and can begin operations.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6 min-w-0 overflow-hidden">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 min-w-0">
          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block truncate">{t('admin.drivers.assigned_depot_base') || 'Assigned Depot Base'}</span>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">{formatName(driver.depot)}</div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{t('admin.drivers.home_terminal') || 'Home operating terminal'}</p>
          </div>

          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block truncate">{t('admin.drivers.current_vehicle') || 'Assigned Bus'}</span>
            <div className="text-sm sm:text-base font-bold text-blue-700 truncate">{bus}</div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{t('admin.drivers.current_vehicle') || 'Current designated vehicle'}</p>
          </div>

          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block truncate">{t('admin.drivers.active_shift') || 'Active Shift'}</span>
            <div className="text-sm sm:text-base font-bold text-emerald-700 truncate">{shift}</div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{t('admin.drivers.scheduled_timing') || 'Scheduled duty timing'}</p>
          </div>

          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block truncate">{t('admin.drivers.dl_status') || 'DL Validity Status'}</span>
            <div className="text-sm sm:text-base font-bold text-amber-700 uppercase truncate">{dlStat}</div>
            <p className="text-[11px] text-slate-500 truncate">Expiry: {dlExp}</p>
          </div>
        </div>

        {/* Section: Personal Identification & Demographics */}
        <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <FleetIcons.Profile className="w-4 h-4 text-blue-500 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Personal Identification & Demographics
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs min-w-0">
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.staff_id') || 'Staff / Employee ID'}</span>
              <div className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5 break-all">
                {driver.emp_id || driver.empId || '—'}
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.badge_id_label') || 'Depot Badge ID'}</span>
              <div className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5 break-all">{badge}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.contact_phone') || 'Contact Phone'}</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 break-all">{driver.phone || '—'}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.login_email') || 'Login Email'}</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 break-all">{driver.email || driver.user?.email || '—'}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.dob') || 'Date of Birth'}</span>
              <div className="font-medium text-slate-800 text-sm mt-0.5 break-all">{driver.dob || '—'}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.gender') || 'Gender'}</span>
              <div className="font-medium text-slate-800 text-sm mt-0.5 break-all">{driver.gender || '—'}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.blood_group') || 'Blood Group'}</span>
              <div className="font-bold text-rose-600 text-sm mt-0.5 break-all">{driver.blood_group || driver.bloodGroup || '—'}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.experience_service') || 'Experience & Service'}</span>
              <div className="font-medium text-slate-800 text-sm mt-0.5 break-all">{driver.experience_years || driver.experienceYears || '—'}</div>
            </div>
          </div>
        </div>

        {/* Section: Residential Address & Google Places Geolocation */}
        <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <FleetIcons.Pin className="w-4 h-4 text-emerald-500 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Residential Address & Google Places Location
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs min-w-0">
            <div className="sm:col-span-3 min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.residential_address') || 'Full Residential Address'}</span>
              <div className="font-medium text-slate-900 dark:text-white text-sm mt-0.5 bg-slate-50 p-3 rounded-xl border border-slate-100 break-words">
                {driver.address || '—'}
              </div>
            </div>

            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.city_district') || 'City / District'}</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 break-words">{driver.city || '—'}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.state_label') || 'State'}</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 break-words">{driver.state || '—'}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.pincode_country') || 'Pincode & Country'}</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 break-words">
                {driver.pincode ? `${driver.pincode}, ` : ''}{driver.country || 'India'}
              </div>
            </div>

            {(driver.latitude != null || driver.longitude != null || driver.place_id) && (
              <div className="sm:col-span-3 flex flex-wrap items-center gap-3 p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl min-w-0">
                <span className="text-emerald-700 font-bold text-xs shrink-0">{t('admin.drivers.google_geo') || 'Google Geolocation:'}</span>
                {driver.place_id && (
                  <span className="text-[11px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 break-all">
                    Place ID: {driver.place_id}
                  </span>
                )}
                {driver.latitude != null && driver.longitude != null && (
                  <>
                    <span className="text-[11px] font-mono font-bold text-emerald-900 break-all">
                      Lat: {driver.latitude}, Lng: {driver.longitude}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${driver.latitude},${driver.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline ml-auto cursor-pointer shrink-0"
                    >
                      {t('admin.drivers.open_google_maps') || 'Open in Google Maps'}
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section: Emergency Contact */}
        <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <FleetIcons.Alert className="w-4 h-4 text-rose-500 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Emergency Contact Person
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs min-w-0">
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.emergency_contact_name') || 'Contact Person Name'}</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 break-words">
                {driver.emergency_contact_name || driver.emergencyContactName || '—'}
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.emergency_relationship') || 'Relationship'}</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 break-words">
                {driver.emergency_contact_relation || driver.emergencyContactRelation || '—'}
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.emergency_phone') || 'Emergency Phone'}</span>
              <div className="font-bold text-rose-600 text-sm mt-0.5 break-all">
                {driver.emergency_contact || driver.emergencyContact || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Commercial License & Medical Compliance */}
        <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <FleetIcons.FileText className="w-4 h-4 text-amber-500 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Commercial Driving License & Regulatory Compliance
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs min-w-0">
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.dl_number') || 'Commercial DL Number'}</span>
              <div className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5 break-all">{dlNum}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.dl_classification') || 'License Classification'}</span>
              <div className="font-medium text-slate-800 text-sm mt-0.5 break-words">{driver.license_type || driver.licenseType || 'Commercial Heavy (HMV)'}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.issue_date') || 'DL Issue Date'}</span>
              <div className="font-medium text-slate-800 text-sm mt-0.5 break-all">{driver.issue_date || driver.issueDate || '—'}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.expiry_date') || 'DL Expiry Date'}</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 break-all">{dlExp}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.issuing_rto') || 'Issuing RTO Authority'}</span>
              <div className="font-medium text-slate-800 text-sm mt-0.5 break-words">{driver.issuing_authority || driver.issuingAuthority || '—'}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.medical_fitness_valid') || 'Medical Fitness Valid Until'}</span>
              <div className="font-medium text-slate-800 text-sm mt-0.5 break-all">{driver.medical_fitness_valid_until || driver.medicalFitnessValidUntil || '—'}</div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.aadhaar_kyc') || 'Aadhaar KYC Verification'}</span>
              <div className="mt-1">
                {isRejected ? (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-flex items-center gap-1">
                    <FleetIcons.X className="w-3 h-3" /> {t('admin.drivers.status_rejected') || 'Rejected'}
                  </span>
                ) : isVerified ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                    <FleetIcons.Check className="w-3 h-3" /> {t('admin.drivers.aadhaar_verified') || 'Aadhaar Verified'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                    <FleetIcons.Clock className="w-3 h-3" /> {t('admin.drivers.unverified') || 'Unverified'}
                  </span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.docs_verified') || 'Documents Verified'}</span>
              <div className="mt-1">
                {isRejected ? (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-flex items-center gap-1">
                    <FleetIcons.X className="w-3 h-3" /> {t('admin.drivers.status_rejected') || 'Rejected'}
                  </span>
                ) : Boolean(driver.documents_verified) ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                    <FleetIcons.Check className="w-3 h-3" /> {t('admin.drivers.stat_verified') || 'Verified'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                    <FleetIcons.Clock className="w-3 h-3" /> {t('admin.drivers.pending_review') || 'Pending Review'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Operational Notes & Record Info */}
        {(driver.notes || driver.joining_date || driver.safety_rating != null || driver.total_trips != null) && (
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <FleetIcons.Edit className="w-4 h-4 text-indigo-500 shrink-0" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Operations, Safety & Notes
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs min-w-0">
              <div className="min-w-0">
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.joining_date') || 'Joining Date'}</span>
                <div className="font-medium text-slate-800 text-sm mt-0.5 break-all">{driver.joining_date || driver.joiningDate || '—'}</div>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.safety_rating') || 'Safety Rating'}</span>
                <div className="font-bold text-amber-600 text-sm mt-0.5 break-all">
                  {driver.safety_rating != null ? `⭐ ${driver.safety_rating} / 5.0` : '—'}
                </div>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.completed_trips') || 'Total Completed Trips'}</span>
                <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 break-all">{driver.total_trips ?? 0} {t('admin.drivers.trips_unit') || 'trips'}</div>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block">{t('admin.drivers.roster_status') || 'Roster Status'}</span>
                <div className="mt-0.5"><span className="font-bold uppercase text-slate-800">{driver.status || 'available'}</span></div>
              </div>
              {driver.notes && (
                <div className="sm:col-span-2 md:col-span-4 bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-0">
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block mb-1">{t('admin.drivers.operational_notes') || 'Operational Notes:'}</span>
                  <p className="text-slate-700 text-xs font-medium break-words">{driver.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section: Multi-Document Attachments */}
        <div className="min-w-0 overflow-hidden">
          <MultipleDocumentUploader
            documents={driverDocs}
            onChange={handleSaveDriverDocs}
            title={t('admin.drivers.compliance_attachments') || "Driver Compliance & Legal Verification Attachments (DL, Aadhaar, Medical)"}
            purpose="driver_kyc"
            isLocked={isVerified}
            readOnly={isFleetPortal && isVerified}
          />
        </div>

        {/* Section: Audit Trail & Record Metadata */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-600 min-w-0 overflow-hidden">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
            <FleetIcons.FileText className="w-4 h-4 text-purple-500 shrink-0" />
            <span>{t('admin.drivers.audit_trail') || 'Audit Trail & Record Information'}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px] min-w-0">
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">{t('admin.drivers.created_by') || 'Created By:'}</span>
              <strong className="text-slate-800 break-all block">
                {driver.creator?.name || driver.creator?.email || (driver.created_by ? `User #${driver.created_by}` : 'System Admin')}
              </strong>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">{t('admin.drivers.created_at') || 'Created At:'}</span>
              <span className="text-slate-700 break-all block">
                {driver.created_at || driver.createdAt ? new Date(driver.created_at || driver.createdAt).toLocaleString('en-IN') : '—'}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">{t('admin.drivers.last_updated_by') || 'Last Updated By:'}</span>
              <strong className="text-slate-800 break-all block">
                {driver.updater?.name || driver.updater?.email || (driver.updated_by ? `User #${driver.updated_by}` : '—')}
              </strong>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">{t('admin.drivers.last_updated_at') || 'Last Updated At:'}</span>
              <span className="text-slate-700 break-all block">
                {driver.updated_at || driver.updatedAt ? new Date(driver.updated_at || driver.updatedAt).toLocaleString('en-IN') : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
