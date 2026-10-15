import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const GovPasswordUpdatedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-xl mx-auto py-12 space-y-6 text-center animate-in fade-in duration-200">
      <Breadcrumb
        items={[
          { label: 'Government', path: '/government/dashboard' },
          { label: 'Profile', path: '/government/profile' },
          { label: 'Password Updated' },
        ]}
        className="mb-4 justify-center"
      />

      <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <FleetIcons.Check className="w-10 h-10 stroke-[2.5]" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Password Updated Successfully!</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-2 max-w-md mx-auto">
          Your government administrative credentials have been updated in the VMOVEXA directory. Use your new password for all subsequent logins.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md mx-auto">
        <span>Session security has been renewed. You can now return to your authority profile or public transit dashboards.</span>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => navigate('/government/profile')}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
        >
          Back to Officer Profile
        </button>
        <Link
          to="/government/dashboard"
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default GovPasswordUpdatedPage;
