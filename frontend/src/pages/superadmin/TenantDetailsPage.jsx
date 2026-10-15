import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
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
  if (!plan) return 'Standard';
  if (typeof plan === 'object') return plan.name || plan.code || 'Standard';
  return String(plan);
};

const ALL_PLATFORM_FEATURES = [
  { key: 'live_tracking', title: 'Live GPS & Telematics Ingestion', desc: 'High-frequency MQTT telemetry streaming from onboard IoT hardware' },
  { key: 'campaigns_module', title: 'AI Dynamic Ad Campaign Playback', desc: 'Allow national and local advertiser video ad slots on passenger displays' },
  { key: 'emergency_broadcast', title: 'Emergency Government Broadcast Overrides', desc: 'Allow sovereign safety notices & disaster alerts to preempt ads on this fleet' },
  { key: 'display_matrix', title: 'Display Matrix & Multi-Screen Sync', desc: 'Dual-display resolution sync (1920x720) and synchronized video playback' },
  { key: 'central_technician', title: 'Central Technician On-Demand Dispatch', desc: 'Request VMOVEXA Level 1-3 certified field engineers for depot maintenance' },
  { key: 'maintenance_alerts', title: 'OBD-II / CAN-bus Engine Diagnostics', desc: 'J1939 telematics, engine trouble codes, and maintenance alert triggers' },
  { key: 'geofencing', title: 'Route Geofencing & Depot Boundaries', desc: 'Automated entry/exit detection and depot arrival notifications' },
  { key: 'passenger_announcements', title: 'Passenger Audio / Visual Announcements', desc: 'Automated next-stop audio alerts and route progress displays' },
];

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
  const { impersonateTenant, user, hasPermission } = useAuth();
  const routeId = params?.id;
  const { currentOrganization, loadOrganization, updateStatus } = useOrganization();

  const isFinance = location.pathname.startsWith('/finance') || location.pathname.startsWith('/superadmin/finance');
  const basePath = location.pathname.startsWith('/finance/subscriptions')
    ? '/finance/subscriptions'
    : location.pathname.startsWith('/superadmin/finance/subscriptions')
    ? '/superadmin/finance/subscriptions'
    : '/superadmin/tenants';

  const userRoleCode = typeof user?.role === 'object' ? user?.role?.code : user?.role;
  const canApprove = hasPermission('orgs.approve');
  const canSuspend = hasPermission('orgs.suspend');
  const canImpersonate = hasPermission('platform.impersonate');

  // In modal mode start with passed org object for instant display (no loading flicker)
  const [localOrg, setLocalOrg] = useState(orgProp);
  const [fetchLoading, setFetchLoading] = useState(!orgProp);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [billingView, setBillingView] = useState('invoices');
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
  const featuresList = Array.isArray(tenant.features) ? tenant.features : [];
  const active = isActive(tenant.status);
  const isApproved = isApprovedStatus(tenant.status);
  const isSuspended = isSuspendedStatus(tenant.status);
  const isPending = tenant.status === 'pending_approval';
  const isAwaitingSub = tenant.status === 'awaiting_subscription';
  const hasPaidRecord = invoicesList.some((i) => i.status === 'paid') || paymentsList.some((p) => p.status === 'completed' || p.status === 'success') || (tenant.subscription && tenant.subscription.status === 'active');
  const isPaid = (tenant.payment_status === 'paid' || hasPaidRecord) && !isPending;
  const isPaymentPending = !isPaid && !isPending;
  const planRate = Number(tenant.plan?.monthly_price || (Number(tenant.mrr) > 0 ? tenant.mrr : 0));

  const planFeatures = tenant.plan?.features || {};

  // Purchase & Activation Dates
  const rawPurchaseDate = tenant.subscription?.created_at
    || tenant.subscription?.current_period_start
    || (invoicesList.find((i) => i.status === 'paid')?.paid_at)
    || (paymentsList.find((p) => p.status === 'success' || p.status === 'completed' || p.status === 'paid')?.paid_at)
    || tenant.joined_date
    || tenant.created_at;

  const formattedPurchaseDate = rawPurchaseDate
    ? new Date(rawPurchaseDate).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : 'Pending Activation';

  const rawRenewalDate = tenant.subscription?.current_period_end
    || tenant.subscription?.next_billing_at;

  const formattedRenewalDate = rawRenewalDate
    ? new Date(rawRenewalDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Renews Monthly';

  // Quota and Feature Limits vs Actual Usage Calculations
  const busLimit = Number(tenant.plan?.buses_limit ?? tenant.buses_quota ?? 25);
  const busUsed = Number(tenant.actual_buses_count ?? 0);
  const busPercent = busLimit > 0 ? Math.min(100, Math.round((busUsed / busLimit) * 100)) : 0;
  const busRemaining = Math.max(0, busLimit - busUsed);

  const depotLimit = Number(planFeatures.depots_limit ?? tenant.depots_count ?? 2);
  const depotUsed = Number(tenant.actual_depots_count ?? depotsList.length ?? 0);
  const depotPercent = depotLimit > 0 ? Math.min(100, Math.round((depotUsed / depotLimit) * 100)) : 0;
  const depotRemaining = Math.max(0, depotLimit - depotUsed);

  const userLimit = Number(planFeatures.users_limit ?? 10);
  const userUsed = Number(tenant.actual_users_count ?? (Array.isArray(tenant.users) ? tenant.users.length : 1));
  const userPercent = userLimit > 0 ? Math.min(100, Math.round((userUsed / userLimit) * 100)) : 0;
  const userRemaining = Math.max(0, userLimit - userUsed);

  const dataRetention = planFeatures.data_retention_days ? `${planFeatures.data_retention_days} Days` : '90 Days';
  const gpsInterval = planFeatures.gps_ping_interval || '5s';
  const adRevShare = `${tenant.ad_revenue_share_rate ?? tenant.plan?.ad_revenue_share_rate ?? 65}%`;
  const supportSla = planFeatures.support_sla || `${tenant.support_sla_hours || 24}h`;

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
    } catch (err) {}
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
    } catch (err) {}
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
    } catch (err) {}
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
            <div key={i} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 h-24"></div>
          ))}
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 h-64"></div>
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
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            ← {t('common.back', 'Back to Tenants')}
          </button>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center space-y-3">
          <div className="text-3xl">⚠️</div>
          <h2 className="text-base font-bold text-red-900 dark:text-red-200">Failed to Load Tenant Details</h2>
          <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto">{fetchError}</p>
          <div className="pt-2">
            <button
              onClick={fetchTenant}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If organization is not found after loading, close or redirect automatically
  if (!localOrg || !localOrg.id) {
    if (onClose) {
      onClose();
    } else {
      navigate(basePath, { replace: true });
    }
    return null;
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Pending Approval Banner */}
      {isPending && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Onboarding Application Pending Verification</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
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

      {/* Payment Pending Alert Banner */}
      {isPaymentPending && !isPending && (
        <div className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 font-black text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0"></span>
              <span>Subscription Payment Pending — Online Checkout Not Settled</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
              This organization is approved on the platform with <strong>Online Payment Mode</strong>. The administrator (<strong className="font-mono break-all">{primaryAdmin?.email || tenant.adminEmail || 'admin'}</strong>) has not yet completed payment. Fleet operations, telematics, and display units remain inactive until the subscription invoice is settled.
            </p>
          </div>
          {canImpersonate && (
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={handleImpersonate}
                disabled={impersonating}
                className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Login as Admin to Pay →</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Breadcrumb Navigation — Fully Interactive in both modal & route modes */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 flex-wrap">
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
                  <span>Paid</span>
                </span>
              ) : isPaymentPending ? (
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-700 flex items-center gap-1.5 shadow-2xs animate-pulse shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>⚠️ Payment Pending</span>
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
          <button
            type="button"
            onClick={() => navigate(`${basePath}/${tenant.id}/edit`)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <FleetIcons.Edit className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Edit Tenant</span>
          </button>

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
              <span className="truncate">{impersonating ? 'Connecting…' : 'Impersonate'}</span>
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
                <span>Approve</span>
              </button>
            ) : (
              <div className="w-full sm:w-auto px-3 sm:px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-center flex items-center justify-center gap-1.5 shadow-2xs">
                <span>Pending Verification</span>
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
            <span>🔑</span>
            <span className="truncate">{t('tenants.reset_pwd', 'Reset Admin Password')}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards — Clear, Intuitive Tenant Operational Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Subscription Tier & Pricing */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">
              {t('tenants.subscription_plan', 'Subscription Plan')}
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FleetIcons.Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate" title={formatPlanName(tenant.plan)}>
              {formatPlanName(tenant.plan)}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ₹{planRate.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">/mo</span>
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">•</span>
              <span className="hidden sm:inline text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                Monthly
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Billing & Payment Status */}
        <div className={`bg-white dark:bg-[#11141d] border rounded-2xl p-3 sm:p-4 shadow-xs transition-all flex flex-col justify-between ${
          isPaid 
            ? 'border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-300' 
            : 'border-amber-200/80 dark:border-amber-900/50 hover:border-amber-300'
        }`}>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">
              {t('tenants.payment_status', 'Payment Status')}
            </span>
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isPaid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
            }`}>
              {isPaid ? (
                <FleetIcons.Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <FleetIcons.Alert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-sm sm:text-xl font-black tracking-tight flex items-center gap-1 truncate ${
              isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
              <span>{isPaid ? '✓ Paid' : '⚠️ Pending'}</span>
            </div>
            <div className="mt-0.5">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate block">
                {isPaid ? 'Full access' : 'Online checkout pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Enrolled Fleet vs Quota */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
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
                {busRemaining} slots free ({busPercent}% used)
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Operating Depots / Region */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
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

      {/* 4 Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        {[
          { id: 'overview', label: t('tenants.overview_tab', 'Organization Overview'), shortLabel: 'Overview', icon: <FleetIcons.Document className="w-3.5 h-3.5 shrink-0" /> },
          { id: 'depots', label: `${t('tenants.depots_tab', 'Depot & Fleet Roster')} (${depotsList.length})`, shortLabel: `Depots (${depotsList.length})`, icon: <FleetIcons.Bus className="w-3.5 h-3.5 shrink-0" /> },
          { id: 'quotas', label: t('tenants.quotas_tab', 'SaaS License & Feature Quotas'), shortLabel: 'Quotas', icon: <FleetIcons.Settings className="w-3.5 h-3.5 shrink-0" /> },
          { id: 'billing', label: `${t('tenants.billing_tab', 'Billing & Invoices')} (${invoicesList.length + paymentsList.length})`, shortLabel: `Billing (${invoicesList.length + paymentsList.length})`, icon: <FleetIcons.Check className="w-3.5 h-3.5 shrink-0" /> },
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
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
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
                  <span className="text-slate-500 dark:text-zinc-400 shrink-0">Enrollment ID</span>
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
                <span className="text-slate-500 dark:text-zinc-400 shrink-0">GSTIN</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white text-right">{tenant.gstin || tenant.gst_number || '—'}</span>
              </div>
              {tenant.cin && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800/60 gap-2">
                  <span className="text-slate-500 dark:text-zinc-400 shrink-0">CIN</span>
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
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
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
                  <div>Purchased: <strong className="text-slate-800 dark:text-zinc-200 font-mono">{formattedPurchaseDate}</strong></div>
                  <div>Renewal: <span className="text-slate-700 dark:text-zinc-300 font-medium">{formattedRenewalDate}</span></div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                  ₹{planRate.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">/mo</span>
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Monthly SaaS</span>
              </div>
            </div>

            {/* Feature vs Actual Usage Breakdown with Progress */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span>Plan Quotas vs Current Usage</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">Active / Allocated</span>
              </div>

              {/* 1. Buses Quota */}
              <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                    <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Fleet Vehicles / Buses</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                    {busUsed} / {busLimit} <span className="text-[10px] text-slate-400 font-normal">({busPercent}%)</span>
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

              {/* 2. Depots Quota */}
              <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                    <FleetIcons.Pin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Depots & Garages</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                    {depotUsed} / {depotLimit} <span className="text-[10px] text-slate-400 font-normal">({depotPercent}%)</span>
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

              {/* 3. Team Users */}
              <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                    <FleetIcons.Profile className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Staff & Operator Seats</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                    {userUsed} / {userLimit} <span className="text-[10px] text-slate-400 font-normal">({userPercent}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      userPercent >= 90 ? 'bg-rose-500' : userPercent >= 75 ? 'bg-amber-500' : 'bg-purple-600'
                    }`}
                    style={{ width: `${userPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                  <span>{userRemaining} user seats free</span>
                  <span>Plan Limit: {userLimit} Max</span>
                </div>
              </div>

              {/* Plan Contract Features Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/80">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-bold">Data Retention</span>
                  <span className="font-bold text-slate-900 dark:text-white">{dataRetention}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/80">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-bold">GPS Telematics</span>
                  <span className="font-bold text-slate-900 dark:text-white">{gpsInterval} Polling</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/80">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-bold">Ad Rev Share</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{adRevShare}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/80">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-bold">Support SLA</span>
                  <span className="font-bold text-slate-900 dark:text-white">{supportSla}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/60">
                <span>{t('tenants.portal_slug', 'Portal Slug')}:</span>
                <span className="font-mono text-slate-700 dark:text-zinc-300 font-medium">{tenant.slug || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPOTS */}
      {activeTab === 'depots' && (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Registered Depot Facilities</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Garages, parking bays, and maintenance zones under this tenant</p>
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
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xl text-slate-400 dark:text-zinc-500">
                🏢
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Depot Facilities Registered Yet</h3>
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
                      <div className="text-slate-400 dark:text-zinc-500 text-[10px]">Capacity</div>
                      <div className="font-bold text-slate-900 dark:text-white">{d.capacity || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800/60 p-1.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
                      <div className="text-slate-400 dark:text-zinc-500 text-[10px]">Parked</div>
                      <div className="font-bold text-slate-900 dark:text-white">{d.current_parked || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800/60 p-1.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
                      <div className="text-slate-400 dark:text-zinc-500 text-[10px]">EV Bays</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">{d.ev_chargers || 0}</div>
                    </div>
                  </div>

                  {d.contact_phone && (
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <span>📞</span> <span className="font-mono text-slate-800 dark:text-zinc-200">{d.contact_phone}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: QUOTAS & FEATURES */}
      {activeTab === 'quotas' && (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 sm:space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Platform Feature Gates & Quota Limits</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">SaaS subscription license limits, quota consumption, and platform entitlements</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
              License ID: {tenant.code || tenant.id}
            </span>
          </div>

          {/* SaaS License & Plan Purchase Info Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-zinc-900/40 border border-indigo-200/80 dark:border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                <FleetIcons.Ticket className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {formatPlanName(tenant.plan)}
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-900/50 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    SaaS Subscription
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isPaid
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                  }`}>
                    {isPaid ? '✓ Active & Paid' : '⚠️ Payment Pending'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-300 flex-wrap">
                  <span>📅 <strong>Purchased / Activated:</strong> <span className="font-mono text-slate-900 dark:text-white font-bold ml-1">{formattedPurchaseDate}</span></span>
                  <span className="text-slate-300 dark:text-zinc-700">•</span>
                  <span>🔄 <strong>Renewal:</strong> <span className="font-mono text-slate-900 dark:text-white ml-1">{formattedRenewalDate}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-start md:items-end flex-col shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-indigo-100 dark:border-indigo-900/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Plan Rate</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{planRate.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400 dark:text-zinc-500">/mo</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">Monthly auto-renew</span>
            </div>
          </div>

          {/* Quota Summary Cards with Actual Comparison & Free Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Buses License Limit</span>
              <div className="text-lg font-black text-slate-900 dark:text-white">{busLimit} Buses</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{busUsed} Enrolled</span>
                <span className="text-slate-400 dark:text-zinc-500">({busRemaining} free)</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Depots Permitted</span>
              <div className="text-lg font-black text-slate-900 dark:text-white">{depotLimit} Depots</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{depotUsed} Active</span>
                <span className="text-slate-400 dark:text-zinc-500">({depotRemaining} free)</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Staff / Users Seats</span>
              <div className="text-lg font-black text-slate-900 dark:text-white">{userLimit} Seats</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">{userUsed} Assigned</span>
                <span className="text-slate-400 dark:text-zinc-500">({userRemaining} free)</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">SLA & Retention</span>
              <div className="text-lg font-black text-slate-900 dark:text-white">{supportSla} SLA</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-zinc-300 font-semibold">{dataRetention} Logs</span>
                <span className="text-slate-400 dark:text-zinc-500">{gpsInterval} GPS</span>
              </div>
            </div>
          </div>

          {/* Feature matrix */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Database Feature Entitlements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {ALL_PLATFORM_FEATURES.map((feat) => {
                const dbEntry = featuresList.find((f) => f.feature_key === feat.key);
                const isEnabled = dbEntry ? Boolean(dbEntry.enabled) : true;
                return (
                  <div key={feat.key} className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 dark:text-white">{feat.title}</h4>
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">{feat.key}</span>
                      </div>
                      <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">{feat.desc}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 border self-start sm:self-auto ${
                      isEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                    }`}>
                      {isEnabled ? 'Enabled' : 'Restricted'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BILLING & INVOICES */}
      {activeTab === 'billing' && (
        <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
          {/* Streamlined Summary Banner */}
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg sm:text-xl shrink-0">
                💳
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {formatPlanName(tenant.plan)}
                  </h2>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    ₹{planRate.toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium truncate">
                  Ad Revenue Cut: <strong className="text-slate-700 dark:text-zinc-200">{tenant.ad_revenue_share_rate ?? 0}%</strong> · Billed to <span className="font-semibold">{tenant.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-zinc-800">
              <div className="text-left sm:text-right">
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Account Status</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {isPaid ? '✓ Paid & Active' : '⚠️ Payment Pending'}
                </div>
              </div>
              <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                isPaid
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-700 animate-pulse'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span>{isPaid ? 'Paid' : 'Pending'}</span>
              </span>
            </div>
          </div>

          {/* Sub-toggle & Action Bar */}
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              {/* Pills toggle */}
              <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl w-full sm:w-fit">
                <button
                  type="button"
                  onClick={() => setBillingView('invoices')}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                    billingView === 'invoices'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>Tax Invoices</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    billingView === 'invoices' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'bg-slate-200 dark:bg-zinc-700'
                  }`}>
                    {invoicesList.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingView('payments')}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                    billingView === 'payments'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>Payment Receipts</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    billingView === 'payments' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'bg-slate-200 dark:bg-zinc-700'
                  }`}>
                    {paymentsList.length}
                  </span>
                </button>
              </div>

              <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                Showing {billingView === 'invoices' ? `${invoicesList.length} GST Invoices` : `${paymentsList.length} Payment Receipts`}
              </span>
            </div>

            {/* View 1: Tax Invoices Table */}
            {billingView === 'invoices' && (
              invoicesList.length === 0 ? (
                <div className="py-10 text-center space-y-2 bg-slate-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                  <div className="text-2xl">📑</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">No Tax Invoices Found</div>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">No subscription or addon invoices have been generated for this organization yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Issue Date</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
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
                                title="Copy Invoice ID"
                                className="text-slate-400 hover:text-blue-600 text-[10px] cursor-pointer"
                              >
                                📋
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
                            {(inv.tax_amount > 0 || inv.subtotal > 0) && (
                              <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                Subtotal ₹{Number(inv.subtotal || 0).toLocaleString('en-IN')} + GST ₹{Number(inv.tax_amount || 0).toLocaleString('en-IN')}
                              </div>
                            )}
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
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => toast.success(`Viewing invoice ${inv.code}`)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-zinc-300 hover:text-blue-600 text-[11px] font-bold transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* View 2: Payment Receipts Table */}
            {billingView === 'payments' && (
              paymentsList.length === 0 ? (
                <div className="py-10 text-center space-y-2 bg-slate-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                  <div className="text-2xl">💳</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">No Payment Receipts Found</div>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">No online or bank transfer payment receipts have been recorded for this organization.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Payment Ref</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Gateway / UTR</th>
                        <th className="py-3 px-4">Amount Paid</th>
                        <th className="py-3 px-4">Payment Date</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium text-slate-700 dark:text-zinc-200">
                      {paymentsList.map((p) => (
                        <tr key={p.id || p.code} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                              <span>{p.code}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(p.code);
                                  toast.success('Payment ref copied!');
                                }}
                                title="Copy Payment Ref"
                                className="text-slate-400 hover:text-blue-600 text-[10px] cursor-pointer"
                              >
                                📋
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-bold uppercase">
                              {p.method || 'STRIPE'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500 dark:text-zinc-400 text-[11px]">
                            {p.gateway_ref || '—'}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white text-sm">
                            ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                            {p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              p.status === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                              <span>{p.status ? String(p.status).toUpperCase() : 'SUCCESS'}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      )}
      {/* Reset Admin Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                  🔑
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
                ✕
              </button>
            </div>

            {/* If reset was completed, show success and credentials view */}
            {resetResult ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                    <span>✓</span>
                    <span>Password Successfully Reset</span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    The administrator password has been updated. All previous active login sessions have been invalidated.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs gap-1 sm:gap-2">
                    <span className="text-slate-500 dark:text-zinc-400 shrink-0">Admin Email:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white break-all">{resetResult.adminEmail}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-zinc-400">New Password:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm px-2.5 py-1 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white">
                        {resetResult.temporaryPassword}
                      </span>
                      <button
                        onClick={() => handleCopyNewPassword(resetResult.temporaryPassword)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        {copiedPassword ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                {resetResult.emailSent ? (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                    <span>📧</span>
                    <span>An email with the updated credentials has been dispatched to {resetResult.adminEmail}.</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                    <span>⚠️</span>
                    <span>Please copy the new password and share it directly with the administrator.</span>
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
                    <span className="text-slate-400 dark:text-zinc-500">Target Administrator:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{primaryAdmin?.name || tenant.adminName || 'Admin'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-2">
                    <span className="text-slate-400 dark:text-zinc-500 shrink-0">Email Address:</span>
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
                      <span>🎲 Generate Strong</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      value={resetPasswordValue}
                      onChange={(e) => setResetPasswordValue(e.target.value)}
                      required
                      placeholder="Enter new password"
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
                    <span className="font-bold text-slate-900 dark:text-white">Email credentials to administrator</span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Dispatches the new login password directly to {primaryAdmin?.email || tenant.adminEmail || 'admin'}.
                    </p>
                  </div>
                </label>

                {/* Warning note */}
                <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 leading-relaxed">
                  ⚠️ This will immediately overwrite the administrator's password and log them out of all active web and mobile sessions.
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
                        <span>Resetting…</span>
                      </>
                    ) : (
                      <span>Confirm Reset</span>
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
