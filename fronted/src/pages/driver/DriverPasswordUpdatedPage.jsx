import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverPasswordUpdatedPage = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-md mx-auto py-12 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
      <Breadcrumb
        items={[
          { label: 'Driver', path: '/driver/dashboard' },
          { label: 'Profile', path: '/driver/profile' },
          { label: 'Password Updated' },
        ]}
        className="mb-4 justify-center"
      />

      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <FleetIcons.Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('driver.password.updated_title')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1.5 max-w-xs mx-auto">
          {t('driver.password.updated_subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm text-xs text-slate-600 dark:text-zinc-300 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{t('driver.password.account_label')}</span>
          <span className="font-bold text-slate-900 dark:text-white">{t('driver.password.active_profile')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{t('common.status')}:</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400">{t('driver.password.auth_updated')}</span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Link
          to="/driver/dashboard"
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all block text-center"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/driver/profile"
          className="w-full py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all block text-center"
        >
          View Profile & Settings
        </Link>
      </div>
    </div>
  );
};

export default DriverPasswordUpdatedPage;
