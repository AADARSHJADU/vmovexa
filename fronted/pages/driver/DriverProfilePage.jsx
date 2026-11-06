import { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, loadProfile } = useDriverApp();

  useEffect(() => {
    loadProfile().catch(() => {});
  }, [loadProfile]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const displayName = profile?.name || user?.name || 'Driver';
  const displayEmail = profile?.email || user?.email || '—';
  const displayPhone = profile?.phone || user?.phone || '—';
  const emergencyPhone = profile?.emergency_contact || profile?.emergencyPhone || '—';
  const bloodGroup = profile?.blood_group || '—';

  const badgeId = profile?.badge_id || profile?.code || profile?.emp_id || (profile?.id ? `DRV-${profile.id}` : '—');
  const orgName = (typeof profile?.organization === 'object' && profile?.organization !== null ? profile.organization.name : null) ||
                  (typeof user?.organization === 'object' && user?.organization !== null ? user.organization.name : null) ||
                  user?.org?.name || 'Transit Operations';
  const depotName = profile?.depot?.name || profile?.home_depot || '—';
  const busNumber = profile?.assigned_bus_number || profile?.assignedBus?.bus_number || profile?.assignedBus?.registration_number || 'Unassigned';
  const activeShift = profile?.active_shift || profile?.activeShift || 'Regular Day';
  const dlNumber = profile?.dl_number || profile?.licenseNumber || '—';
  const licenseType = profile?.license_type || 'Commercial (HMV)';
  const licenseExpiry = profile?.license_expiry || '—';

  const avatarSrc = (user?.avatar_url || user?.avatarUrl || user?.avatar || profile?.avatar)
    ? resolveFileUrl(user?.avatar_url || user?.avatarUrl || user?.avatar || profile?.avatar)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f172a&color=ffffff`;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Header with Breadcrumb */}
      <div>
        <Breadcrumb
          items={[
            { label: t('ag.driver.driverprofilepage.driver', 'Driver'), path: '/driver/dashboard' },
            { label: t('ag.driver.driverprofilepage.profile', 'Profile') },
          ]}
          className="mb-2"
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('driver.profile.title', 'Driver Profile')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              {t('driver.profile.desc', 'View and manage your verified credentials, assigned vehicle, and account security.')}
            </p>
          </div>

          <Link
            to="/driver/settings"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto flex items-center gap-2 cursor-pointer"
          >
            <FleetIcons.Settings className="w-4 h-4 text-white" />
            <span>{t('ag.driver.driverprofilepage.edit_profile', 'Edit Profile')}</span>
          </Link>
        </div>
      </div>

      {/* 2. Driver Hero Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <img
          src={avatarSrc}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f172a&color=ffffff`;
          }}
          alt={displayName}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-zinc-700 shadow-md shrink-0 bg-slate-100 dark:bg-zinc-800"
        />

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{displayName}</h2>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md">
              {badgeId}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full">
              {profile?.status ? String(profile.status).replace('_', ' ').toUpperCase() : t('ag.driver.driverprofilepage.active_driver', 'ACTIVE DRIVER')}
            </span>
          </div>

          <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">
            {orgName}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400 font-medium flex-wrap pt-1">
            <span>{t('ag.driver.driverprofilepage.primary_depot', 'Primary Depot:')}<strong className="text-slate-800 dark:text-zinc-200">{depotName}</strong></span>
            <span>·</span>
            <span>{t('ag.driver.driverprofilepage.assigned_bus', 'Assigned Bus:')}<strong className="text-slate-800 dark:text-zinc-200 font-mono">{busNumber}</strong></span>
            <span>·</span>
            <span>{t('ag.driver.driverprofilepage.shift', 'Shift:')}<strong className="text-slate-800 dark:text-zinc-200 font-mono">{activeShift}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Driver Information (Personal & Operational Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card A: Personal & Contact */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('ag.driver.driverprofilepage.personal_contact_details', 'Personal & Contact Details')}</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
              <span className="text-slate-500 dark:text-zinc-400">{t('ag.driver.driverprofilepage.full_name', 'Full Name')}</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{displayName}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
              <span className="text-slate-500 dark:text-zinc-400">{t('ag.driver.driverprofilepage.email_address', 'Email Address')}</span>
              <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">{displayEmail}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
              <span className="text-slate-500 dark:text-zinc-400">{t('ag.driver.driverprofilepage.mobile_phone', 'Mobile Phone')}</span>
              <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">{displayPhone}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
              <span className="text-slate-500 dark:text-zinc-400">{t('ag.driver.driverprofilepage.emergency_contact', 'Emergency Contact')}</span>
              <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">{emergencyPhone}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500 dark:text-zinc-400">{t('ag.driver.driverprofilepage.blood_group', 'Blood Group')}</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{bloodGroup}</span>
            </div>
          </div>
        </div>

        {/* Card B: Duty & Driving License */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('ag.driver.driverprofilepage.duty_licensing_details', 'Duty & Licensing Details')}</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
              <span className="text-slate-500 dark:text-zinc-400">{t('ag.driver.driverprofilepage.assigned_bus_1', 'Assigned Bus')}</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{busNumber}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
              <span className="text-slate-500 dark:text-zinc-400">{t('ag.driver.driverprofilepage.primary_depot_1', 'Primary Depot')}</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{depotName}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
              <span className="text-slate-500 dark:text-zinc-400">{t('ag.driver.driverprofilepage.active_shift', 'Active Shift')}</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{activeShift}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/80">
              <span className="text-slate-500 dark:text-zinc-400">{t('ag.driver.driverprofilepage.driving_license_dl', 'Driving License (DL)')}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{dlNumber}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500 dark:text-zinc-400">{t('ag.driver.driverprofilepage.license_type_expiry', 'License Type & Expiry')}</span>
              <span className="font-medium text-slate-800 dark:text-zinc-200">{licenseType} {licenseExpiry !== '—' ? `· Exp: ${licenseExpiry}` : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Account Settings & Security (Clean, Non-Duplicate) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-zinc-800">{t('ag.driver.driverprofilepage.account_settings_security', 'Account Settings & Security')}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <Link
            to="/driver/settings"
            className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/60 dark:bg-zinc-800/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                <FleetIcons.Settings className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{t('ag.driver.driverprofilepage.profile_settings', 'Profile Settings')}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('ag.driver.driverprofilepage.edit_photo_contact_info', 'Edit photo & contact info')}</p>
              </div>
            </div>
            <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/driver/settings/security"
            className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/60 dark:bg-zinc-800/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
                <FleetIcons.Key className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{t('ag.driver.driverprofilepage.security_password', 'Security & Password')}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('ag.driver.driverprofilepage.change_login_credentials', 'Change login credentials')}</p>
              </div>
            </div>
            <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/driver/settings/notifications"
            className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/60 dark:bg-zinc-800/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
                <FleetIcons.Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{t('ag.driver.driverprofilepage.alert_preferences', 'Alert Preferences')}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('ag.driver.driverprofilepage.shift_notification_alerts', 'Shift & notification alerts')}</p>
              </div>
            </div>
            <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 5. Logout Row */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('ag.driver.driverprofilepage.logged_in_on_this_device', 'Logged in on this device')}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <FleetIcons.Logout className="w-3.5 h-3.5" />
          <span>{t('ag.driver.driverprofilepage.logout_session', 'Logout Session')}</span>
        </button>
      </div>
    </div>
  );
};

export default DriverProfilePage;
