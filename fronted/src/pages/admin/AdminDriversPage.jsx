import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { MultipleDocumentUploader } from '../../components/ui/MultipleDocumentUploader';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminDriver } from '../../hooks/admin/useAdminDriver';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl } from '../../api/services/upload.service';
import { ActionDropdown } from '../../components/ui/ActionDropdown';

const formatName = (v, fallback = '—') => {
  if (!v) return fallback;
  if (typeof v === 'object') return v.name || v.code || fallback;
  return String(v);
};

const formatBusNumber = (d, fallback = 'No Vehicle') => {
  if (!d) return fallback;
  const num =
    d.assignedBus?.bus_number ||
    d.assignedBus?.busNumber ||
    d.assigned_bus_number ||
    d.assignedBusNumber ||
    d.assigned_bus_no ||
    (typeof d.assignedBus === 'string' && d.assignedBus.trim() && isNaN(Number(d.assignedBus)) ? d.assignedBus : null);
  if (num) return num;
  if (d.assigned_bus_id) return `Vehicle #${d.assigned_bus_id}`;
  return fallback;
};

/** Operational / Duty Status badge helper */
const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const s = (status || '').toLowerCase();
  let cls = 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
  let label = status || '—';
  let dot = 'bg-slate-400';

  if (s === 'available') {
    cls = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
    label = t('admin.drivers.status_available') || 'Available';
    dot = 'bg-emerald-500';
  } else if (s === 'on_duty' || s === 'on duty') {
    cls = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60';
    label = t('admin.drivers.status_on_duty') || 'On Duty';
    dot = 'bg-blue-500 animate-pulse';
  } else if (s === 'off_duty' || s === 'off duty') {
    cls = 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
    label = t('admin.drivers.status_off_duty') || 'Off Duty';
    dot = 'bg-slate-400';
  } else if (s === 'pending_approval') {
    cls = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
    label = t('admin.drivers.status_pending') || 'Pending';
    dot = 'bg-amber-500';
  } else if (s === 'rejected') {
    cls = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';
    label = t('admin.drivers.status_rejected') || 'Rejected';
    dot = 'bg-rose-500';
  } else if (s === 'compliance_blocked') {
    cls = 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/60';
    label = t('admin.drivers.status_blocked') || 'Blocked';
    dot = 'bg-red-600';
  }

  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border shrink-0 inline-flex items-center gap-1.5 shadow-2xs ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{label}</span>
    </span>
  );
};

/** KYC & Document Compliance badge helper */
const KycBadge = ({ driver }) => {
  const { t } = useTranslation();
  const isRejected = Boolean(
    driver?.kyc_rejected ||
    driver?.kycRejected ||
    (driver?.rejection_reason && !driver?.documents_verified)
  );
  if (isRejected) {
    return (
      <span
        className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/60 inline-flex items-center gap-1 shrink-0"
        title={`Rejected${driver?.rejection_reason ? ': ' + driver.rejection_reason : ''}`}
      >
        <FleetIcons.X className="w-3 h-3 text-rose-600 dark:text-rose-400" />
        <span>{t('admin.drivers.status_rejected') || 'Rejected'}</span>
      </span>
    );
  }

  const isVerified = Boolean(driver?.documents_verified || driver?.aadhaar_verified || driver?.verified);
  if (isVerified) {
    return (
      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60 inline-flex items-center gap-1 shrink-0" title={t('admin.drivers.docs_verified') || "Documents verified"}>
        <FleetIcons.Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span>{t('admin.drivers.stat_verified') || 'Verified'}</span>
      </span>
    );
  }

  return (
    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1 shrink-0" title={t('admin.drivers.stat_pending_approval') || "Documents pending review"}>
      <FleetIcons.Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
      <span>{t('admin.drivers.status_pending') || 'Pending'}</span>
    </span>
  );
};

