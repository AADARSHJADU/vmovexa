import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperFinanceOfficer } from '../../hooks/superadmin/useSuperFinanceOfficer';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

export const FinanceOfficerDetailsPage = ({ officer: officerProp = null, onClose = null, onStatusChange = null }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { deleteFinanceOfficer, loadFinanceOfficer } = useSuperFinanceOfficer();

  const [localOfficer, setLocalOfficer] = useState(officerProp);
  const [documents, setDocuments] = useState(officerProp?.documents || []);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(false);

  const officerId = officerProp?.id;

  const refreshOfficer = useCallback(async () => {
    if (!officerId) return;
    try {
      setFetchLoading(true);
      const res = await loadFinanceOfficer(officerId);
      if (res) {
        setLocalOfficer((prev) => ({ ...prev, ...res }));
        if (Array.isArray(res.documents)) {
          setDocuments(res.documents);
        }
      }
    } catch (_) {
      // Fallback to initial localOfficer
    } finally {
      setFetchLoading(false);
    }
  }, [officerId]);

  useEffect(() => {
    if (officerProp) {
      setLocalOfficer(officerProp);
      if (Array.isArray(officerProp.documents)) setDocuments(officerProp.documents);
    }
    refreshOfficer();
  }, [officerProp, refreshOfficer]);

  const officer = localOfficer || {};
  const name = officer.name || 'Finance Officer';
  const email = officer.email || '—';
  const phone = officer.phone || '—';
  const enrollmentNo = officer.enrollment_no || officer.code || `VMX-FN-26-${String(officer.id || 1).padStart(6, '0')}`;
  const clearance = officer.clearance || officer.designation || 'Finance Officer';
  const department = officer.department || 'Finance';
  const status = officer.status || 'active';
  const isAct = status.toLowerCase() === 'active';
  const createdAt = officer.createdAt || officer.created_at ? new Date(officer.createdAt || officer.created_at).toLocaleDateString() : 'N/A';
  const lastLogin = officer.last_login_at || officer.lastLoginAt ? new Date(officer.last_login_at || officer.lastLoginAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never';
  const avatarUrl = officer.avatar_url || officer.avatarUrl || officer.user?.avatar_url || officer.user?.avatarUrl;

  const handleToggleStatus = async () => {
    const nextStatus = isAct ? 'suspended' : 'active';
    try {
      await toast.promise(
        superFinanceOfficerService.updateStatus(officer.id, nextStatus).then(() => {
          setLocalOfficer((prev) => ({ ...prev, status: nextStatus }));
          if (onStatusChange) onStatusChange();
        }),
        {
          loading: 'Updating officer status...',
          success: `Officer marked as ${nextStatus}!`,
          error: (err) => err?.message || 'Failed to update status.',
        }
      );
    } catch (_) {}
  };

  const handleDeleteOfficer = async () => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    try {
      setDeleting(true);
      await toast.promise(
        deleteFinanceOfficer(officer.id),
        {
          loading: 'Deleting officer...',
          success: 'Officer deleted successfully.',
          error: (err) => err?.message || 'Failed to delete finance officer.',
        }
      );
      if (onClose) onClose();
      if (onStatusChange) onStatusChange();
    } catch (_) {
      // Handled by toast
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    try {
      await toast.promise(
        superFinanceOfficerService.deleteDocument(docId),
        {
          loading: 'Removing document...',
          success: 'Document deleted!',
          error: (err) => err?.message || 'Failed to delete document.',
        }
      );
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (_) {}
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const capabilities = [
    { title: 'Tax Invoice Generation', desc: 'Can generate GST compliant tax invoices for advertisers & tenant subscriptions.', icon: FleetIcons.Reports, color: 'blue' },
    { title: 'Payment & Settlement Audit', desc: 'Can verify wire transfers, payment gateway receipts & reconcile ledger entries.', icon: FleetIcons.Analytics, color: 'emerald' },
    { title: 'Subscription Management', desc: 'Can inspect active SaaS plans, assign add-ons & review recurring cycles.', icon: FleetIcons.Fleets, color: 'purple' },
    { title: 'GST & Statutory Returns', desc: 'Direct access to monthly GSTR-1 & GSTR-3B statutory tax liability ledgers.', icon: FleetIcons.Emergency, color: 'amber' },
    { title: 'Bank Reconciliation', desc: 'Authorized to execute batch reconciliation between bank accounts and gateways.', icon: FleetIcons.Tracking, color: 'rose' },
    { title: 'Financial Reports', desc: 'Export platform reports, tenant revenue share and balance sheets.', icon: FleetIcons.Download, color: 'indigo' },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <FleetIcons.Dashboard className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <Link to="/superadmin/finance" className="text-blue-600 dark:text-blue-400 hover:underline">
          Finance Officers
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <span className="text-slate-900 dark:text-white font-bold">{officer.name || 'Officer Details'}</span>
      </nav>

      {/* Top Bar with Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 w-fit cursor-pointer"
        >
          <FleetIcons.ArrowLeft className="w-4 h-4" />
          <span>Back to Finance Officers</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit Officer */}
          <button
            onClick={() => navigate(`/superadmin/finance/${officer.id}/edit`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400 transition-all cursor-pointer"
          >
            <FleetIcons.Edit className="w-3.5 h-3.5" />
            <span>Edit Officer</span>
          </button>

          {/* Toggle Status */}
          <button
            onClick={handleToggleStatus}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              isAct
                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400'
                : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400'
            }`}
          >
            {isAct ? 'Suspend Officer' : 'Activate Officer'}
          </button>

          {/* Delete Officer */}
          <button
            onClick={handleDeleteOfficer}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 transition-all cursor-pointer disabled:opacity-50"
          >
            <FleetIcons.Trash className="w-3.5 h-3.5" />
            <span>{deleting ? 'Deleting...' : 'Delete Officer'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            {/* Avatar or Initials */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0 overflow-hidden border border-slate-200 dark:border-zinc-700">
              {avatarUrl ? (
                <img
                  src={getMediaUrl(avatarUrl)}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerText = name.charAt(0).toUpperCase();
                    }
                  }}
                />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{name}</h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  {enrollmentNo}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                    isAct
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 flex-wrap">
                <span>{clearance}</span>
                <span className="text-slate-300 dark:text-zinc-600">•</span>
                <span className="text-slate-500 dark:text-zinc-400 font-normal">{department}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0 bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Email</span>
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">{email}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Phone</span>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{phone}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Created On</span>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{createdAt}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Last Login</span>
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">{lastLogin}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'permissions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Capabilities ({capabilities.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FleetIcons.Reports className="w-3.5 h-3.5" />
            <span>Documents ({documents.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <FleetIcons.Dashboard className="w-4 h-4 text-emerald-500" />
              <span>Role & Account Details</span>
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
                <span className="text-slate-400 dark:text-zinc-500">Role</span>
                <span className="font-bold text-slate-900 dark:text-white">Finance Officer</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
                <span className="text-slate-400 dark:text-zinc-500">Designation</span>
                <span className="font-semibold text-slate-900 dark:text-white">{clearance}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
                <span className="text-slate-400 dark:text-zinc-500">Department</span>
                <span className="font-semibold text-slate-900 dark:text-white">{department}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
                <span className="text-slate-400 dark:text-zinc-500">Access Scope</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">All Tenants</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
                <span className="text-slate-400 dark:text-zinc-500">Portal Route</span>
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">/finance/dashboard</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 dark:text-zinc-500">MFA Enabled</span>
                <span className="font-semibold text-slate-900 dark:text-white">{officer.mfa_enabled ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <FleetIcons.Tracking className="w-4 h-4 text-emerald-500" />
              <span>Account Information</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              This officer has access to manage platform revenue, reconciliations, invoices, and financial reports.
            </p>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 text-[11px] text-emerald-800 dark:text-emerald-300">
              <strong>Login Info:</strong> Finance officers can log in using their email and password to access the finance dashboard.
            </div>
          </div>
        </div>
      )}
      {/* Tab 2: Capabilities */}
      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <cap.icon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cap.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Documents ({documents.length})
            </h3>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {documents.length} document{documents.length === 1 ? '' : 's'}
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#11141d]">
              <FleetIcons.Reports className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">No documents uploaded yet.</p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                Upload appointment orders or ID documents via the Edit Officer form.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const docUrl = getMediaUrl(doc.url || doc.file_url);
                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#11141d] hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FleetIcons.Reports className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {doc.purpose || 'Document'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 uppercase font-bold">
                            {doc.mime ? doc.mime.split('/')[1] : 'PDF'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                          {doc.storage_key ? doc.storage_key.split('/').pop() : `Document #${doc.id}`}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                          <span>Size: {formatFileSize(doc.size)}</span>
                          {doc.created_at && (
                            <>
                              <span>•</span>
                              <span>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {docUrl && (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                          title="View / Download Document"
                        >
                          <FleetIcons.Eye className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <FleetIcons.Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinanceOfficerDetailsPage;

