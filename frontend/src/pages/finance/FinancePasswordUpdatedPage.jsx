import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';

export const FinancePasswordUpdatedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { user } = useAuth();

  const officerName = user?.name || user?.fullName || 'Finance Officer';
  const officerCode = user?.enrollment_no || user?.code || (user?.id ? `FIN-${user.id}` : 'FIN-101');

  return (
    <div className="w-full max-w-xl mx-auto py-12 space-y-6 text-center animate-in fade-in duration-200">
      <Breadcrumb
        items={[
          { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
          { label: 'Profile', path: `${basePath}/profile` },
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
          Your finance portal security credentials have been updated in the VMOVEXA directory. Use your new password for all subsequent logins.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md mx-auto">
        <span>Account: <strong className="text-slate-900">{officerName}</strong> ({officerCode}) · Session security has been renewed.</span>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => navigate(`${basePath}/profile`)}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
        >
          Back to Finance Profile
        </button>
        <Link
          to={`${basePath}/dashboard`}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default FinancePasswordUpdatedPage;
