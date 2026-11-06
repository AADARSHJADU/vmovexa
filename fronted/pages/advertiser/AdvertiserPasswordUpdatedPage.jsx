import { useTranslation } from '../../hooks/useTranslation';
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const AdvertiserPasswordUpdatedPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/advertiser' : '/advertiser';

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: isSuperAdmin ? t('nav.superadmin', 'SuperAdmin') : t('roles.advertiser', 'Advertiser'), path: `${basePath}/dashboard`, icon: FleetIcons.Dashboard },
              { label: t('advertiser.profile.breadcrumb', 'Profile'), path: `${basePath}/profile` },
              { label: t('advertiser.password.updated_breadcrumb', 'Password Updated') }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            {t('ag.advertiser.advertiserpasswordupdatedpage.security_status', 'Security Status')}
          </h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto py-8 space-y-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <FleetIcons.Check className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{t('advertiser.password.updated_title')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-2 max-w-md mx-auto">
            {t('ag.advertiser.advertiserpasswordupdatedpage.your_advertiser_security_credentials_have_be', 'Your advertiser security credentials have been updated in the VMOVEXA directory. Use your new password for all subsequent logins.')}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-300 max-w-md mx-auto">
          <span>{t('advertiser.password.updated_desc')}</span>
        </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => navigate(`${basePath}/profile`)}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          {t('ag.advertiser.advertiserpasswordupdatedpage.back_to_advertiser_profile', 'Back to Advertiser Profile')}
        </button>
        <Link
          to={`${basePath}/dashboard`}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all text-center"
        >
          {t('ag.advertiser.advertiserpasswordupdatedpage.go_to_dashboard', 'Go to Dashboard')}
        </Link>
      </div>
    </div>
  </div>
);
};

export default AdvertiserPasswordUpdatedPage;
