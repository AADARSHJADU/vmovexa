import React, { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { resolveFileUrl } from '../../api/services/upload.service';

export const GovProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { campaigns, broadcasts, analytics, loadCampaigns, loadBroadcasts, loadAgencyAnalytics } = useGovernmentRole();

  useEffect(() => {
    if (loadCampaigns) loadCampaigns({ page: 1, limit: 10 }).catch(() => {});
    if (loadBroadcasts) loadBroadcasts({ page: 1, limit: 10 }).catch(() => {});
    if (loadAgencyAnalytics) loadAgencyAnalytics().catch(() => {});
  }, [loadCampaigns, loadBroadcasts, loadAgencyAnalytics]);

  const campaignCount = Array.isArray(campaigns) ? campaigns.length : (campaigns?.rows?.length || campaigns?.total || 0);
  const broadcastCount = Array.isArray(broadcasts) ? broadcasts.length : (broadcasts?.rows?.length || broadcasts?.total || 0);
  const monitoredCount = analytics?.monitoredBuses ?? analytics?.fleetCount ?? analytics?.totalBuses ?? 0;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const displayName = user?.name || user?.fullName || 'Government Officer';
  const displayRole = user?.role?.name || user?.role || 'Authority Officer';
  const orgName = user?.organization?.name || user?.agency || user?.department || 'State Transport Authority';
  const officerId = user?.enrollment_no || user?.code || (user?.id ? `GOV-${user.id}` : '—');
  const avatarRaw = user?.avatar_url || user?.avatarUrl;
  const avatar = avatarRaw
    ? resolveFileUrl(avatarRaw)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f172a&color=ffffff`;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Web Header matching Fleet Manager */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Government', path: '/government/dashboard' },
              { label: 'Officer Profile' },
            ]}
            className="mb-2"
          />

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mt-1">{t('gov.profile.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.desc')}</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center gap-2"
        >
          <FleetIcons.LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span>{t('gov.profile.logout')}</span>
        </button>
      </div>

      {/* 2. Hero Profile Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={avatar}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f172a&color=ffffff`;
              }}
              alt={displayName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-zinc-800 shadow-md bg-slate-100 dark:bg-zinc-800"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{displayName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                {displayRole}
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium mt-1">{orgName}</div>
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">Officer Badge ID: {officerId}</div>
          </div>
        </div>

        {/* 3 Core Stat Pills */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{t('common.campaigns')}</div>
            <div className="font-black text-lg text-slate-900 dark:text-white mt-0.5">{campaignCount}</div>
          </div>
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{t('common.broadcasts')}</div>
            <div className="font-black text-lg text-red-600 dark:text-red-400 mt-0.5">{broadcastCount}</div>
          </div>
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{t('gov.profile.monitored_units')}</div>
            <div className="font-black text-lg text-blue-700 dark:text-blue-400 mt-0.5">{monitoredCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Account & Settings Web Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account & Security Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Account & Security
          </h3>

          <div className="space-y-2.5">
            <div
              onClick={() => navigate('/government/profile/account')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-blue-50/60 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Driver className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('gov.profile.account_settings')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.account_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate('/government/profile/security')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Key className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('gov.profile.security_password')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.security_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate('/government/profile/notifications')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Bell className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('gov.profile.notification_settings')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.notification_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>

        {/* Helpdesk & Legal Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Helpdesk & Legal
          </h3>

          <div className="space-y-2.5">
            <div
              onClick={() => navigate('/government/help')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Headset className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('gov.profile.help_support')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.help_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate('/government/privacy')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Shield className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('gov.profile.privacy_policy')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.privacy_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate('/government/terms')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Document className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('gov.profile.terms_conditions')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.terms_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovProfilePage;