export const AdminDriversPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  // Detect if rendered inside Fleet Portal (/fleet-operator/*)
  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/drivers' : '/admin/drivers';

  const { drivers, pagination, loading, loadDrivers, verifyDriverDocuments, updateDriver, updateDriverStatus, deleteDriver, approveDriver, rejectDriver } = useAdminDriver();
  const { hasPermission } = useAuth();

  // RBAC permission gates (always true for Admin portal)
  const canCreate  = !isFleetPortal || hasPermission('fleet.drivers.create');
  const canUpdate  = !isFleetPortal || hasPermission('fleet.drivers.update');
  const canDelete  = !isFleetPortal || hasPermission('fleet.drivers.delete');
  const canView    = !isFleetPortal || hasPermission('fleet.drivers.view');
  const canApprove = !isFleetPortal;
  const canAssign  = !isFleetPortal || hasPermission('fleet.drivers.assign');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [verifyingId, setVerifyingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingStatusId, setTogglingStatusId] = useState(null);
  const [rejectModalDriver, setRejectModalDriver] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('driver_view_mode') || 'table');

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('driver_view_mode', mode);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const refreshDrivers = useCallback((page = currentPage, size = pageSize) => {
    if (isFleetPortal && !canView) return Promise.resolve();
    const params = { page, limit: size };
    if (debouncedSearch) params.search = debouncedSearch;
    if (activeTab === 'On Duty') params.status = 'on_duty';
    else if (activeTab === 'Pending') params.status = 'pending_approval';
    else if (activeTab === 'Verified') params.verified = 'true';
    else if (activeTab === 'Expiring License') params.dl_status = 'expiring';
    return loadDrivers(params);
  }, [currentPage, pageSize, debouncedSearch, activeTab, loadDrivers, isFleetPortal, canView]);

  useEffect(() => {
    if (isFleetPortal && !canView) return;
    refreshDrivers();
  }, [refreshDrivers, isFleetPortal, canView]);

  const driversList = Array.isArray(drivers) ? drivers : (drivers?.items || drivers?.rows || []);

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverDocs, setDriverDocs] = useState([]);

  // Sync driver docs when selectedDriver changes
  useEffect(() => {
    if (selectedDriver) {
      const rawDocs = selectedDriver.documents || selectedDriver.docs || [];
      const isDriverDocVerified = !Boolean(selectedDriver.kyc_rejected || selectedDriver.kycRejected) && Boolean(selectedDriver.documents_verified || selectedDriver.aadhaar_verified || selectedDriver.verified);
      const normalized = Array.isArray(rawDocs)
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
      setDriverDocs(normalized);
    } else {
      setDriverDocs([]);
    }
  }, [selectedDriver]);

  // Verify Driver Handler (KYC verification) — uses /verify-documents endpoint
  const handleVerifyDriver = (driver) => {
    setVerifyingId(driver.id);
    toast.promise(
      verifyDriverDocuments(driver.id, true),
      {
        loading: `Verifying documents for ${driver.name}...`,
        success: (updatedDriver) => {
          // Sync modal state if this driver is open
          setSelectedDriver((prev) =>
            prev && prev.id === driver.id
              ? { ...prev, ...(updatedDriver || {}), documents_verified: true, aadhaar_verified: true }
              : prev
          );
          setDriverDocs((prev) => (prev || []).map((d) => ({ ...d, verified: true })));
          refreshDrivers();
          return `Driver ${driver.name} verified!`;
        },
        error: (err) => err?.message || 'Failed to verify driver',
      }
    ).finally(() => setVerifyingId(null));
  };

  // Approve driver (Admin only — sets status: available)
  const handleApproveDriver = (driver, closeDropdown) => {
    setApprovingId(driver.id);
    if (closeDropdown) closeDropdown();
    toast.promise(
      approveDriver(driver.id),
      {
        loading: `Approving driver ${driver.name}...`,
        success: () => {
          setDriverDocs((prev) => (prev || []).map((d) => ({ ...d, verified: true })));
          refreshDrivers();
          return `Driver ${driver.name} approved!`;
        },
        error: (err) => err?.message || 'Failed to approve driver',
      }
    ).finally(() => setApprovingId(null));
  };

  // Reject driver — opens modal for reason input
  const handleRejectDriver = (driver, closeDropdown) => {
    if (closeDropdown) closeDropdown();
    setRejectModalDriver(driver);
    setRejectReason('');
  };

  // Submit rejection with reason from modal
  const handleConfirmReject = () => {
    if (!rejectModalDriver) return;
    const driver = rejectModalDriver;
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    setRejectingId(driver.id);
    setRejectModalDriver(null);
    toast.promise(
      rejectDriver(driver.id, rejectReason.trim()),
      {
        loading: `Rejecting documents for ${driver.name}...`,
        success: () => {
          refreshDrivers();
          return `Driver ${driver.name} rejected.`;
        },
        error: (err) => err?.message || 'Failed to reject driver',
      }
    ).finally(() => setRejectingId(null));
  };

  // Toggle duty status (Active/Available <-> Off Duty)
  const handleToggleDutyStatus = (driver, newStatus, closeDropdown) => {
    if (closeDropdown) closeDropdown();
    setTogglingStatusId(driver.id);
    const statusLabel = {
      available: 'Available',
      off_duty: 'Off Duty',
      on_duty: 'On Duty',
      compliance_blocked: 'Blocked',
    };
    toast.promise(
      updateDriverStatus(driver.id, newStatus),
      {
        loading: `Updating status for ${driver.name}...`,
        success: () => {
          refreshDrivers();
          return `${driver.name} marked as ${statusLabel[newStatus] || newStatus}!`;
        },
        error: (err) => err?.message || 'Failed to update status',
      }
    ).finally(() => setTogglingStatusId(null));
  };

  // Delete driver handler (soft-delete from roster)
  const handleDeleteDriver = (driver, closeDropdown) => {
    if (closeDropdown) closeDropdown();
    if (!window.confirm(`Are you sure you want to delete driver "${driver.name}"?`)) {
      return;
    }
    setDeletingId(driver.id);
    toast.promise(
      deleteDriver(driver.id),
      {
        loading: `Deleting driver ${driver.name}...`,
        success: () => {
          refreshDrivers();
          return `Driver ${driver.name} deleted!`;
        },
        error: (err) => err?.message || 'Failed to delete driver',
      }
    ).finally(() => setDeletingId(null));
  };

  // Save driver docs handler
  const handleSaveDriverDocs = (newDocs) => {
    setDriverDocs(newDocs);
    if (selectedDriver) {
      toast.promise(
        updateDriver(selectedDriver.id, { documents: newDocs }),
        {
          loading: 'Saving driver documents...',
          success: 'Driver documents updated!',
          error: (err) => err?.message || 'Failed to save documents',
        }
      );
    }
  };

  const filterTabs = [
    { key: 'All', label: 'All' },
    { key: 'On Duty', label: 'On Duty' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Verified', label: 'Verified' },
    { key: 'Expiring License', label: 'Expiring License' },
  ];

  const filteredDrivers = driversList;

  // Access Revoked screen for fleet portal when view permission is missing
  if (isFleetPortal && !canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <FleetIcons.Lock className="w-12 h-12 text-slate-400 dark:text-zinc-500 mx-auto mb-4" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_revoked') || 'Access Revoked'}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 font-medium">
          {t('common.access_revoked_desc') || 'Your administrator has revoked your permission to view drivers. Please contact your admin.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Admin', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
              { label: 'Drivers' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Drivers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Manage drivers, licenses, and duty status
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={refreshDrivers}
            loading={loading}
            title={t('admin.drivers.refresh_title') || 'Refresh drivers'}
          />
          {canCreate && (
            <Link
              to={`${basePath}/add`}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <FleetIcons.Plus className="w-4 h-4" />
              <span>{t('admin.drivers.add_driver') || 'Add Driver'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 4 Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('admin.drivers.stat_total') || 'Total Drivers'}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{pagination?.total ?? driversList.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('admin.drivers.stat_verified') || 'Verified'}</span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {driversList.filter((d) => d.aadhaar_verified || d.verified).length}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {isFleetPortal ? (t('admin.drivers.stat_pending_approval') || 'Pending Approval') : (t('admin.drivers.stat_expiring_dl') || 'Expiring License')}
          </span>
          <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">
            {isFleetPortal
              ? driversList.filter((d) => (d.status || '').toLowerCase() === 'pending_approval').length
              : driversList.filter((d) => String(d.dl_status || d.dlStatus || '').toLowerCase().includes('expir')).length}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">{t('admin.drivers.stat_blocked') || 'Blocked'}</span>
          <div className="text-xl font-black text-red-700 dark:text-red-400 mt-1">
            {driversList.filter((d) => (d.status || '').toLowerCase() === 'compliance_blocked' || String(d.dl_status || d.dlStatus || '').toLowerCase().includes('expired')).length}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:w-80">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('admin.drivers.search_placeholder') || 'Search driver name, ID, phone, or license...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700 focus:outline-none"
            />
          </div>

          {/* View Toggle Buttons */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={toggleViewMode}
            tableValue="table"
            cardValue="grid"
            className="self-end sm:self-auto"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-zinc-800 rounded-xl w-full" />
          ))}
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
          No drivers found matching your search.
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrivers.map((d) => {
            const badge = d.badge_id || d.badgeId || d.code || d.id;
            const dlNum = d.dl_number || d.dlNumber || '—';
            const dlStat = d.dl_status || d.dlStatus || 'valid';
            const shift = d.active_shift || d.activeShift || 'General Shift';
            const bus = formatBusNumber(d);
            const isVerified = Boolean(d.aadhaar_verified || d.verified);
            const isPending = (d.status || '').toLowerCase() === 'pending_approval';

            return (
              <div key={d.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0">
                      <img
                        src={
                          (d.avatar_url || d.avatarUrl || d.avatar || d.user?.avatar_url || d.user?.avatarUrl)
                            ? resolveFileUrl(d.avatar_url || d.avatarUrl || d.avatar || d.user?.avatar_url || d.user?.avatarUrl)
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || 'Driver')}&background=0f172a&color=ffffff`
                        }
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || 'Driver')}&background=0f172a&color=ffffff`;
                        }}
                        alt={d.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/60">
                        {badge}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{d.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">{d.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge status={d.status} />
                    <KycBadge driver={d} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px]">{t('admin.drivers.license_no') || 'License:'}</span>
                    <div className="font-mono font-bold text-slate-800 dark:text-zinc-200">{dlNum}</div>
                    <div className={`text-[10px] font-bold ${dlStat.toLowerCase() === 'valid' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                      {dlStat.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px]">{t('admin.drivers.col_depot_shift') || 'Depot & Shift:'}</span>
                    <div className="font-bold text-slate-900 dark:text-white">{formatName(d.depot)}</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400">{shift}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{bus}</span>

                  {/* 3-Dot Action Menu */}
                  <ActionDropdown buttonTitle={`Actions for ${d.name}`}>
                    {({ close }) => {
                      const dStatus = (d.status || '').toLowerCase();
                      const isKycRejected = Boolean(d.kyc_rejected || d.kycRejected || (d.rejection_reason && !d.documents_verified));
                      const isDocVerified = Boolean(d.documents_verified);
                      const canSetActive = dStatus !== 'available' && dStatus !== 'on_duty';
                      const canSetOffDuty = dStatus === 'available' || dStatus === 'on_duty';
                      return (
                        <>
                          <Link
                            to={`${basePath}/${d.id}`}
                            onClick={close}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                          >
                            <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>{t('admin.drivers.btn_view_details') || 'View Details'}</span>
                          </Link>

                          {/* ── Duty Status Toggle ── */}
                          {canUpdate && canSetActive && (
                            <button
                              type="button"
                              disabled={togglingStatusId === d.id}
                              onClick={() => handleToggleDutyStatus(d, 'available', close)}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <FleetIcons.CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                              <span>{togglingStatusId === d.id ? 'Updating...' : 'Mark Available'}</span>
                            </button>
                          )}
                          {canUpdate && canSetOffDuty && (
                            <button
                              type="button"
                              disabled={togglingStatusId === d.id}
                              onClick={() => handleToggleDutyStatus(d, 'off_duty', close)}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <FleetIcons.X className="w-3.5 h-3.5 text-slate-400" />
                              <span>{togglingStatusId === d.id ? 'Updating...' : 'Mark Off Duty'}</span>
                            </button>
                          )}

                          {/* ── KYC / Document Actions ── */}
                          {canApprove && !isDocVerified && (
                            <button
                              type="button"
                              disabled={verifyingId === d.id}
                              onClick={() => { handleVerifyDriver(d); close(); }}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <FleetIcons.CheckCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                              <span>{verifyingId === d.id ? 'Verifying...' : 'Verify Documents'}</span>
                            </button>
                          )}
                          {canApprove && (isPending || isKycRejected) && (
                            <button
                              type="button"
                              disabled={approvingId === d.id}
                              onClick={() => handleApproveDriver(d, close)}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <FleetIcons.CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{approvingId === d.id ? 'Approving...' : 'Approve'}</span>
                            </button>
                          )}
                          {canApprove && !isKycRejected && (
                            <button
                              type="button"
                              disabled={rejectingId === d.id}
                              onClick={() => handleRejectDriver(d, close)}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <FleetIcons.X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                              <span>{t('admin.drivers.btn_reject') || 'Reject'}</span>
                            </button>
                          )}

                          {/* Edit */}
                          {canUpdate && (
                            <Link
                              to={`${basePath}/edit/${d.id}`}
                              onClick={close}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-zinc-800"
                            >
                              <FleetIcons.Edit className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                              <span>{t('admin.drivers.btn_edit_driver') || 'Edit Driver'}</span>
                            </Link>
                          )}

                          {/* Delete */}
                          {canDelete && (
                            <button
                              type="button"
                              disabled={deletingId === d.id}
                              onClick={() => handleDeleteDriver(d, close)}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                              <span>{deletingId === d.id ? 'Deleting...' : 'Delete'}</span>
                            </button>
                          )}
                        </>
                      );
                    }}
                  </ActionDropdown>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[700px] text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">{t('admin.drivers.col_driver') || 'Driver & ID'}</th>
                  <th className="py-3 px-4">{t('admin.drivers.col_status') || 'Status'}</th>
                  <th className="py-3 px-4">{t('admin.drivers.col_verification') || 'Verification'}</th>
                  <th className="py-3 px-4">{t('admin.drivers.col_license') || 'License & Expiry'}</th>
                  <th className="py-3 px-4">{t('admin.drivers.col_depot_shift') || 'Depot & Shift'}</th>
                  <th className="py-3 px-4">{t('admin.drivers.col_vehicle') || 'Vehicle'}</th>
                  <th className="py-3 px-4 text-right">{t('admin.drivers.col_actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                {filteredDrivers.map((d) => {
                  const badge = d.badge_id || d.badgeId || d.code || d.id;
                  const dlNum = d.dl_number || d.dlNumber || '—';
                  const dlStat = d.dl_status || d.dlStatus || 'valid';
                  const dlExp = d.dl_expiry || d.dlExpiry || '—';
                  const shift = d.active_shift || d.activeShift || 'General Shift';
                  const bus = formatBusNumber(d);
                  const isVerified = Boolean(d.aadhaar_verified || d.verified);
                  const isPending = (d.status || '').toLowerCase() === 'pending_approval';

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0">
                            <img
                              src={
                                (d.avatar_url || d.avatarUrl || d.avatar || d.user?.avatar_url || d.user?.avatarUrl)
                                  ? resolveFileUrl(d.avatar_url || d.avatarUrl || d.avatar || d.user?.avatar_url || d.user?.avatarUrl)
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || 'Driver')}&background=0f172a&color=ffffff`
                              }
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || 'Driver')}&background=0f172a&color=ffffff`;
                              }}
                              alt={d.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{d.name}</div>
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{badge} · {d.phone || '—'}</div>
                          </div>
                        </div>
                      </td>
                      {/* Duty / Operational Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={d.status} />
                      </td>

                      {/* KYC Compliance Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <KycBadge driver={d} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800 dark:text-zinc-200">{dlNum}</div>
                        <span
                          className={`text-[10px] font-bold ${
                            dlStat.toLowerCase() === 'valid'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : dlStat.toLowerCase().includes('expir')
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-red-700 dark:text-red-400'
                          }`}
                        >
                          {dlStat.toUpperCase()} (Exp: {dlExp})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{formatName(d.depot)}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400">{shift}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">{bus}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <ActionDropdown buttonTitle={`Actions for ${d.name}`}>
                            {({ close }) => {
                              const dStatus = (d.status || '').toLowerCase();
                              const isKycRejected = Boolean(d.kyc_rejected || d.kycRejected || (d.rejection_reason && !d.documents_verified));
                              const isDocVerified = Boolean(d.documents_verified);
                              const canSetActive = dStatus !== 'available' && dStatus !== 'on_duty';
                              const canSetOffDuty = dStatus === 'available' || dStatus === 'on_duty';
                              return (
                                <>
                                  <Link
                                    to={`${basePath}/${d.id}`}
                                    onClick={close}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    <span>{t('admin.drivers.btn_view_details') || 'View Details'}</span>
                                  </Link>

                                  {/* ── Duty Status Toggle ── */}
                                  {canUpdate && canSetActive && (
                                    <button
                                      type="button"
                                      disabled={togglingStatusId === d.id}
                                      onClick={() => handleToggleDutyStatus(d, 'available', close)}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                      <FleetIcons.CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                                      <span>{togglingStatusId === d.id ? 'Updating...' : 'Mark Available'}</span>
                                    </button>
                                  )}
                                  {canUpdate && canSetOffDuty && (
                                    <button
                                      type="button"
                                      disabled={togglingStatusId === d.id}
                                      onClick={() => handleToggleDutyStatus(d, 'off_duty', close)}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                      <FleetIcons.X className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{togglingStatusId === d.id ? 'Updating...' : 'Mark Off Duty'}</span>
                                    </button>
                                  )}

                                  {/* ── KYC / Document Actions ── */}
                                  {canApprove && !isDocVerified && (
                                    <button
                                      type="button"
                                      disabled={verifyingId === d.id}
                                      onClick={() => { handleVerifyDriver(d); close(); }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                      <FleetIcons.CheckCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                      <span>{verifyingId === d.id ? 'Verifying...' : 'Verify Documents'}</span>
                                    </button>
                                  )}
                                  {canApprove && (isPending || isKycRejected) && (
                                    <button
                                      type="button"
                                      disabled={approvingId === d.id}
                                      onClick={() => handleApproveDriver(d, close)}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                      <FleetIcons.CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span>{approvingId === d.id ? 'Approving...' : 'Approve'}</span>
                                    </button>
                                  )}
                                  {canApprove && !isKycRejected && (
                                    <button
                                      type="button"
                                      disabled={rejectingId === d.id}
                                      onClick={() => handleRejectDriver(d, close)}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                      <FleetIcons.X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                      <span>{t('admin.drivers.btn_reject') || 'Reject'}</span>
                                    </button>
                                  )}

                                  {/* Edit */}
                                  {canUpdate && (
                                    <Link
                                      to={`${basePath}/edit/${d.id}`}
                                      onClick={close}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-zinc-800"
                                    >
                                      <FleetIcons.Edit className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                                      <span>{t('admin.drivers.btn_edit_driver') || 'Edit Driver'}</span>
                                    </Link>
                                  )}

                                  {/* Delete */}
                                  {canDelete && (
                                    <button
                                      type="button"
                                      disabled={deletingId === d.id}
                                      onClick={() => handleDeleteDriver(d, close)}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                      <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                                      <span>{deletingId === d.id ? 'Deleting...' : 'Delete'}</span>
                                    </button>
                                  )}
                                </>
                              );
                            }}
                          </ActionDropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* Global Pagination */}
        <div className="p-3 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm">
          <Pagination
            currentPage={pagination?.page || currentPage}
            totalPages={pagination?.totalPages || 1}
            totalItems={pagination?.total ?? driversList.length}
            pageSize={pagination?.limit || pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 10, 20, 50]}
          />
        </div>

      {/* Driver Profile Modal (quick view) */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0">
                  <img
                    src={
                      (selectedDriver.avatar_url || selectedDriver.avatarUrl || selectedDriver.avatar || selectedDriver.user?.avatar_url || selectedDriver.user?.avatarUrl)
                        ? resolveFileUrl(selectedDriver.avatar_url || selectedDriver.avatarUrl || selectedDriver.avatar || selectedDriver.user?.avatar_url || selectedDriver.user?.avatarUrl)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDriver.name || 'Driver')}&background=0f172a&color=ffffff`
                    }
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDriver.name || 'Driver')}&background=0f172a&color=ffffff`;
                    }}
                    alt={selectedDriver.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedDriver.name}</h3>
                    <StatusBadge status={selectedDriver.status} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                    ID: {selectedDriver.badge_id || selectedDriver.badgeId || selectedDriver.code || selectedDriver.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <FleetIcons.Close className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">{t('admin.drivers.contact_phone') || 'Contact Phone'}</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedDriver.phone || '—'}</div>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">{t('admin.drivers.official_email') || 'Official Email'}</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedDriver.email || '—'}</div>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">{t('admin.drivers.assigned_depot') || 'Assigned Depot'}</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{formatName(selectedDriver.depot)}</div>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">{t('admin.drivers.duty_shift') || 'Duty Shift'}</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedDriver.active_shift || selectedDriver.activeShift || 'General'}</div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t('admin.drivers.driving_license') || 'Driving License'}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    {(selectedDriver.dl_status || selectedDriver.dlStatus || 'valid').toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-600 dark:text-zinc-300">
                  <div>{t('admin.drivers.license_no') || 'License No:'} <strong className="text-slate-900 dark:text-white font-mono">{selectedDriver.dl_number || selectedDriver.dlNumber || '—'}</strong></div>
                  <div>{t('admin.drivers.valid_until') || 'Valid Until:'} <strong className="text-slate-900 dark:text-white">{selectedDriver.dl_expiry || selectedDriver.dlExpiry || '—'}</strong></div>
                </div>
              </div>

              {/* Multiple Documents Attachments Component */}
              <MultipleDocumentUploader
                documents={driverDocs}
                onChange={handleSaveDriverDocs}
                title={t('admin.drivers.documents_title') || 'Driver Documents (License, ID, Medical)'}
                purpose="driver_kyc"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-zinc-800">
              {/* Verify button */}
              {canApprove && !(selectedDriver.aadhaar_verified || selectedDriver.verified) ? (
                <button
                  type="button"
                  disabled={verifyingId === selectedDriver.id}
                  onClick={() => handleVerifyDriver(selectedDriver)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {verifyingId === selectedDriver.id && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{t('admin.drivers.btn_verify_docs') || 'Verify Documents'}</span>
                </button>
              ) : (selectedDriver.aadhaar_verified || selectedDriver.verified) ? (
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('admin.drivers.docs_verified') || 'Documents Verified'}</span>
                </span>
              ) : <span />}

              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rejection Modal */}
      {rejectModalDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{t('admin.drivers.reject_docs_title') || 'Reject Driver Documents'}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Driver: <strong className="text-slate-800 dark:text-zinc-200">{rejectModalDriver.name}</strong>
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t('admin.drivers.reject_docs_note') || 'Note: Driver will be asked to re-upload clear documents.'}</span>
                </p>
              </div>
              <button
                onClick={() => setRejectModalDriver(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <FleetIcons.Close className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-200">{t('admin.drivers.rejection_reason') || 'Rejection Reason'} <span className="text-red-500">*</span></label>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">{t('admin.drivers.rejection_reason_desc') || 'This reason will be shared with the driver.'}</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('admin.drivers.rejection_reason_ph') || 'Enter the reason for rejection (e.g. photo is blurry, expired document)...'}
                rows={4}
                className="w-full text-xs p-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setRejectModalDriver(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || rejectingId === rejectModalDriver.id}
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {rejectingId === rejectModalDriver.id && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{t('admin.drivers.confirm_rejection') || 'Confirm Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
