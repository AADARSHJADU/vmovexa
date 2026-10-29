import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperFinanceOfficer } from '../../hooks/superadmin/useSuperFinanceOfficer';
import { superFinanceOfficerService } from '../../api/services/superadmin/financeOfficer.service';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

export const FinanceOfficerDetailsPage = ({ officer: officerProp = null, onClose = null, onStatusChange = null }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const { deleteFinanceOfficer, loadFinanceOfficer } = useSuperFinanceOfficer();
  const { impersonateUser, hasPermission } = useAuth();
  const canImpersonate = hasPermission('platform.impersonate');

  const officerId = officerProp?.id || paramId;
  const [localOfficer, setLocalOfficer] = useState(officerProp);
  const [documents, setDocuments] = useState(officerProp?.documents || []);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(false);
  const [impersonating, setImpersonating] = useState(false);

  const refreshOfficer = useCallback(async () => {
    if (!officerId) return;
    try {
      setFetchLoading(true);
      const res = await superFinanceOfficerService.getFinanceOfficer(officerId);
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
  const department = officer.department || 'Finance & Accounts';
  const status = officer.status || 'active';
  const isAct = status.toLowerCase() === 'active';
  const isSuspended = status.toLowerCase() === 'suspended';
  const createdAt = officer.createdAt || officer.created_at ? new Date(officer.createdAt || officer.created_at).toLocaleDateString() : '—';
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
          success: `Officer status marked as ${nextStatus}!`,
          error: (err) => err?.message || 'Failed to update status.',
        }
      );
    } catch (_) {}
  };

  const handleDeleteOfficer = async () => {
    if (!window.confirm(`Are you sure you want to delete finance officer "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setDeleting(true);
      await toast.promise(
        deleteFinanceOfficer(officer.id),
        {
          loading: 'Deleting finance officer...',
          success: 'Finance officer deleted successfully!',
          error: (err) => err?.message || 'Failed to delete finance officer.',
        }
      );
      if (onClose) {
        onClose();
      } else {
        navigate('/superadmin/finance');
      }
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

  const handleImpersonate = async () => {
    if (!officer?.id || impersonating) return;
    setImpersonating(true);
    try {
      await toast.promise(
        impersonateUser(officer.id).then(() => {
          navigate('/finance/dashboard');
        }),
        {
          loading: `Connecting to ${name} finance console…`,
          success: `Logged in as Finance Officer ${name}!`,
          error: (e) => e.message || `Failed to access finance console.`,
        }
      );
    } catch (err) {
      console.error('Impersonation error:', err);
    } finally {
      setImpersonating(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const financialAuthorities = [
    'Tax Invoice Generation',
    'GST & Statutory Filings (GSTR-1 / 3B)',
    'Payment Gateway & Ledger Audit',
    'Subscription Plans & Billing',
    'Tenant Revenue Settlements',
    'Bank Account Reconciliation',
    'Financial Balance Sheets & Export',
    'Platform Fee Disbursals',
  ];

  const capabilities = [
    {
      title: 'Tax Invoice Generation',
      desc: 'Can generate GST compliant tax invoices for advertisers & tenant subscriptions.',
      icon: FleetIcons.Reports,
      color: 'blue',
    },
    {
      title: 'Payment & Settlement Audit',
      desc: 'Can verify wire transfers, payment gateway receipts & reconcile ledger entries.',
      icon: FleetIcons.Analytics,
      color: 'emerald',
    },
    {
      title: 'Subscription Management',
      desc: 'Can inspect active SaaS plans, assign add-ons & review recurring billing cycles.',
      icon: FleetIcons.Fleets,
      color: 'purple',
    },
    {
      title: 'GST & Statutory Returns',
      desc: 'Direct access to monthly GSTR-1 & GSTR-3B statutory tax liability ledgers.',
      icon: FleetIcons.Emergency,
      color: 'amber',
    },
    {
      title: 'Bank Reconciliation',
      desc: 'Authorized to execute batch reconciliation between bank accounts and payment gateways.',
      icon: FleetIcons.Tracking,
      color: 'rose',
    },
    {
      title: 'Financial Reports',
      desc: 'Export platform reports, tenant revenue share and balance sheet summaries.',
      icon: FleetIcons.Download,
      color: 'indigo',
    },
  ];

  if (fetchLoading && !localOfficer?.id) {
    return (
      <div className="w-full space-y-6 animate-pulse p-4">
        <div className="h-4 w-48 bg-slate-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-40 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-100 dark:bg-zinc-900 rounded-2xl"></div>
          <div className="h-64 md:col-span-2 bg-slate-100 dark:bg-zinc-900 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!fetchLoading && !localOfficer?.id) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <FleetIcons.Security className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('superadmin.finance_officer.not_found', 'Finance Officer Not Found')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          The requested finance officer (ID: {officerId}) does not exist or could not be loaded from the server.
        </p>
        <button
          type="button"
          onClick={() => navigate('/superadmin/finance')}
          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 cursor-pointer shadow-sm transition-colors"
        >
          {t('superadmin.finance_officer.back_to_list', 'Back to Finance Officers')}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('nav.superadmin', 'Super Admin'), path: '/superadmin/dashboard' },
          { label: t('superadmin.finance_officer.title', 'Finance Officers'), path: '/superadmin/finance' },
          { label: name },
        ]}
        className="mb-1"
      />

      {/* Top Bar with Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose || (() => navigate('/superadmin/finance'))}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('superadmin.finance_officer.back_to_list', 'Back to Finance Officers')}</span>
          </button>
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 font-semibold">
            {enrollmentNo}
          </span>
          {fetchLoading && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400 animate-pulse font-medium">
              Syncing live data...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit Profile */}
          <button
            type="button"
            onClick={() => navigate(`/superadmin/finance/${officer.id}/edit`)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FleetIcons.Edit className="w-3.5 h-3.5" />
            <span>{t('superadmin.finance_officer.edit_profile', 'Edit Profile')}</span>
          </button>

          {/* Delete Officer */}
          <button
            type="button"
            onClick={handleDeleteOfficer}
            disabled={deleting}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FleetIcons.Trash className="w-3.5 h-3.5" />
            <span>{t('common.delete', 'Delete')}</span>
          </button>

          {/* Suspend / Activate */}
          <button
            type="button"
            onClick={handleToggleStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              !isSuspended
                ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
            }`}
          >
            {!isSuspended ? t('common.suspend', 'Suspend Account') : t('common.activate', 'Activate Account')}
          </button>

          {/* Primary Action Button - Impersonate / Open Finance Console */}
          {canImpersonate ? (
            <button
              type="button"
              onClick={handleImpersonate}
              disabled={impersonating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FleetIcons.Key className="w-3.5 h-3.5 text-white" />
              <span>{impersonating ? 'Connecting…' : 'Open Finance Console'}</span>
            </button>
          ) : (
            <Link
              to="/finance/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <FleetIcons.Reports className="w-3.5 h-3.5 text-white" />
              <span>{t('superadmin.finance_officer.finance_dashboard', 'Finance Dashboard')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Officer Banner / Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Avatar or Initials */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0 overflow-hidden border-2 border-blue-500 relative">
              <span className="select-none">{String(name || 'F').charAt(0).toUpperCase()}</span>
              {avatarUrl ? (
                <img
                  src={getMediaUrl(avatarUrl)}
                  alt={name}
                  className="w-full h-full object-cover absolute inset-0 z-10"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {name}
                </h1>
                <span
                  className={`text-[11px] font-bold px-3 py-0.5 rounded-full border uppercase tracking-wider ${
                    isSuspended
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                  }`}
                >
                  {isSuspended ? 'Suspended' : 'Active'}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50">
                  {clearance}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {department} · {t('superadmin.finance_officer.access_scope', 'Access')}: <strong className="text-slate-700 dark:text-zinc-300">{t('superadmin.finance_officer.all_tenants_scope', 'All Tenants & Platform Ledgers')}</strong> · {t('common.code', 'Code')}: <span className="font-mono">{enrollmentNo}</span>
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-zinc-300 pt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <FleetIcons.Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  <span>{email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FleetIcons.Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  <span>{phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FleetIcons.Ticket className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  <span className="font-mono text-[11px]">{enrollmentNo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            {t('superadmin.finance_officer.designation', 'Designation')}
          </span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1 truncate">
            {clearance}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {t('common.department', 'Department')}
          </span>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            {department}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {t('superadmin.finance_officer.access_scope', 'Access Scope')}
          </span>
          <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1 truncate">
            Global Ledgers
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            {t('common.last_login', 'Last Login')}
          </span>
          <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1 truncate">
            {lastLogin}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
        {[
          { key: 'overview', label: t('superadmin.finance_officer.role_account_status', 'Profile & Account') },
          { key: 'capabilities', label: `${t('superadmin.finance_officer.capabilities', 'Financial Capabilities')} (${capabilities.length})` },
          { key: 'documents', label: `${t('common.documents', 'Documents')} (${documents.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile & Account */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <FleetIcons.Profile className="w-4 h-4 text-blue-500" />
                <span>{t('superadmin.finance_officer.personal_info', 'Personal Information')}</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.finance_officer.full_name', 'Full Name')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.finance_officer.staff_code', 'Staff Code')}</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{enrollmentNo}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">{t('common.email', 'Email')}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">{t('common.phone', 'Phone')}</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">{phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">{t('common.department', 'Department')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{department}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.finance_officer.portal_route', 'Portal Route')}</span>
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{'/finance/dashboard'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <FleetIcons.Shield className="w-4 h-4 text-purple-500" />
                <span>{t('superadmin.finance_officer.role_account_status', 'Role & Account Status')}</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">{t('common.role', 'Role')}</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{t('roles.finance_officer', 'Finance Officer')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.finance_officer.designation', 'Designation')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{clearance}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">{t('common.status', 'Account Status')}</span>
                  <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">{status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.finance_officer.access_scope', 'Access Scope')}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t('superadmin.finance_officer.all_tenants_scope', 'All Tenants & Ledgers')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.finance_officer.mfa_verification', 'MFA Verification')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{officer.mfa_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 dark:text-zinc-500">{t('common.joined', 'Joined')}</span>
                  <span className="font-mono text-slate-600 dark:text-zinc-400">{createdAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Authorities & Delegations Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
              <FleetIcons.Check className="w-4 h-4 text-blue-500" />
              <span>{t('superadmin.finance_officer.financial_authorities', 'Financial Authorities & Delegations')}</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {financialAuthorities.map((auth, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 inline-flex items-center gap-1.5"
                >
                  <FleetIcons.Check className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{auth}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Capabilities */}
      {activeTab === 'capabilities' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('superadmin.finance_officer.capabilities', 'Authorized Financial Capabilities')}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Platform modules, ledger access scopes, and transactional permissions granted to this officer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {capabilities.map((cap, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors space-y-2"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <cap.icon className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cap.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Verification & Official Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('common.documents', 'Documents')} ({documents.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Official appointment orders, identity proof, and compliance certificates
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/superadmin/finance/${officer.id}/edit`)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FleetIcons.Plus className="w-3.5 h-3.5" />
              <span>{t('common.upload_document', 'Upload Document')}</span>
            </button>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const docUrl = getMediaUrl(doc.url || doc.file_url);
                const docName = doc.file_name || doc.fileName || doc.storage_key?.split('/')?.pop() || `Document #${doc.id}`;
                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-600 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold text-lg shrink-0">
                        <FleetIcons.Document className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {docName}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {doc.purpose || 'Verification Doc'}
                          </span>
                          {doc.size && (
                            <span className="text-[10px] text-slate-400">
                              {formatFileSize(doc.size)}
                            </span>
                          )}
                          {(doc.createdAt || doc.created_at) && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(doc.createdAt || doc.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {docUrl && (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-zinc-600 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <FleetIcons.Eye className="w-3.5 h-3.5" />
                          <span>{t('common.view', 'View')}</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 cursor-pointer transition-colors"
                        title={t('common.delete', 'Delete Document')}
                      >
                        <FleetIcons.Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500 space-y-3">
              <FleetIcons.Document className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto" />
              <p className="text-xs font-medium">{t('superadmin.finance_officer.no_docs', 'No verified documents or appointment orders uploaded for this finance officer yet.')}</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/superadmin/finance/${officer.id}/edit`)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FleetIcons.Plus className="w-3.5 h-3.5" />
                  <span>{t('superadmin.finance_officer.upload_docs_now', 'Upload Documents Now')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinanceOfficerDetailsPage;


