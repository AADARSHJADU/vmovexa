import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

export const TechPasswordUpdatedPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Breadcrumb Header */}
      <div className="w-full p-4 px-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <Breadcrumb
          items={[
            { label: 'Technician', path: '/technician/dashboard' },
            { label: 'Profile', path: '/technician/profile' },
            { label: 'Password Updated' },
          ]}
        />
      </div>

      {/* 2. Hero Success Card */}
      <div className="p-8 md:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
        
        {/* Glowing Checkmark Circle */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-4 border-emerald-100 dark:border-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <FleetIcons.Check className="w-9 h-9 stroke-[2.5]" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Password Updated Successfully
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Your technician account password has been changed. You can now continue with your IoT hardware and field operations.
          </p>
        </div>

        {/* What's Changed Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-left space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <FleetIcons.Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{t('technician.password.audit_log')}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300">
              <span className="flex items-center gap-2">
                <FleetIcons.Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{t('technician.password.updated_title')}</span>
              </span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">{t('technician.password.just_now')}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 text-slate-600 dark:text-zinc-300">
              <span className="flex items-center gap-2">
                <FleetIcons.Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('technician.password.account_status')}</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t('technician.password.secure_active')}</span>
            </div>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate('/technician/profile')}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
            <span>{t('common.back_to_profile')}</span>
          </button>
          <button
            onClick={() => navigate('/technician/dashboard')}
            className="w-full h-11 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs transition-all"
          >
            Go to Technician Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
export default TechPasswordUpdatedPage;
