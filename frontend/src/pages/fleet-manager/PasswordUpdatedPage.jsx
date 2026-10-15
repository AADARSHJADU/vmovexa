import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

export const PasswordUpdatedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Manager', path: '/fleet-manager/dashboard' },
          { label: 'Profile', path: '/fleet-manager/profile' },
          { label: 'Password Updated' },
        ]}
        className="mb-2"
      />

      {/* 2. Hero Success Card */}
      <div className="p-8 md:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center space-y-6 max-w-2xl mx-auto transition-colors">
        
        {/* Glowing Checkmark Circle */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-4 border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-4xl font-black shadow-lg shadow-emerald-500/20">
            <FleetIcons.Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Password Updated Successfully
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Your account password has been changed. You can now continue with your fleet operations.
          </p>
        </div>

        {/* Security Audit Log */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <FleetIcons.Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Security Audit Log</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300">
              <span className="flex items-center gap-2">
                <FleetIcons.Lock className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                <span>Password updated</span>
              </span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">Just now</span>
            </div>

            <div className="flex items-center justify-between py-1.5 text-slate-600 dark:text-zinc-300">
              <span className="flex items-center gap-2">
                <FleetIcons.Shield className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Account status</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Secure & Active</span>
            </div>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/fleet-manager/profile')}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/fleet-manager/dashboard')}
            className="w-full h-11 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs transition-all"
          >
            Go to Operations Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordUpdatedPage;
