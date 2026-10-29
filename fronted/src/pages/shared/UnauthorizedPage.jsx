import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';

export const UnauthorizedPage = ({
  permission = '',
  title = 'Unauthorized Access',
  message = 'You do not have the required permission to view or manage this section.',
}) => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const formattedPerm = Array.isArray(permission) ? permission.join(' OR ') : permission;
  const roleName = typeof role === 'string' ? role : (user?.role?.name || user?.role?.code || 'User');

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Shield Icon with glowing ring */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center shadow-lg shadow-rose-500/10">
          <div className="text-4xl select-none animate-pulse">🔒</div>
        </div>

        {/* Header Content */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 text-[11px] font-black uppercase tracking-widest rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            403 Forbidden — Access Denied
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Permission Details Card */}
        {formattedPerm && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 font-semibold">
              <span>Required Permission:</span>
              <code className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-mono font-bold text-[11px] border border-rose-200 dark:border-rose-800">
                {formattedPerm}
              </code>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 font-semibold">
              <span>Current Role:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{roleName}</span>
            </div>
            {user?.email && (
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 font-semibold">
                <span>Account:</span>
                <span className="font-mono text-slate-700 dark:text-zinc-300">{user.email}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>← Go Back</span>
          </button>

          <Link
            to="/fleet-operator/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <FleetIcons.Dashboard className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
          Need access to this feature? Contact your organization administrator to grant you this permission.
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
