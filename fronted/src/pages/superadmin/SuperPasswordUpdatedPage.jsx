import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const SuperPasswordUpdatedPage = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
          { label: t('nav.profile', 'Super Admin Profile'), path: '/superadmin/profile' },
          { label: t('settings.password_updated', 'Password Updated') },
        ]}
      />

      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-sm text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <FleetIcons.Check className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('settings.password_rotated_title', 'Root Password & Key Rotated Successfully!')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
            {t('settings.password_rotated_sub', 'Your Super Admin master credentials have been rotated in the security vault. Your active session token has been renewed, keeping your workspace seamlessly authenticated.')}
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 font-mono text-left max-w-sm mx-auto space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400 dark:text-zinc-500">{t('common.status', 'Status')}:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{t('settings.password_synced', '200 OK — Password Synced')}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 dark:text-zinc-500">{t('settings.audit_action', 'Audit Action')}:</span>
            <span className="text-slate-800 dark:text-zinc-200">AUTH_ROOT_KEY_ROTATED</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 dark:text-zinc-500">{t('settings.timestamp', 'Timestamp')}:</span>
            <span className="text-slate-800 dark:text-zinc-200">{new Date().toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/superadmin/profile"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <span>{t('settings.return_profile', 'Return to Sovereign Profile')}</span>
            <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/superadmin/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all"
          >
            <span>{t('common.go_to_dashboard', 'Go to Dashboard')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperPasswordUpdatedPage;
