/* Route and prop data intentionally synchronize the tenant detail view state. */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useOrganization } from '../../hooks/superadmin/useOrganization';
import { useAuth } from '../../hooks/useAuth';
import { superOrganizationService } from '../../api/services/superadmin/organization.service';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

const isActive = (status) => String(status || '').toLowerCase() === 'active';
const isApprovedStatus = (status) => String(status || '').toLowerCase() === 'approved';
const isSuspendedStatus = (status) => String(status || '').toLowerCase() === 'suspended';

const formatPlanName = (plan) => {
  if (!plan) return 'No Plan Selected';
  if (typeof plan === 'object') return plan.name || plan.code || 'Custom Plan';
  return String(plan);
};


/**
 * TenantDetailsPage — supports two modes:
 *   1. Modal/overlay mode: pass `org` prop (tenant object from list) + `onClose` callback.
 *      Displays instantly with passed data; does a background refresh silently.
 *      URL does NOT change — no ID exposed in address bar.
 *   2. Route mode (legacy): no props — reads `id` from URL params, fetches from API.
 */
export const TenantDetailsPage = ({ org: orgProp = null, onClose = null }) => {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { impersonateTenant, hasPermission } = useAuth();
  const routeId = params?.id;
  const { currentOrganization, loadOrganization, updateStatus } = useOrganization();

  const isFinance = location.pathname.startsWith('/finance') || location.pathname.startsWith('/superadmin/finance');
  const basePath = location.pathname.startsWith('/finance/subscriptions')
    ? '/finance/subscriptions'
    : location.pathname.startsWith('/superadmin/finance/subscriptions')
    ? '/superadmin/finance/subscriptions'
    : '/superadmin/tenants';

  const canApprove = hasPermission('orgs.approve');
  const canSuspend = hasPermission('orgs.suspend');
  const canImpersonate = hasPermission('platform.impersonate');
  const canEditTenant = hasPermission('orgs.update') || hasPermission('finance.subscriptions.update') || hasPermission('finance.subscriptions.manage');

  // In modal mode start with passed org object for instant display (no loading flicker)
  const [localOrg, setLocalOrg] = useState(orgProp);
  const [fetchLoading, setFetchLoading] = useState(!orgProp);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [impersonating, setImpersonating] = useState(false);

  // Reset Admin Password Modal states
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(true);
  const [notifyAdminEmail, setNotifyAdminEmail] = useState(true);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Which ID to fetch
  const orgId = orgProp?.id || routeId;

  const fetchTenant = useCallback(async () => {
    if (!orgId) return;
    if (!orgProp) setFetchLoading(true);
    setFetchError(null);
    try {
      const data = await loadOrganization(orgId);
      if (data) setLocalOrg(data);
    } catch (err) {
      setFetchError(err?.message || 'Failed to load tenant details.');
    } finally {
      setFetchLoading(false);
    }
  }, [orgId, orgProp, loadOrganization]);

  useEffect(() => { fetchTenant(); }, [fetchTenant]);

  // Sync localOrg with Redux currentOrganization after background fetch
  useEffect(() => {
    if (currentOrganization && String(currentOrganization.id) === String(orgId)) {
      setLocalOrg(currentOrganization);
    }
  }, [currentOrganization, orgId]);

  // Update localOrg if orgProp changes (e.g. different tenant clicked)
  useEffect(() => { if (orgProp) setLocalOrg(orgProp); }, [orgProp]);

  const tenant = localOrg || {};
  const primaryAdmin = tenant.primaryAdmin || (Array.isArray(tenant.users) ? tenant.users[0] : null) || tenant.admin || {};
  const depotsList = Array.isArray(tenant.depots) ? tenant.depots : [];
  const invoicesList = Array.isArray(tenant.invoices) ? tenant.invoices : [];
  const paymentsList = Array.isArray(tenant.payments) ? tenant.payments : [];
  const active = isActive(tenant.status);
  const isApproved = isApprovedStatus(tenant.status);
  const isSuspended = isSuspendedStatus(tenant.status);
  const isPending = tenant.status === 'pending_approval';
  const isAwaitingSub = tenant.status === 'awaiting_subscription';
  const hasSubscriptionOrPlan = Boolean(tenant.plan || tenant.subscription || (tenant.plan_id && Number(tenant.plan_id) > 0));
  const hasPaidRecord = invoicesList.some((i) => i.status === 'paid') || paymentsList.some((p) => p.status === 'completed' || p.status === 'success') || (tenant.subscription && tenant.subscription.status === 'active');
  const isPaid = (tenant.payment_status === 'paid' || hasPaidRecord) && !isPending && hasSubscriptionOrPlan;
  const isPaymentPending = !isPaid && !isPending && hasSubscriptionOrPlan;
  const planRate = Number(tenant.plan?.monthly_price || (Number(tenant.mrr) > 0 ? tenant.mrr : 0));

  const planFeatures = (typeof tenant.plan?.features === 'object' && tenant.plan?.features !== null)
    ? tenant.plan.features
    : {};

  // Purchase & Activation Dates — only valid if a subscription or paid record actually exists
  const rawPurchaseDate = tenant.subscription?.created_at
    || tenant.subscription?.current_period_start
    || (invoicesList.find((i) => i.status === 'paid')?.paid_at)
    || (paymentsList.find((p) => p.status === 'success' || p.status === 'completed' || p.status === 'paid')?.paid_at);

  const formattedPurchaseDate = (() => {
    if (!rawPurchaseDate) return isPaid ? 'Active' : 'Awaiting Activation';
    try {
      const dt = new Date(rawPurchaseDate);
      if (isNaN(dt.getTime())) return isPaid ? 'Active' : 'Awaiting Activation';
      return dt.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isPaid ? 'Active' : 'Awaiting Activation';
    }
  })();

  const rawRenewalDate = tenant.subscription?.current_period_end
    || tenant.subscription?.next_billing_at;

  const formattedRenewalDate = (() => {
    if (!rawRenewalDate) return isPaid ? 'Renews Monthly' : 'Monthly upon activation';
    try {
      const dt = new Date(rawRenewalDate);
      if (isNaN(dt.getTime())) return isPaid ? 'Renews Monthly' : 'Monthly upon activation';
      return dt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isPaid ? 'Renews Monthly' : 'Monthly upon activation';
    }
  })();

  // Quota and Feature Limits vs Actual Usage Calculations
  // Core 4 SaaS Plan Quotas: Vehicles/Buses, Drivers, Depots & Garages, Fleet Operators
  const busLimit = Number(tenant.plan?.buses_limit ?? tenant.buses_quota ?? 5);
  const busUsed = Number(tenant.actual_buses_count ?? 0);
  const busPercent = busLimit > 0 ? Math.min(100, Math.round((busUsed / busLimit) * 100)) : 0;
  const busRemaining = Math.max(0, busLimit - busUsed);

  const driverLimit = Number(tenant.plan?.drivers_limit ?? planFeatures.drivers_limit ?? 3);
  const driverUsed = Number(tenant.actual_drivers_count ?? 0);
  const driverPercent = driverLimit > 0 ? Math.min(100, Math.round((driverUsed / driverLimit) * 100)) : 0;
  const driverRemaining = Math.max(0, driverLimit - driverUsed);

  const depotLimit = Number(tenant.plan?.depots_limit ?? planFeatures.depots_limit ?? tenant.depots_count ?? 2);
  const depotUsed = Number(tenant.actual_depots_count ?? depotsList.length ?? 0);
  const depotPercent = depotLimit > 0 ? Math.min(100, Math.round((depotUsed / depotLimit) * 100)) : 0;
  const depotRemaining = Math.max(0, depotLimit - depotUsed);

  const operatorLimit = Number(tenant.plan?.fleet_operators_limit ?? planFeatures.fleet_operators_limit ?? 3);
  const operatorUsed = Number(tenant.actual_fleet_operators_count ?? 0);
  const operatorPercent = operatorLimit > 0 ? Math.min(100, Math.round((operatorUsed / operatorLimit) * 100)) : 0;
  const operatorRemaining = Math.max(0, operatorLimit - operatorUsed);

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(basePath);
  };

  const handleToggleStatus = async () => {
    // If tenant has not paid yet, re-activating restores to 'approved', not bypassing paywall to 'active'
    const newStatus = isSuspended ? (isPaid ? 'active' : 'approved') : 'suspended';
    try {
      await toast.promise(
        updateStatus(tenant.id, newStatus).then(() => loadOrganization(orgId)),
        {
          loading: t('common.loading', 'Updating status...'),
          success: isSuspended ? t('tenants.reactivated_success', 'Tenant re-activated successfully!') : t('tenants.suspended_success', 'Tenant suspended / frozen successfully!'),
          error: (e) => e.message || 'Failed to update.'
        }
      );
    } catch {
      // toast.promise reports the failure.
    }
  };

  const handleApprove = async () => {
    try {
      await toast.promise(
        superOrganizationService.approveOrganization(tenant.id, { activateTrial: false, planId: 1 }).then(() => loadOrganization(orgId)),
        {
          loading: 'Approving application…',
          success: 'Tenant approved & awaiting plan subscription!',
          error: (e) => e.message || 'Approval failed.',
        }
      );
    } catch {
      // toast.promise reports the failure.
    }
  };

  const handleImpersonate = async () => {
    if (impersonating || !orgId) return;
    setImpersonating(true);
    try {
      await toast.promise(
        impersonateTenant(orgId).then(() => {
          navigate('/admin/dashboard');
        }),
        {
          loading: `Connecting to ${tenant.name || 'Tenant'} admin console…`,
          success: `Logged in as Admin of ${tenant.name || 'Tenant'}!`,
          error: (e) => e.message || 'Failed to impersonate tenant admin.',
        }
      );
    } catch (err) {
      console.error('Impersonation failed:', err);
    } finally {
      setImpersonating(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please enter reason for rejecting this application:');
    if (reason === null) return;
    try {
      await toast.promise(
        superOrganizationService.rejectOrganization(tenant.id, { reason }).then(() => loadOrganization(orgId)),
        {
          loading: 'Rejecting application…',
          success: 'Tenant rejected.',
          error: (e) => e.message || 'Rejection failed.',
        }
      );
    } catch {
      // toast.promise reports the failure.
    }
  };

  const generateStrongPassword = () => {
    const specials = '!@#$%&*';
    const numbers = '23456789';
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let pwd = 'Vmx@';
    for (let i = 0; i < 6; i++) {
      pwd += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pwd += specials.charAt(Math.floor(Math.random() * specials.length));
    return pwd;
  };

  const handleOpenResetModal = () => {
    setResetResult(null);
    setCopiedPassword(false);
    setResetPasswordValue(generateStrongPassword());
    setShowPasswordText(true);
    setNotifyAdminEmail(true);
    setResetModalOpen(true);
  };

  const handleConfirmResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (resettingPassword || !tenant.id) return;
    if (!resetPasswordValue || resetPasswordValue.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setResettingPassword(true);
    try {
      const res = await superOrganizationService.resetAdminPassword(tenant.id, {
        password: resetPasswordValue.trim() || undefined,
        notifyEmail: notifyAdminEmail,
      });
      setResetResult(res);
      toast.success('Admin password reset successfully!');
      loadOrganization(orgId);
    } catch (err) {
      toast.error(err?.message || 'Failed to reset admin password.');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleCopyNewPassword = (pwd) => {
    if (!pwd) return;
    navigator.clipboard.writeText(pwd).then(() => {
      setCopiedPassword(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setCopiedPassword(false), 3000);
    }).catch(() => {
      toast.error('Failed to copy password.');
    });
  };

  // Loading State Skeleton — only shown when no orgProp was given and we are still fetching
  if (fetchLoading && !localOrg) {
    return (
      <div className="w-full space-y-6 animate-pulse p-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 bg-slate-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-3 w-64 bg-slate-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 h-24"></div>
          ))}
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 h-64"></div>
      </div>
    );
  }

  // Error State — only show blocking error when we have no fallback data
  if (fetchError && !localOrg) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('common.back', 'Back to Tenants')}</span>
          </button>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center space-y-3">
          <div className="flex items-center justify-center">
            <FleetIcons.Alert className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-base font-bold text-red-900 dark:text-red-200">{t('superadmin.tenant_details.failed_to_load', 'Failed to Load Tenant Details')}</h2>
          <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto">{fetchError}</p>
          <div className="pt-2">
            <button
              onClick={fetchTenant}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If organization is not found after loading
  if (!localOrg || !localOrg.id) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('common.back', 'Back to Tenants')}</span>
          </button>
        </div>
        <div className="min-h-[360px] flex flex-col items-center justify-center p-12 bg-white dark:bg-[#11141d] rounded-2xl border border-slate-200 dark:border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto">
            <FleetIcons.Building className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('superadmin.tenant_details.tenant_not_found', 'Tenant Not Found')}</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm">
              The requested tenant organization (ID: {orgId}) could not be retrieved from the server.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-500 transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('superadmin.tenant_details.back_to_tenants', 'Back to Tenants')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Pending Approval Banner */}
      {isPending && (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>{t('superadmin.tenant_details.pending_verification_title', 'Onboarding Application Pending Verification')}</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-200/90 font-medium leading-relaxed">
              This organization self-registered through the web portal. Review the legal entity and approve to advance to subscription selection or activate immediate sandbox access.
            </p>
          </div>
          {canApprove ? (
            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Approve (Advance to Plan)
              </button>
              <button
                onClick={handleReject}
                className="px-3 py-2 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <span className="px-3.5 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-700">
                Awaiting Super Admin Approval
              </span>
            </div>
          )}
        </div>
      )}

      {/* Payment Pending Alert Banner — only shown when a plan is actually chosen */}
      {isPaymentPending && !isPending && hasSubscriptionOrPlan && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 font-black text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span>{t('superadmin.tenant_details.payment_pending_title', 'Subscription Payment Pending — Online Checkout Not Settled')}</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-200/90 font-medium leading-relaxed">
              {t('superadmin.tenant_details.payment_pending_desc', 'This organization is approved on the platform with Online Payment Mode. The administrator has not yet completed payment. Fleet operations, telematics, and display units remain inactive until the subscription invoice is settled.')}
            </p>
          </div>
          {canImpersonate && (
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={handleImpersonate}
                disabled={impersonating}
                className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{t('superadmin.tenant_details.login_as_admin_to_pay', 'Login as Admin to Pay →')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Top Bar with Back Button & Breadcrumbs */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleClose}
          className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>{isFinance ? 'Back to Subscriptions' : 'Back to Tenants'}</span>
        </button>
        <span className="text-slate-300 dark:text-zinc-700">|</span>
        <nav aria-label={t('common.breadcrumb', 'Breadcrumb')} className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              navigate(isFinance ? '/finance/subscriptions' : '/superadmin/dashboard');
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 text-xs font-semibold transition-colors"
          >
            <FleetIcons.Dashboard className="w-3.5 h-3.5 shrink-0" />
            <span>{isFinance ? 'Finance' : 'Super Admin'}</span>
          </button>
          <span className="text-slate-300 dark:text-zinc-600 select-none">/</span>
          <button
            type="button"
            onClick={handleClose}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer bg-transparent border-none p-0 text-xs font-semibold transition-colors"
          >
            {isFinance ? 'Tenants' : 'Tenants Directory'}
          </button>
          <span className="text-slate-300 dark:text-zinc-600 select-none">/</span>
          <span className="text-slate-900 dark:text-white font-bold truncate max-w-[180px] sm:max-w-md">
            {tenant.name || 'Tenant Details'}
          </span>
        </nav>
      </div>

      {/* Header — Fully Responsive Layout */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        {/* Left: Avatar + Identity & Status */}
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">

          {/* Logo / Avatar */}
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden shrink-0 shadow-sm relative flex items-center justify-center">
            {(tenant.logo_url || tenant.logoUrl || tenant.logo) ? (
              <img
                src={getMediaUrl(tenant.logo_url || tenant.logoUrl || tenant.logo)}
                alt={tenant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center font-black text-white text-base sm:text-lg shadow-inner"
              style={{ display: (tenant.logo_url || tenant.logoUrl || tenant.logo) ? 'none' : 'flex' }}
            >
              {tenant.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
          </div>

          {/* Details & Badges */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight break-words">
                {tenant.name || 'Tenant'}
              </h1>
              
              {/* Code */}
              <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                {tenant.code || tenant.id}
              </span>

              {/* Status Badge */}
              <span
                className={`text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                  active
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : isApproved
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    : isPending
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : isSuspended
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                {active
                  ? t('common.active', 'Active')
                  : isApproved
                  ? 'Approved'
                  : isPending
                  ? 'Pending Approval'
                  : isAwaitingSub
                  ? 'Awaiting Subscription'
                  : isSuspended
                  ? t('common.suspended', 'Suspended')
                  : tenant.status || 'Active'}
              </span>

              {/* Payment Status Badge */}
              {isPaid ? (
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{t('superadmin.tenant_details.badge_paid', 'Paid')}</span>
                </span>
              ) : isPaymentPending ? (
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 flex items-center gap-1.5 shadow-2xs animate-pulse shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>{t('superadmin.tenant_details.badge_payment_pending', 'Payment Pending')}</span>
                </span>
              ) : !hasSubscriptionOrPlan && !isPending ? (
                <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 shrink-0">
                  <span>{t('superadmin.tenant_details.badge_no_subscription', 'No Subscription')}</span>
                </span>
              ) : null}
            </div>

            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-medium truncate" title={`${[tenant.city, tenant.state].filter(Boolean).join(', ') || '—'} · Edge Agent ${tenant.edge_agent_version || tenant.edgeAgentVersion || 'v2.4-arm64'}`}>
              {[tenant.city, tenant.state].filter(Boolean).join(', ') || '—'} · <span className="font-mono text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">Edge Agent {tenant.edge_agent_version || tenant.edgeAgentVersion || 'v2.4-arm64'}</span>
            </p>
          </div>
        </div>

        {/* Right: Action Buttons (Responsive grid on mobile, row on tablet/desktop) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-2.5 w-full xl:w-auto shrink-0">
          {/* Edit Tenant button */}
          {canEditTenant && (
            <button
              type="button"
              onClick={() => navigate(`${basePath}/${tenant.id}/edit`)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <FleetIcons.Edit className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t('superadmin.tenant_details.btn_edit_tenant', 'Edit Tenant')}</span>
            </button>
          )}

          {/* Impersonate button */}
          {canImpersonate && (
            <button
              type="button"
              onClick={handleImpersonate}
              disabled={impersonating}
              title={`Log in as Admin of ${tenant.name || 'tenant'} without credentials`}
              className="w-full sm:w-auto px-3 sm:px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {impersonating ? (
                <svg className="w-3.5 h-3.5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              <span className="truncate">{impersonating ? t('superadmin.tenant_details.connecting', 'Connecting…') : t('superadmin.tenant_details.btn_login_as_admin', 'Impersonate')}</span>
            </button>
          )}

          {/* Status action button: Approve / Re-activate / Suspend */}
          {isPending ? (
            canApprove ? (
              <button
                type="button"
                onClick={() => handleApprove(false)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
              >
                <span>{t('common.approve', 'Approve')}</span>
              </button>
            ) : (
              <div className="w-full sm:w-auto px-3 sm:px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-center flex items-center justify-center gap-1.5 shadow-2xs">
                <span>{t('superadmin.tenant_details.badge_pending_verification', 'Pending Verification')}</span>
              </div>
            )
          ) : isSuspended ? (
            canSuspend && (
              <button
                type="button"
                onClick={handleToggleStatus}
                className="w-full sm:w-auto px-3 sm:px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors text-center cursor-pointer bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center justify-center gap-1.5 active:scale-98 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">{t('tenants.reactivate_btn', 'Re-activate')}</span>
              </button>
            )
          ) : (
            canSuspend && (
              <button
                type="button"
                onClick={handleToggleStatus}
                className="w-full sm:w-auto px-3 sm:px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors text-center cursor-pointer bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 flex items-center justify-center gap-1.5 active:scale-98 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                <span className="truncate">{t('tenants.freeze_btn', 'Freeze / Suspend Tenant')}</span>
              </button>
            )
          )}

          {/* Reset password button */}
          <button
            type="button"
            onClick={handleOpenResetModal}
            className="w-full sm:w-auto px-3 sm:px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors text-center border border-slate-200 dark:border-zinc-700 cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 shadow-2xs"
          >
            <FleetIcons.Key className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
            <span className="truncate">{t('tenants.reset_pwd', 'Reset Admin Password')}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards — Clear, Intuitive Tenant Operational Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Subscription Tier & Pricing */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">
              {t('tenants.subscription_plan', 'Subscription Plan')}
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FleetIcons.Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate" title={hasSubscriptionOrPlan ? formatPlanName(tenant.plan) : 'No Plan Selected'}>
              {hasSubscriptionOrPlan ? formatPlanName(tenant.plan) : 'No Plan Selected'}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {hasSubscriptionOrPlan ? (
                <>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{planRate.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">/{t('superadmin.tenant_details.mo', 'mo')}</span>
                  </span>
                  <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">•</span>
                  <span className="hidden sm:inline text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    Monthly
                  </span>
                </>
              ) : (
                <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                  {isPending ? 'Pending Verification' : 'Not Subscribed'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Billing & Payment Status */}
        <div className={`bg-white dark:bg-zinc-900 border rounded-2xl p-3 sm:p-4 shadow-xs transition-all flex flex-col justify-between ${
          !hasSubscriptionOrPlan
            ? 'border-slate-200/80 dark:border-zinc-800'
            : isPaid 
            ? 'border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-300' 
            : 'border-amber-200/80 dark:border-amber-900/50 hover:border-amber-300'
        }`}>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">
              {t('tenants.payment_status', 'Payment Status')}
            </span>
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 ${
              !hasSubscriptionOrPlan
                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                : isPaid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
            }`}>
              {!hasSubscriptionOrPlan ? (
                <FleetIcons.Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-zinc-400" />
              ) : isPaid ? (
                <FleetIcons.Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <FleetIcons.Alert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-sm sm:text-xl font-black tracking-tight flex items-center gap-1.5 truncate ${
              !hasSubscriptionOrPlan
                ? 'text-slate-600 dark:text-zinc-400'
                : isPaid
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {!hasSubscriptionOrPlan ? (
                <>
                  <FleetIcons.Clock className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                  <span>{t('superadmin.tenant_details.badge_unbilled', 'Unbilled')}</span>
                </>
              ) : isPaid ? (
                <>
                  <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{t('superadmin.tenant_details.badge_paid', 'Paid')}</span>
                </>
              ) : (
                <>
                  <FleetIcons.Alert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{t('superadmin.tenant_details.badge_payment_pending', 'Pending')}</span>
                </>
              )}
            </div>
            <div className="mt-0.5">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate block">
                {!hasSubscriptionOrPlan
                  ? (isPending ? 'Awaiting KYC Approval' : 'No invoices generated')
                  : isPaid
                  ? 'Settled & In Good Standing'
                  : 'Invoice Payment Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Enrolled Fleet vs Quota */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">
              {t('tenants.fleet_vehicles', 'Fleet Vehicles')}
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FleetIcons.Bus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
              <span>{busUsed}</span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-zinc-500">
                / {busLimit}
              </span>
            </div>
            <div className="mt-0.5">
              <span className="text-[10px] sm:text-[11px] font-medium text-blue-600 dark:text-blue-400 truncate block">
                {busRemaining} slots free
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Operating Depots / Region */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">
              {t('tenants.depots_region', 'Depots & Coverage')}
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <FleetIcons.Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
              <span>{depotUsed}</span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-zinc-500">
                / {depotLimit} Depots
              </span>
            </div>
            <div className="mt-0.5 truncate" title={[tenant.city, tenant.state].filter(Boolean).join(', ')}>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate block">
                {depotRemaining} free · {[tenant.city, tenant.state].filter(Boolean).join(', ') || 'Unassigned'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        {[
          { id: 'overview', label: t('tenants.overview_tab', 'Organization Overview'), shortLabel: 'Overview', icon: <FleetIcons.Document className="w-3.5 h-3.5 shrink-0" /> },
          { id: 'depots', label: `${t('tenants.depots_tab', 'Depot & Fleet Roster')} (${depotsList.length})`, shortLabel: `Depots (${depotsList.length})`, icon: <FleetIcons.Bus className="w-3.5 h-3.5 shrink-0" /> },
          { id: 'billing', label: `${t('tenants.tax_invoices_tab', 'Tax Invoices')} (${invoicesList.length})`, shortLabel: `Invoices (${invoicesList.length})`, icon: <FleetIcons.Ticket className="w-3.5 h-3.5 shrink-0" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW — Clean, Simplified Organization & Account Info */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 animate-in fade-in duration-200">
          {/* Left: Organization & Administrator */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FleetIcons.Profile className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('tenants.company_admin', 'Company & Administrator')}
                </h2>
              </div>
              {primaryAdmin?.status && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  {String(primaryAdmin.status).replace(/_/g, ' ')}
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800/60 gap-2">
                <span className="text-slate-500 dark:text-zinc-400 shrink-0">{t('tenants.admin_name', 'Admin Name')}</span>
                <span className="font-bold text-slate-900 dark:text-white text-right truncate">{primaryAdmin.name || tenant.adminName || '—'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800/60 gap-1 sm:gap-2">
                <span className="text-slate-500 dark:text-zinc-400 shrink-0">{t('common.email', 'Email')}</span>
                <span className="font-mono text-slate-900 dark:text-white sm:text-right break-all">{primaryAdmin.email || tenant.adminEmail || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800/60 gap-2">
                <span className="text-slate-500 dark:text-zinc-400 shrink-0">{t('common.phone', 'Phone')}</span>
                <span className="font-mono text-slate-900 dark:text-white text-right">{primaryAdmin.phone || tenant.phone || tenant.adminPhone || '—'}</span>
              </div>
              {primaryAdmin.enrollment_no && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800/60 gap-2">
                  <span className="text-slate-500 dark:text-zinc-400 shrink-0">{t('superadmin.tenant_details.lbl_enrollment_id', 'Enrollment ID')}</span>
                  <span className="font-mono text-slate-700 dark:text-zinc-300 font-medium text-right">{primaryAdmin.enrollment_no}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800/60 gap-2">
                <span className="text-slate-500 dark:text-zinc-400 shrink-0">{t('tenants.location', 'Location')}</span>
                <span className="font-medium text-slate-900 dark:text-white text-right truncate">
                  {[tenant.city, tenant.state].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between py-2 border-b border-slate-100 dark:border-zinc-800/60 gap-1 sm:gap-2">
                <span className="text-slate-500 dark:text-zinc-400 shrink-0">{t('tenants.address', 'Address')}</span>
                <span className="font-medium text-slate-700 dark:text-zinc-300 sm:text-right break-words max-w-full sm:max-w-[280px]" title={tenant.office_address}>
                  {tenant.office_address || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800/60 gap-2">
                <span className="text-slate-500 dark:text-zinc-400 shrink-0">{t('superadmin.tenant_details.lbl_gstin', 'GSTIN')}</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white text-right">{tenant.gstin || tenant.gst_number || '—'}</span>
              </div>
              {tenant.cin && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800/60 gap-2">
                  <span className="text-slate-500 dark:text-zinc-400 shrink-0">{t('superadmin.tenant_details.lbl_cin', 'CIN')}</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white text-right">{tenant.cin}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 gap-2">
                <span className="text-slate-500 dark:text-zinc-400 shrink-0">{t('tenants.joined_date', 'Joined Date')}</span>
                <span className="font-medium text-slate-700 dark:text-zinc-300 text-right">
                  {tenant.joined_date || (tenant.created_at ? new Date(tenant.created_at).toLocaleDateString('en-IN') : '—')}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Subscription & Account Details */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FleetIcons.Ticket className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('tenants.account_plan', 'Subscription & Account')}
                </h2>
              </div>
              <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 rounded-md">
                {tenant.code || tenant.id}
              </span>
            </div>

            {hasSubscriptionOrPlan ? (
              <>
                {/* Active Plan Banner & Purchase Date */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{formatPlanName(tenant.plan)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isPaid
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}>
                        {isPaid ? 'Active & Paid' : 'Payment Pending'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 space-y-0.5">
                      <div>{t('superadmin.tenant_details.lbl_purchased', 'Purchased:')} <strong className="text-slate-800 dark:text-zinc-200 font-mono">{formattedPurchaseDate}</strong></div>
                      <div>{t('superadmin.tenant_details.lbl_renewal', 'Renewal:')} <span className="text-slate-700 dark:text-zinc-300 font-medium">{formattedRenewalDate}</span></div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                      ₹{planRate.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">/{t('superadmin.tenant_details.mo', 'mo')}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.tenant_details.monthly_saas', 'Monthly SaaS')}</span>
                  </div>
                </div>

                {/* Feature vs Actual Usage Breakdown with Progress */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                    <span>{t('superadmin.tenant_details.quotas_usage_title', 'Plan Quotas vs Current Usage')}</span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">{t('superadmin.tenant_details.active_allocated', 'Active / Allocated')}</span>
                  </div>

                  {/* 1. Fleet Vehicles / Buses */}
                  <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                        <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{t('superadmin.tenant_details.fleet_vehicles_buses', 'Fleet Vehicles / Buses')}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {busUsed} / {busLimit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          busPercent >= 90 ? 'bg-rose-500' : busPercent >= 75 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${busPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                      <span>{busRemaining} vehicle slots free</span>
                      <span>Plan Limit: {busLimit} Max</span>
                    </div>
                  </div>

                  {/* 2. Drivers */}
                  <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                        <FleetIcons.Driver className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{t('superadmin.tenant_details.tab_drivers', 'Drivers')}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {driverUsed} / {driverLimit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          driverPercent >= 90 ? 'bg-rose-500' : driverPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${driverPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                      <span>{driverRemaining} driver slots free</span>
                      <span>Plan Limit: {driverLimit} Max</span>
                    </div>
                  </div>

                  {/* 3. Depots & Garages */}
                  <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                        <FleetIcons.Pin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>{t('superadmin.tenant_details.depots_garages', 'Depots & Garages')}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {depotUsed} / {depotLimit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          depotPercent >= 90 ? 'bg-rose-500' : depotPercent >= 75 ? 'bg-amber-500' : 'bg-teal-600'
                        }`}
                        style={{ width: `${depotPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                      <span>{depotRemaining} depot slots free</span>
                      <span>Plan Limit: {depotLimit} Max</span>
                    </div>
                  </div>

                  {/* 4. Fleet Operators */}
                  <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                        <FleetIcons.Key className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{t('superadmin.tenant_details.fleet_operators', 'Fleet Operators')}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {operatorUsed} / {operatorLimit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          operatorPercent >= 90 ? 'bg-rose-500' : operatorPercent >= 75 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${operatorPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                      <span>{operatorRemaining} operator slots free</span>
                      <span>Plan Limit: {operatorLimit} Max</span>
                    </div>
                  </div>


                  <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/60">
                    <span>{t('tenants.portal_slug', 'Portal Slug')}:</span>
                    <span className="font-mono text-slate-700 dark:text-zinc-300 font-medium">{tenant.slug || '—'}</span>
                  </div>
                </div>
              </>
            ) : (
              /* No Active Subscription or Plan Assigned */
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-zinc-800 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        No Subscription Plan Assigned
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700">
                        {isPending
                          ? 'Application Pending'
                          : isAwaitingSub
                          ? 'Awaiting Plan Selection'
                          : 'Unsubscribed'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed max-w-lg">
                      {isPending
                        ? 'This organization self-registered and is currently pending verification. No subscription tier has been selected or billed yet.'
                        : isAwaitingSub
                        ? 'Account is approved. The tenant admin can log in to select and pay for a subscription tier.'
                        : 'This organization does not currently have an active SaaS subscription plan.'}
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="text-base font-black text-slate-400 dark:text-zinc-500 block">
                      ₹0<span className="text-[10px] font-normal">/{t('superadmin.tenant_details.mo', 'mo')}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                      No Active Billing
                    </span>
                  </div>
                </div>

                {/* Locked Quotas Banner */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/70 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                    <FleetIcons.Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{t('superadmin.tenant_details.operational_quotas_locked', 'Operational Fleet Quotas (Locked)')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal">
                    Buses, depot slots, and driver allocations are locked. Quotas will be allocated as soon as a subscription tier (Starter, Growth, Enterprise) is purchased or assigned.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">{t('superadmin.tenant_details.vehicles', 'Vehicles')}</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">0 {t('superadmin.tenant_details.allowed', 'Allowed')}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">{t('superadmin.tenant_details.tab_drivers', 'Drivers')}</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">0 {t('superadmin.tenant_details.allowed', 'Allowed')}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">{t('superadmin.tenant_details.tab_depots', 'Depots')}</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">0 {t('superadmin.tenant_details.allowed', 'Allowed')}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">{t('superadmin.tenant_details.fleet_operators', 'Fleet Operators')}</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">0 {t('superadmin.tenant_details.allowed', 'Allowed')}</span>
                    </div>
                  </div>
                </div>

                {/* Helpful Action Links */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    {t('tenants.portal_slug', 'Portal Slug')}: <strong className="font-mono text-slate-800 dark:text-zinc-200">{tenant.slug || '—'}</strong>
                  </span>
                  {canApprove && isPending && (
                    <button
                      onClick={handleApprove}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <FleetIcons.Check className="w-3.5 h-3.5" />
                      <span>{t('superadmin.tenant_details.btn_approve_app', 'Approve Application')}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DEPOTS */}
      {activeTab === 'depots' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('superadmin.tenant_details.registered_depots_title', 'Registered Depot Facilities')}</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('superadmin.tenant_details.registered_depots_desc', 'Garages, parking bays, and maintenance zones under this tenant')}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-full border border-slate-200 dark:border-zinc-700">
                {depotsList.length} Active in DB
              </span>
              <span className="text-xs font-medium px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                Quota: {tenant.depots_count ?? 0} Allowed
              </span>
            </div>
          </div>

          {depotsList.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                <FleetIcons.Pin className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('superadmin.tenant_details.no_depots_yet', 'No Depot Facilities Registered Yet')}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                  This tenant has not registered any depot yards or maintenance terminals yet. Once registered in depot operations, they will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 text-xs">
              {depotsList.map((d) => (
                <div key={d.id || d.code} className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{d.name}</div>
                      <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">{d.code}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      d.status === 'operational'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                    }`}>
                      {d.status || 'operational'}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-zinc-400 text-xs">
                    {d.address || 'Address not specified'}
                  </p>

                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="bg-white dark:bg-zinc-800/60 p-1.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
                      <div className="text-slate-400 dark:text-zinc-500 text-[10px]">{t('superadmin.tenant_details.capacity', 'Capacity')}</div>
                      <div className="font-bold text-slate-900 dark:text-white">{d.capacity || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800/60 p-1.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
                      <div className="text-slate-400 dark:text-zinc-500 text-[10px]">{t('superadmin.tenant_details.parked', 'Parked')}</div>
                      <div className="font-bold text-slate-900 dark:text-white">{d.current_parked || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800/60 p-1.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
                      <div className="text-slate-400 dark:text-zinc-500 text-[10px]">{t('superadmin.tenant_details.ev_bays', 'EV Bays')}</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">{d.ev_chargers || 0}</div>
                    </div>
                  </div>

                  {d.contact_phone && (
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <FleetIcons.Phone className="w-3 h-3 text-slate-400 shrink-0" /> <span className="font-mono text-slate-800 dark:text-zinc-200">{d.contact_phone}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BILLING & INVOICES */}
      {activeTab === 'billing' && (
        <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
          {/* Streamlined Summary Banner */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                <FleetIcons.Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {hasSubscriptionOrPlan ? formatPlanName(tenant.plan) : 'No Subscription Plan'}
                  </h2>
                  {hasSubscriptionOrPlan ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      ₹{planRate.toLocaleString('en-IN')}/mo
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700">
                      Unbilled · ₹0/mo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium truncate">
                  Billed to <span className="font-semibold text-slate-700 dark:text-zinc-200">{tenant.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-zinc-800">
              <div className="text-left sm:text-right">
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('superadmin.tenant_details.account_status', 'Account Status')}</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1 sm:justify-end">
                  {!hasSubscriptionOrPlan ? (
                    <>
                      <FleetIcons.Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                      <span className="text-slate-500 dark:text-zinc-400">{isPending ? 'Pending Verification' : 'No Active Billing'}</span>
                    </>
                  ) : isPaid ? (
                    <>
                      <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{t('superadmin.tenant_details.paid_and_active', 'Paid & Active')}</span>
                    </>
                  ) : (
                    <>
                      <FleetIcons.Alert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{t('superadmin.tenant_details.badge_payment_pending', 'Payment Pending')}</span>
                    </>
                  )}
                </div>
              </div>
              {hasSubscriptionOrPlan ? (
                <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                  isPaid
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span>{isPaid ? 'Paid' : 'Pending'}</span>
                </span>
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 flex items-center gap-1.5">
                  <span>{t('superadmin.tenant_details.unsubscribed', 'Unsubscribed')}</span>
                </span>
              )}
            </div>
          </div>

          {/* Tax Invoices Action Bar & Content */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FleetIcons.Ticket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{t('superadmin.tenant_details.tax_invoices', 'Tax Invoices')}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {invoicesList.length}
                </span>
              </div>

              <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                Showing {invoicesList.length} GST Invoices
              </span>
            </div>

            {/* Tax Invoices Table */}
            {invoicesList.length === 0 ? (
              <div className="py-10 text-center space-y-2 bg-slate-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                  <FleetIcons.Ticket className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('superadmin.tenant_details.no_invoices_found', 'No Tax Invoices Found')}</div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">{t('superadmin.tenant_details.no_invoices_desc', 'No subscription or addon invoices have been generated for this organization yet.')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">{t('superadmin.tenant_details.col_invoice_num', 'Invoice #')}</th>
                      <th className="py-3 px-4">{t('superadmin.tenant_details.col_issue_date', 'Issue Date')}</th>
                      <th className="py-3 px-4">{t('common.type', 'Type')}</th>
                      <th className="py-3 px-4">{t('superadmin.tenant_details.col_total_amount', 'Total Amount')}</th>
                      <th className="py-3 px-4">{t('common.status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium text-slate-700 dark:text-zinc-200">
                    {invoicesList.map((inv) => (
                      <tr key={inv.id || inv.code} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <span>{inv.code}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(inv.code);
                                toast.success('Invoice # copied!');
                              }}
                              title={t('superadmin.tenant_details.title_copy_invoice', 'Copy Invoice ID')}
                              className="text-slate-400 hover:text-blue-600 text-[10px] cursor-pointer"
                            >
                              <FleetIcons.Copy className="w-3 h-3 text-slate-400 hover:text-blue-600" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                          {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold">
                            {inv.type ? String(inv.type).replace(/_/g, ' ').toUpperCase() : 'SAAS SUBSCRIPTION'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            ₹{Number(inv.total || 0).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                            (Tax Inclusive)
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : inv.status === 'overdue'
                              ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${inv.status === 'paid' ? 'bg-emerald-500' : inv.status === 'overdue' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                            <span>{inv.status ? String(inv.status).toUpperCase() : 'ISSUED'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Reset Admin Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                  <FleetIcons.Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Reset Admin Password
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    {tenant.name || 'Tenant'} ({tenant.code || tenant.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <FleetIcons.Close className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* If reset was completed, show success and credentials view */}
            {resetResult ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                    <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{t('superadmin.tenant_details.password_reset_success', 'Password Successfully Reset')}</span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    The administrator password has been updated. All previous active login sessions have been invalidated.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs gap-1 sm:gap-2">
                    <span className="text-slate-500 dark:text-zinc-400 shrink-0">{t('superadmin.tenant_details.admin_email_lbl', 'Admin Email:')}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white break-all">{resetResult.adminEmail}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-zinc-400">{t('superadmin.tenant_details.new_password_lbl', 'New Password:')}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm px-2.5 py-1 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white">
                        {resetResult.temporaryPassword}
                      </span>
                      <button
                        onClick={() => handleCopyNewPassword(resetResult.temporaryPassword)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        {copiedPassword ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                {resetResult.emailSent ? (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                    <FleetIcons.Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>An email with the updated credentials has been dispatched to {resetResult.adminEmail}.</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                    <FleetIcons.Alert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{t('superadmin.tenant_details.copy_password_instruction', 'Please copy the new password and share it directly with the administrator.')}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setResetModalOpen(false)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer text-center"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmResetPassword} className="space-y-4">
                {/* Admin user info box */}
                <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.tenant_details.target_admin', 'Target Administrator:')}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{primaryAdmin?.name || tenant.adminName || 'Admin'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-2">
                    <span className="text-slate-400 dark:text-zinc-500 shrink-0">{t('superadmin.tenant_details.email_address', 'Email Address:')}</span>
                    <span className="font-mono text-slate-800 dark:text-zinc-200 break-all">{primaryAdmin?.email || tenant.adminEmail || '—'}</span>
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      New Administrator Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setResetPasswordValue(generateStrongPassword())}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FleetIcons.Refresh className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{t('superadmin.tenant_details.generate_strong', 'Generate Strong')}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      value={resetPasswordValue}
                      onChange={(e) => setResetPasswordValue(e.target.value)}
                      required
                      placeholder={t('superadmin.tenant_details.ph_new_password', 'Enter new password')}
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      {showPasswordText ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Email notification toggle */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyAdminEmail}
                    onChange={(e) => setNotifyAdminEmail(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{t('superadmin.tenant_details.email_credentials_checkbox', 'Email credentials to administrator')}</span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Dispatches the new login password directly to {primaryAdmin?.email || tenant.adminEmail || 'admin'}.
                    </p>
                  </div>
                </label>

                {/* Warning note */}
                <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/60 leading-relaxed flex items-start gap-2">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{t('superadmin.tenant_details.reset_warning', 'This will immediately overwrite the administrator\'s password and log them out of all active web and mobile sessions.')}</span>
                </div>

                {/* Modal actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resettingPassword}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {resettingPassword ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{t('superadmin.tenant_details.resetting', 'Resetting…')}</span>
                      </>
                    ) : (
                      <span>{t('superadmin.tenant_details.confirm_reset', 'Confirm Reset')}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDetailsPage;
