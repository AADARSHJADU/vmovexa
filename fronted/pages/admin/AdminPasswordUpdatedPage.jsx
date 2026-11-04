import React from 'react';
import { Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useTranslation } from '../../hooks/useTranslation';

export const AdminPasswordUpdatedPage = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: t('nav.admin') || 'Dashboard', path: '/admin/dashboard' },
              { label: t('admin.profile.title') || 'Admin Profile', path: '/admin/profile' },
              { label: t('admin.password.updated_title') }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            {t('admin.password.security_status')}
          </h1>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-12 shadow-sm text-center max-w-xl mx-auto space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <FleetIcons.Check className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            {t('admin.password.updated_success')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-md mx-auto">
            {t('admin.password.updated_desc')}
          </p>
        </div>

        <div className="pt-3">
          <Link
            to="/admin/profile"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <span>{t('admin.password.back_to_profile')}</span>
            <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
};
