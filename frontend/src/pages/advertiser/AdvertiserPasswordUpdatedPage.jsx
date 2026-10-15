import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const AdvertiserPasswordUpdatedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/advertiser/dashboard' },
              { label: 'Profile', to: '/advertiser/profile' },
              { label: 'Password Updated' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            Security Status
          </h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto py-8 space-y-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <FleetIcons.Check className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Password Updated Successfully!</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-2 max-w-md mx-auto">
            Your advertiser security credentials have been updated in the VMOVEXA directory. Use your new password for all subsequent logins.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-300 max-w-md mx-auto">
          <span>Session security has been renewed. You can now return to your advertiser profile or manage campaigns.</span>
        </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => navigate('/advertiser/profile')}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
        >
          Back to Advertiser Profile
        </button>
        <Link
          to="/advertiser/dashboard"
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  </div>
);
};

export default AdvertiserPasswordUpdatedPage;
