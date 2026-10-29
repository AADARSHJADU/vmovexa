import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { FleetIcons } from '../components/FleetIcons';
import { RefreshButton } from '../components/ui/RefreshButton';
import { useAuth } from '../hooks/useAuth';
import billingService from '../api/services/billing.service';
import { storage } from '../utils/storage';
import { resolveFileUrl } from '../api/services/upload.service';
import { useNotifications } from '../hooks/shared/useNotifications';
import toast from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import { fetchWorkOrdersThunk as fetchSuperWorkOrdersThunk } from '../store/slices/superadmin/technicianSlice.js';
import { fetchWorkOrdersThunk as fetchAdminWorkOrdersThunk } from '../store/slices/admin/technicianRequestSlice.js';

export const RoleLayout = ({ roleTitle, navLinks = [], disabledNav = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  // Collapsible sidebar state with local storage persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('vmovexa_sidebar_collapsed') === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainRef = React.useRef(null);

  useEffect(() => {
    localStorage.setItem('vmovexa_sidebar_collapsed', isCollapsed);
  }, [isCollapsed]);

  const { notifications = [] } = useNotifications();
  const { user, logout, fetchMe, hasPermission, isImpersonating, impersonationTarget, stopImpersonation } = useAuth();

  const superWorkOrders = useAppSelector((state) => state.superTechnician?.workOrders || []);
  const adminWorkOrders = useAppSelector((state) => state.adminTechnicianRequest?.workOrders || []);

  const isSuperAdminRole =
    (roleTitle || '').toLowerCase().includes('super') ||
    user?.role === 'superadmin' ||
    user?.role?.code === 'ROLE-SUPER-ADMIN';

  const isAdminOrFleet =
    (roleTitle || '').toLowerCase().includes('admin') ||
    (roleTitle || '').toLowerCase().includes('fleet') ||
    user?.role === 'tenant_admin' ||
    user?.role === 'fleet_manager' ||
    user?.role?.code === 'ROLE-TENANT-ADMIN';

  // Ensure fresh work order counts on layout mount
  useEffect(() => {
    if (isSuperAdminRole) {
      dispatch(fetchSuperWorkOrdersThunk({ limit: 50 }));
    } else if (isAdminOrFleet) {
      dispatch(fetchAdminWorkOrdersThunk({ limit: 50 }));
    }
  }, [dispatch, isSuperAdminRole, isAdminOrFleet]);

  // Accurately compute count of tickets actually in pending status
  const unreadWorkOrderCount = React.useMemo(() => {
    if (isSuperAdminRole) {
      if (!Array.isArray(superWorkOrders) || superWorkOrders.length === 0) return 0;
      return superWorkOrders.filter((w) => {
        const st = String(w.status || '').toLowerCase();
        if (['resolved', 'closed', 'rejected', 'cancelled'].includes(st)) return false;
        return st === 'submitted' || st === 'pending' || !w.assigned_technician_id;
      }).length;
    }
    if (isAdminOrFleet) {
      if (!Array.isArray(adminWorkOrders) || adminWorkOrders.length === 0) return 0;
      return adminWorkOrders.filter((r) => {
        const st = String(r.status || '').toLowerCase();
        if (['resolved', 'closed', 'rejected', 'cancelled'].includes(st)) return false;
        return st === 'submitted' || st === 'pending';
      }).length;
    }
    return 0;
  }, [isSuperAdminRole, isAdminOrFleet, superWorkOrders, adminWorkOrders]);

  const isWorkOrderNavLink = (link) => {
    if (!link || !link.path) return false;
    const p = link.path.toLowerCase();
    return (
      p === '/superadmin/technicians/assign' ||
      p === '/admin/technician-requests' ||
      p === '/fleet-operator/technician-requests' ||
      p === '/fleet-manager/technician-requests'
    );
  };

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const getNavLabel = (label) => {
    const map = {
      'Dashboard': t('nav.dashboard', 'Dashboard'),
      'Overview Dashboard': t('nav.dashboard', 'Overview Dashboard'),
      'Authority Dashboard': t('nav.dashboard', 'Authority Dashboard'),
      'Tenants': t('nav.tenants', 'Tenants'),
      'Technicians': t('nav.technicians', 'Technicians'),
      'Assigned Work Orders': t('nav.assigned_work_orders', 'Assigned Work Orders'),
      'Assign Work Order': t('nav.assigned_work_orders', 'Assigned Work Orders'),
      'Campaigns': t('nav.campaigns', 'Campaigns'),
      'Campaigns Hub': t('nav.campaigns', 'Campaigns Hub'),
      'Public Campaigns': t('nav.campaigns', 'Public Campaigns'),
      'Broadcast Campaign': t('campaigns.create_new', 'Broadcast Campaign'),
      'Emergency Alert': t('nav.emergency_alert', 'Emergency Alert'),
      'Emergency Override': t('nav.emergency_override', 'Emergency Override'),
      'Emergency Broadcast': t('nav.emergency_broadcast', 'Emergency Broadcast'),
      'Emergency Approvals': t('nav.emergency_approvals', 'Emergency Approvals'),
      'Broadcast Approvals': t('nav.broadcast_approvals', 'Broadcast Approvals'),
      'Edge Devices': t('nav.devices', 'Edge Devices'),
      'Screens': t('nav.displays', 'Display Screens'),
      'Vehicles': t('nav.vehicles_short', 'Vehicles'),
      'Vehicles & Displays': t('nav.vehicles_short', 'Vehicles'),
      'Billing & Revenue': t('nav.billing', 'Billing & Revenue'),
      'Billing & Wallet': t('nav.billing', 'Billing & Wallet'),
      'Invoices & Billing': t('nav.invoices', 'Invoices & Billing'),
      'Users': t('nav.users', 'Users'),
      'Global Users': t('nav.users', 'Global Users'),
      'Team & Users': t('nav.users', 'Team & Users'),
      'Roles & Permissions': t('nav.roles', 'Roles & Permissions'),
      'Activity Logs': t('nav.activity', 'Activity Logs'),
      'System Health': t('nav.system', 'System Health'),
      'Languages & i18n': t('nav.languages', 'Languages & i18n'),
      'Profile': t('nav.profile', 'Profile'),
      'Operator Profile': t('nav.profile', 'Operator Profile'),
      'Brand Profile': t('nav.profile', 'Brand Profile'),
      'Agency Profile': t('nav.profile', 'Agency Profile'),
      'Technician Profile': t('nav.profile', 'Technician Profile'),
      'Driver Profile': t('nav.profile', 'Driver Profile'),
      'Finance Profile': t('nav.profile', 'Finance Profile'),
      'Finance Settings': t('nav.finance_settings', 'Finance Settings'),
      'Corporate & Finance Settings': t('nav.finance_settings', 'Finance Settings'),
      'Security Settings': t('nav.settings', 'Security Settings'),
      'Account Settings': t('nav.settings', 'Account Settings'),
      'Settings': t('nav.settings', 'Settings'),
      'Google Maps & APIs': t('nav.google_apis', 'Google Maps & APIs'),
      'Test Google APIs': t('nav.test_google_apis', 'Test Google APIs'),
      'Help & Docs': t('nav.help', 'Help & Docs'),
      'Help & Support': t('nav.help', 'Help & Support'),
      'Help & Knowledge': t('nav.help', 'Help & Knowledge'),
      'Help & Manuals': t('nav.help', 'Help & Manuals'),
      'Help & Dispatch': t('nav.help', 'Help & Dispatch'),
      'Help & Tax Desk': t('nav.help', 'Help & Tax Desk'),
      'Privacy Policy': t('nav.privacy', 'Privacy Policy'),
      'Terms of Service': t('nav.terms', 'Terms of Service'),
      'Terms & Conditions': t('nav.terms', 'Terms & Conditions'),
      'Terms & SLA': t('nav.terms', 'Terms & SLA'),
      'Terms & SLAs': t('nav.terms', 'Terms & SLAs'),
      'Fleet Management': t('nav.fleets', 'Fleet Management'),
      'Fleet Operator': t('nav.fleet_operator', 'Fleet Operator'),
      'Fleet Operators': t('nav.fleet_operator', 'Fleet Operator'),
      'Drivers & Staff': t('nav.drivers', 'Drivers & Staff'),
      'Drivers': t('nav.drivers', 'Drivers'),
      'GPS / Edge Units': t('nav.gps', 'GPS Assignments'),
      'GPS Assignments': t('nav.gps_assignments', 'GPS Assignments'),
      'GPS Installation': t('nav.gps_installation', 'GPS Installation'),
      'Live Telematics': t('nav.tracking', 'Live Tracking'),
      'Live Tracking': t('nav.tracking', 'Live Tracking'),
      'Sovereign Tracking': t('nav.sovereign_tracking', 'Sovereign Tracking'),
      'Trips & Dispatch': t('nav.trips', 'Trips & Dispatch'),
      'Reports & Analytics': t('nav.reports', 'Reports & Analytics'),
      'Reports': t('nav.reports', 'Reports'),
      'Revenue Reports': t('nav.reports', 'Revenue Reports'),
      'Proof-of-Play Reports': t('nav.reports', 'Proof-of-Play Reports'),
      'Compliance Reports': t('nav.reports', 'Compliance Reports'),
      'Alerts & Events': t('common.alerts', 'Alerts & Events'),
      'Alerts & Messages': t('common.alerts', 'Alerts & Messages'),
      'Critical Alerts': t('common.alerts', 'Critical Alerts'),
      'Operational Alerts': t('common.alerts', 'Operational Alerts'),
      'Financial Alerts': t('common.alerts', 'Financial Alerts'),
      'Hardware Configuration': t('nav.hardware_config', 'Hardware Configuration'),
      'Hardware Status': t('nav.hardware_status', 'Hardware Status'),
      'Diagnostics Tests': t('nav.diagnostics', 'Diagnostics Tests'),
      'Connectivity Matrix': t('nav.connectivity', 'Connectivity Matrix'),
      'Routes': t('nav.routes', 'Routes'),
      'Transit Routes': t('nav.routes', 'Routes'),
      'Vehicle Slots': t('nav.slots', 'Vehicle Slots'),
      'Vehicle Slots & Timetable': t('nav.slots', 'Vehicle Slots & Timetable'),
      'My Routes': t('driver.my_routes', 'My Routes'),
      'Shift Schedules': t('driver.shifts', 'Shift Schedules'),
      'Report Incident': t('driver.report_incident', 'Report Incident'),
      'Driver Documents': t('nav.documents', 'Driver Documents'),
      'Subscriptions': t('nav.subscriptions', 'Subscriptions'),
      'Invoices': t('nav.invoices', 'Invoices'),
      'Payments Ledger': t('nav.payments', 'Payments Ledger'),
      'GST & Tax Returns': t('nav.gst', 'GST & Tax Returns'),
      'Bank Reconciliation': t('nav.reconciliation', 'Bank Reconciliation'),
      'Depots': t('nav.depots', 'Depots'),
      'Bus Depots': t('nav.depots', 'Bus Depots'),
      'Technician Requests': t('technician.work_orders', 'Technician Requests'),
      'Revenue & Earnings': t('nav.billing', 'Revenue & Earnings'),
      // Section Headers
      'Main Overview': t('nav.headers.main_overview', 'Main Overview'),
      'Tenant & User Management': t('nav.headers.tenant_user_mgmt', 'Tenant & User Management'),
      'Finance & Subscriptions': t('nav.headers.finance_subs', 'Finance & Subscriptions'),
      'Hardware & Campaigns': t('nav.headers.hardware_campaigns', 'Hardware & Campaigns'),
      'System & Operations': t('nav.headers.system_ops', 'System & Operations'),
      'Settings & Legal': t('nav.headers.settings_legal', 'Settings & Legal'),
      'Fleet Operations': t('nav.headers.fleet_ops', 'Fleet Operations'),
      'Organization & Access': t('nav.headers.org_access', 'Organization & Access'),
      'Finance & Analytics': t('nav.headers.finance_analytics', 'Finance & Analytics'),
      'Settings & Support': t('nav.headers.settings_support', 'Settings & Support'),
      'Fleet & Telematics': t('nav.headers.fleet_telematics', 'Fleet & Telematics'),
      'Analytics & Alerts': t('nav.headers.analytics_alerts', 'Analytics & Alerts'),
      'Account & Support': t('nav.headers.account_support', 'Account & Support'),
      'Campaign Management': t('nav.headers.campaign_mgmt', 'Campaign Management'),
      'Billing & Messages': t('nav.headers.billing_messages', 'Billing & Messages'),
      'Account & Legal': t('nav.headers.account_legal', 'Account & Legal'),
      'Public Services & Alerts': t('nav.headers.public_services', 'Public Services & Alerts'),
      'Device Operations': t('nav.headers.device_ops', 'Device Operations'),
      'Alerts & Account': t('nav.headers.alerts_account', 'Alerts & Account'),
      'Dispatch & Routes': t('nav.headers.dispatch_routes', 'Dispatch & Routes'),
      'Financial Management': t('nav.headers.financial_mgmt', 'Financial Management'),
      'Advertiser': t('nav.headers.advertiser', 'Advertiser'),
      'Government': t('nav.headers.government', 'Government'),
    };
    return map[label] || t(`nav.${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, label);
  };

  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [exitingImpersonation, setExitingImpersonation] = useState(false);

  // Filter navigation links based on RBAC permissions and omit empty section headers
  const filteredNavLinks = React.useMemo(() => {
    const isDriverRole = roleTitle === 'Driver' || user?.role?.code === 'ROLE-DRIVER' || user?.role === 'ROLE-DRIVER';
    // If driver's documents are NOT verified or status is pending approval/rejected, restrict navigation to Driver Documents & Account/Help only
    const isUnverifiedDriver = isDriverRole && Boolean(
      user?.driver
        ? (!user.driver.documents_verified || user.driver.status === 'pending_approval' || user.driver.status === 'rejected' || user.driver.status === 'compliance_blocked')
        : (user?.status === 'pending_approval')
    );

    const allowed = navLinks.filter((link) => {
      if (link.isHeader) return true;
      if (isUnverifiedDriver) {
        const allowedDriverPaths = [
          '/driver/dashboard',
          '/driver/documents',
          '/driver/documents/upload',
          '/driver/documents/success',
          '/driver/notifications',
          '/driver/profile',
          '/driver/settings',
          '/driver/help',
          '/driver/privacy',
          '/driver/terms',
        ];
        return allowedDriverPaths.includes(link.path);
      }
      if (link.permission) {
        return hasPermission ? hasPermission(link.permission) : true;
      }
      return true;
    });

    const result = [];
    for (let i = 0; i < allowed.length; i++) {
      const item = allowed[i];
      if (item.isHeader) {
        let hasChildren = false;
        for (let j = i + 1; j < allowed.length; j++) {
          if (allowed[j].isHeader) break;
          hasChildren = true;
          break;
        }
        if (hasChildren) {
          result.push(item);
        }
      } else {
        result.push(item);
      }
    }
    return result;
  }, [navLinks, hasPermission, roleTitle, user]);

  const isPendingApproval = user?.status === 'pending_approval';
  const isAwaitingSubscription = user?.status === 'awaiting_subscription';
  const isTenantLocked = (roleTitle === 'Organization Admin' || roleTitle === 'Admin') && (isPendingApproval || isAwaitingSubscription);
  const isNavDisabled = disabledNav || isTenantLocked;

  const handleCheckApprovalStatus = async () => {
    setRefreshingStatus(true);
    try {
      if (isAwaitingSubscription) {
        try {
          const checkRes = await billingService.checkPaymentStatus();
          if (checkRes?.tokens) {
            storage.setTokens({
              accessToken: checkRes.tokens.accessToken,
              refreshToken: checkRes.tokens.refreshToken,
            });
          }
        } catch (_) {}
      }

      const refreshed = await fetchMe();
      const currentStatus = refreshed?.user?.status || refreshed?.status;
      if (currentStatus === 'active') {
        toast.success('Organization & subscription active! Dashboard unlocked.');
        navigate('/admin/dashboard', { replace: true });
      } else if (currentStatus === 'awaiting_subscription') {
        toast.success('Approved! Please choose your subscription plan.');
        navigate('/admin/subscription', { replace: true });
      } else {
        toast('Your application is still under review by Super Admin.', { icon: '⏳' });
      }
    } catch {
      toast.error('Could not refresh status. Please try again.');
    } finally {
      setRefreshingStatus(false);
    }
  };

  const handleExitImpersonation = async () => {
    setExitingImpersonation(true);
    try {
      await toast.promise(
        stopImpersonation().then(() => {
          navigate('/superadmin/tenants');
        }),
        {
          loading: 'Restoring Super Admin session…',
          success: 'Exited impersonation. Welcome back, Super Admin!',
          error: 'Restored Super Admin session.',
        }
      );
    } catch (_) {
      navigate('/superadmin/tenants');
    } finally {
      setExitingImpersonation(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full bg-[var(--background)] overflow-hidden text-[var(--foreground)] font-sans antialiased print:h-auto print:overflow-visible print:bg-white print:block">
      {/* Desktop Sidebar (Collapsible) */}
      <aside 
        className={`border-r border-zinc-800/80 bg-black text-white flex flex-col z-30 hidden md:flex shrink-0 transition-all duration-300 ease-in-out print:hidden print-hidden no-print ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className={`h-16 px-4 border-b border-zinc-800/80 flex items-center justify-between transition-all ${isCollapsed ? 'justify-center px-2' : ''}`}>
          <Link 
            to={
              roleTitle === 'Super Admin'
                ? '/superadmin/dashboard'
                : roleTitle === 'Organization Admin' || roleTitle === 'Admin'
                ? (isPendingApproval ? '/admin/pending-approval' : isAwaitingSubscription ? '/admin/subscription' : '/admin/dashboard')
                : roleTitle === 'Government Authority' 
                ? '/government/dashboard' 
                : roleTitle === 'Advertiser' 
                ? '/advertiser/dashboard' 
                : roleTitle === 'Technician'
                ? '/technician/dashboard'
                : roleTitle === 'Driver'
                ? '/driver/dashboard'
                : roleTitle === 'Finance' || roleTitle === 'Finance Officer'
                ? '/finance/dashboard'
                : '/fleet-operator/dashboard'
            } 
            className="flex items-center gap-3 overflow-hidden"
          >
            <img
              src="/logo/logo.png"
              alt="Vmovexa"
              className="w-9 h-9 object-contain shrink-0"
            />
            {!isCollapsed && (
              <div className="animate-in fade-in duration-200 min-w-0">
                <h2 className="text-sm font-black tracking-tight text-white truncate leading-tight">
                  VMOVEXA
                </h2>
                <p className="text-[10px] text-zinc-400 font-medium tracking-normal truncate leading-tight mt-0.5">
                  Private Limited
                </p>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto no-scrollbar p-2.5 space-y-1">
          {filteredNavLinks.map((link, index) => {
            if (link.isHeader) {
              if (isCollapsed) {
                return (
                  <div 
                    key={`header-${index}-${link.label}`}
                    className="my-2 mx-3 border-t border-zinc-800/80 first:mt-0"
                    title={link.label}
                  />
                );
              }
              return (
                <div 
                  key={`header-${index}-${link.label}`}
                  className="pt-3.5 pb-1 px-3 first:pt-1 select-none"
                >
                  <span className="text-[10px] font-extrabold tracking-wider text-zinc-500 uppercase">
                    {link.label}
                  </span>
                </div>
              );
            }

            const hasMoreSpecificMatch = filteredNavLinks.some(
              (other) => !other.isHeader && other.path && link.path && other.path !== link.path && other.path.startsWith(link.path) && (location.pathname === other.path || location.pathname.startsWith(other.path + '/'))
            );
            const isPrefixActive = link.path !== '/fleet-operator/dashboard' &&
              link.path !== '/fleet-manager/dashboard' &&
              link.path !== '/technician/dashboard' &&
              link.path !== '/driver/dashboard' &&
              link.path !== '/finance/dashboard' &&
              link.path !== '/superadmin/dashboard' &&
              link.path !== '/admin/dashboard' &&
              location.pathname.startsWith(link.path);
            const isActive = (location.pathname === link.path || isPrefixActive) && !hasMoreSpecificMatch;
            const translatedLabel = getNavLabel(link.label);

            if (isNavDisabled) {
              return (
                <div
                  key={link.id ? `nav-d-${link.id}` : `${link.path || 'nav-d'}-${index}`}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold select-none
                    text-zinc-500 cursor-not-allowed opacity-40 group relative
                    ${link.isSublink && !isCollapsed ? 'ml-3 pl-3 border-l border-zinc-800 text-[11px]' : ''}
                    ${isCollapsed ? 'justify-center px-2' : ''}
                  `}
                  title={t('common.feature_locked_pending', 'Locked: Pending Super Admin Approval')}
                >
                  <span className={`shrink-0 ${link.isSublink ? 'w-3.5 h-3.5' : 'w-4 h-4'} flex items-center justify-center opacity-60`}>
                    {link.iconSvg || link.icon}
                  </span>

                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1">{translatedLabel}</span>
                      <svg className="w-3.5 h-3.5 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </>
                  )}

                  {/* Floating Tooltip when Collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-zinc-900 text-zinc-300 text-[11px] font-semibold rounded-lg shadow-xl border border-zinc-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-1">
                      <span>🔒</span>
                      <span>{translatedLabel} (Locked)</span>
                    </div>
                  )}
                </div>
              );
            }

            const isWorkOrderLink = isWorkOrderNavLink(link);
            const hasActiveWorkOrderAlert = unreadWorkOrderCount > 0 && isWorkOrderLink;

            return (
              <Link 
                key={link.id ? `nav-${link.id}` : `${link.path || 'nav'}-${index}`} 
                to={link.path}
                title={isCollapsed ? translatedLabel : ''}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold group relative
                  ${link.isSublink && !isCollapsed ? 'ml-3 pl-3 border-l border-zinc-800 text-[11px]' : ''}
                  ${isActive 
                    ? 'active-sidebar-link bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white shadow-md shadow-[#1C68FD]/30 font-bold border-transparent' 
                    : hasActiveWorkOrderAlert
                    ? 'text-amber-300 bg-amber-950/20 border border-amber-500/25 hover:text-white hover:bg-amber-900/30 hover:border-amber-500/40 shadow-xs shadow-amber-500/10'
                    : 'text-white/90 hover:text-white hover:bg-zinc-800/60'
                  }
                  ${isCollapsed ? 'justify-center px-2' : ''}
                `}
              >
                <span className={`relative shrink-0 ${link.isSublink ? 'w-3.5 h-3.5' : 'w-4 h-4'} flex items-center justify-center transition-colors ${isActive ? '[&>svg]:text-white' : ''}`}>
                  {link.iconSvg || link.icon}
                </span>

                {!isCollapsed && (
                  <span className={`truncate flex-1 text-white ${hasActiveWorkOrderAlert && !isActive ? 'text-amber-200 font-bold' : ''}`}>
                    {translatedLabel}
                  </span>
                )}

                {!isCollapsed && hasActiveWorkOrderAlert && (
                  <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs shadow-amber-500/20">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                    </span>
                    <span>{unreadWorkOrderCount}</span>
                  </span>
                )}

                {!isCollapsed && !hasActiveWorkOrderAlert && link.badge && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {link.badge}
                  </span>
                )}

                {/* Floating Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-zinc-900 text-white text-[11px] font-semibold rounded-lg shadow-xl border border-zinc-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-1.5">
                    <span>{translatedLabel}</span>
                    {hasActiveWorkOrderAlert && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1 py-0.2 rounded font-black">
                        {unreadWorkOrderCount} PENDING
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsed Blinking Indicator Dots */}
                {isCollapsed && hasActiveWorkOrderAlert && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-sm shadow-amber-500"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-800/80 flex flex-col gap-2">
          {isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full h-9 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center justify-center transition-colors"
              title="Expand sidebar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          ) : null}

          <Button 
            variant="ghost" 
            className={`w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-semibold py-2 rounded-xl transition-colors ${
              isCollapsed ? 'justify-center px-0' : 'justify-start gap-2.5 px-3'
            }`} 
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : ''}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span>{t('auth.logout', 'Logout Portal')}</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex print:hidden print-hidden no-print">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <aside aria-label="Mobile Navigation Drawer" className="mobile-sidebar-drawer relative w-72 max-w-[85vw] bg-black border-r border-zinc-800 text-white flex flex-col z-10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <Link 
                to={
                  roleTitle === 'Super Admin'
                    ? '/superadmin/dashboard'
                    : roleTitle === 'Organization Admin' || roleTitle === 'Admin'
                    ? (isPendingApproval ? '/admin/pending-approval' : isAwaitingSubscription ? '/admin/subscription' : '/admin/dashboard')
                    : roleTitle === 'Government Authority' 
                    ? '/government/dashboard' 
                    : roleTitle === 'Advertiser' 
                    ? '/advertiser/dashboard' 
                    : roleTitle === 'Technician'
                    ? '/technician/dashboard'
                    : roleTitle === 'Driver'
                    ? '/driver/dashboard'
                    : roleTitle === 'Finance' || roleTitle === 'Finance Officer'
                    ? '/finance/dashboard'
                    : '/fleet-operator/dashboard'
                } 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-3"
              >
                <img
                  src="/logo/logo.png"
                  alt="Vmovexa"
                  className="w-8 h-8 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="text-sm font-black tracking-tight text-white leading-tight">
                    VMOVEXA
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-medium leading-tight mt-0.5">
                    {roleTitle}
                  </p>
                </div>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white">✕</button>
            </div>
            <nav className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-1">
              {filteredNavLinks.map((link, index) => {
                if (link.isHeader) {
                  return (
                    <div 
                      key={`header-${index}-${link.label}`}
                      className="pt-3.5 pb-1 px-3.5 first:pt-1 select-none"
                    >
                      <span className="text-[10px] font-extrabold tracking-wider text-zinc-500 uppercase">
                        {link.label}
                      </span>
                    </div>
                  );
                }

                const hasMoreSpecificMatch = filteredNavLinks.some(
                  (other) => !other.isHeader && other.path && link.path && other.path !== link.path && other.path.startsWith(link.path) && (location.pathname === other.path || location.pathname.startsWith(other.path + '/'))
                );
                const isPrefixActive = link.path !== '/fleet-operator/dashboard' &&
                  link.path !== '/fleet-manager/dashboard' &&
                  link.path !== '/technician/dashboard' &&
                  link.path !== '/driver/dashboard' &&
                  link.path !== '/finance/dashboard' &&
                  link.path !== '/superadmin/dashboard' &&
                  link.path !== '/admin/dashboard' &&
                  location.pathname.startsWith(link.path);
                const isActive = (location.pathname === link.path || isPrefixActive) && !hasMoreSpecificMatch;
                const translatedLabel = getNavLabel(link.label);

                if (isNavDisabled) {
                  return (
                    <div
                      key={link.id ? `mob-d-${link.id}` : `${link.path || 'mob-d'}-${index}`}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 cursor-not-allowed select-none opacity-40 ${
                        link.isSublink ? 'ml-3 pl-3 border-l border-zinc-800 text-[11px]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`${link.isSublink ? 'w-3.5 h-3.5' : 'w-4 h-4'} flex items-center justify-center shrink-0 opacity-60`}>
                          {link.iconSvg || link.icon}
                        </span>
                        <span className="truncate">{translatedLabel}</span>
                      </div>
                      <svg className="w-3.5 h-3.5 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  );
                }

                const isWorkOrderLink = isWorkOrderNavLink(link);
                const hasActiveWorkOrderAlert = unreadWorkOrderCount > 0 && isWorkOrderLink;

                return (
                  <Link
                    key={link.id ? `mob-${link.id}` : `${link.path || 'mob'}-${index}`}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      link.isSublink ? 'ml-3 pl-3 border-l border-zinc-800 text-[11px]' : ''
                    } ${
                      isActive 
                        ? 'active-sidebar-link bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white shadow-md shadow-[#1C68FD]/30 font-bold border-transparent' 
                        : hasActiveWorkOrderAlert
                        ? 'text-amber-300 bg-amber-950/20 border border-amber-500/25 hover:text-white hover:bg-amber-900/30'
                        : 'text-white hover:text-white hover:bg-zinc-800/80'
                    }`}
                  >
                    <span className={`relative shrink-0 ${link.isSublink ? 'w-3.5 h-3.5' : 'w-4 h-4'} flex items-center justify-center ${isActive ? '[&>svg]:text-white' : ''}`}>
                      {link.iconSvg || link.icon}
                    </span>
                    <span className={`truncate flex-1 text-white font-medium ${hasActiveWorkOrderAlert && !isActive ? 'text-amber-200 font-bold' : ''}`}>
                      {translatedLabel}
                    </span>
                    {hasActiveWorkOrderAlert && (
                      <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                        </span>
                        <span>{unreadWorkOrderCount}</span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start mt-2" onClick={handleLogout}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{t('common.logout', 'Logout')}</span>
            </Button>
          </aside>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative print:h-auto print:overflow-visible print:block">
        {/* Impersonation Banner */}
        {isImpersonating && (
          <div className="bg-amber-600 dark:bg-amber-950/90 border-b border-amber-700/80 dark:border-amber-800/80 text-white dark:text-amber-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium shadow-sm z-30 shrink-0 print:hidden print-hidden no-print">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="p-1 rounded-lg bg-white/20 dark:bg-amber-900/60 text-white dark:text-amber-300 shrink-0 flex items-center justify-center">
                <FleetIcons.Key className="w-4 h-4 text-white dark:text-amber-300" />
              </span>
              <span className="truncate">
                <strong className="font-bold text-white dark:text-white">Impersonation Mode:</strong> Logged in as <strong className="font-bold text-white dark:text-white">{user?.name || impersonationTarget?.name || 'Tenant Admin'}</strong> ({user?.organization?.name || impersonationTarget?.tenantName || 'Tenant Organization'}). Audit tracking is active.
              </span>
            </div>
            <button
              onClick={handleExitImpersonation}
              disabled={exitingImpersonation}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 dark:bg-amber-900/50 dark:hover:bg-amber-900/80 dark:text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60 shrink-0 ml-auto active:scale-95 border border-amber-300 dark:border-amber-500/70"
            >
              <span className="text-amber-950 dark:text-white font-bold">{exitingImpersonation ? 'Restoring…' : 'Exit & Return to Super Admin'}</span>
              <svg className="w-3.5 h-3.5 shrink-0 text-amber-950 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between px-3.5 sm:px-6 z-20 shrink-0 transition-colors duration-200 print:hidden print-hidden no-print">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('common.console', 'Console')}</span>
              <span className="text-slate-300 dark:text-zinc-700">/</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100">
                {t(`roles.${roleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, roleTitle)}
              </span>
              {isTenantLocked && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>{isPendingApproval ? 'Approval Pending' : 'Subscription Required'}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* If tenant locked, show the prominent Refresh Status button requested by user */}
            {isTenantLocked && (
              <RefreshButton
                onClick={handleCheckApprovalStatus}
                loading={refreshingStatus}
                label="Refresh Status"
                loadingLabel="Checking…"
                size="sm"
                title="Refresh and check latest approval status from Super Admin"
              />
            )}

            {/* Notifications Dropdown */}
            <NotificationDropdown roleTitle={roleTitle} />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-700 dark:text-amber-400 focus:outline-none flex items-center justify-center shadow-sm"
              aria-label="Toggle theme"
              title={theme === 'dark' ? t('theme.light', 'Switch to Light Mode') : t('theme.dark', 'Switch to Dark Mode')}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Profile Link */}
            <Link 
              to={
                isTenantLocked
                  ? (isPendingApproval ? '/admin/pending-approval' : '/admin/subscription')
                  : roleTitle === 'Super Admin'
                  ? '/superadmin/profile'
                  : roleTitle === 'Organization Admin' || roleTitle === 'Admin'
                  ? '/admin/profile'
                  : roleTitle === 'Government Authority'
                  ? '/government/profile'
                  : roleTitle === 'Advertiser' 
                  ? '/advertiser/profile' 
                  : roleTitle === 'Technician'
                  ? '/technician/profile'
                  : roleTitle === 'Driver'
                  ? '/driver/profile'
                  : roleTitle === 'Finance' || roleTitle === 'Finance Officer'
                  ? '/finance/profile'
                  : '/fleet-operator/profile'
              } 
              className="flex items-center gap-2.5 pl-2 group"
            >
              <img
                src={
                  (user?.avatar_url || user?.avatarUrl)
                    ? resolveFileUrl(user.avatar_url || user.avatarUrl)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || roleTitle)}&background=0f172a&color=ffffff`
                }
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || roleTitle)}&background=0f172a&color=ffffff`;
                }}
                alt={user?.name || roleTitle}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-zinc-800 shadow-sm shrink-0 group-hover:ring-2 group-hover:ring-slate-300 dark:group-hover:ring-zinc-700 transition-all bg-slate-100 dark:bg-zinc-800"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold leading-tight text-slate-900 dark:text-zinc-100 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors">
                  {user?.name || user?.fullName || roleTitle || 'User'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight font-medium">
                  {isTenantLocked ? (user?.organization?.name || user?.org?.name || 'Pending Verification') : (user?.organization?.name || user?.org?.name || t(`roles.${roleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, roleTitle))}
                </div>
              </div>
            </Link>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar p-3.5 pb-32 sm:p-5 sm:pb-20 md:p-6 lg:p-8 lg:pb-12 z-0 print:p-0 print:m-0 print:overflow-visible print:h-auto print:block">
          <div className="w-full space-y-4 animate-in fade-in duration-200">
            {(roleTitle === 'Organization Admin' || roleTitle === 'Admin') &&
              (user?.organization?.subscription?.status === 'grace' || user?.organization?.subscription?.status === 'expired') && (
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border print:hidden print-hidden no-print ${
                    user?.organization?.subscription?.status === 'expired'
                      ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900'
                      : 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl">
                      {user?.organization?.subscription?.status === 'expired' ? '🚨' : '⚠️'}
                    </span>
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          user?.organization?.subscription?.status === 'expired'
                            ? 'text-rose-900 dark:text-rose-200'
                            : 'text-amber-900 dark:text-amber-200'
                        }`}
                      >
                        {user?.organization?.subscription?.status === 'expired'
                          ? 'SaaS Subscription Expired — Fleet Operations Restricted'
                          : 'SaaS Subscription Expired — 7-Day Grace Period Active'}
                      </h4>
                      <p
                        className={`text-[11px] sm:text-xs mt-0.5 ${
                          user?.organization?.subscription?.status === 'expired'
                            ? 'text-rose-700 dark:text-rose-300'
                            : 'text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {user?.organization?.subscription?.status === 'expired'
                          ? 'Adding new vehicles or depots is restricted (HTTP 403). Renew your subscription to restore full platform access.'
                          : 'Your subscription period has ended. You have a 7-day grace period to renew before operations are suspended.'}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/admin/billing"
                    className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all shrink-0 text-white ${
                      user?.organization?.subscription?.status === 'expired'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    Renew / Upgrade Subscription
                  </Link>
                </div>
              )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
