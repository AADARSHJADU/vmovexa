import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../api/services/auth.service';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const FinanceChangePasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Criteria checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*]/.test(newPassword);

  const passedCount = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strength = passedCount <= 1 ? 'Weak' : passedCount <= 3 ? 'Medium' : 'Strong';
  const strengthColor = passedCount <= 1 ? 'bg-red-500' : passedCount <= 3 ? 'bg-amber-500' : 'bg-emerald-500';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await toast.promise(
        authService.changePassword(currentPassword, newPassword),
        {
          loading: 'Updating password...',
          success: 'Password updated successfully!',
          error: (err) => err?.message || 'Failed to change password',
        }
      );
      navigate(`${basePath}/settings/security/success`);
    } catch {
      /* toast handles error */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Breadcrumb Header matching Fleet Manager */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Finance Profile', path: `${basePath}/profile` },
              { label: 'Security & Password' },
            ]}
            className="mb-2"
          />

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/profile`)}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title={t('common.back_to_profile')}
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('common.security_password')}</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">{t('finance.password.protect_desc')}</p>
            </div>
          </div>
        </div>

        <Link
          to={`${basePath}/profile`}
          className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all self-start sm:self-auto"
        >
          Cancel
        </Link>
      </div>

      {/* Form matching Fleet Manager */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t('finance.password.change_title')}
              </h2>
            </div>
          </div>

          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.current_password')}</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('common.enter_current_password', 'Enter current password')}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                {showCurrent ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.new_password')}</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('common.enter_new_password', 'Enter new password')}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Strength indicator */}
            {newPassword.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500 dark:text-zinc-400">{t('common.password_strength')}</span>
                  <span className={strength === 'Strong' ? 'text-emerald-600' : strength === 'Medium' ? 'text-amber-600' : 'text-red-600'}>
                    {strength}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strengthColor} transition-all duration-300`}
                    style={{ width: `${(passedCount / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.confirm_new_password')}</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('common.reenter_new_password', 'Re-enter new password')}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Requirements Grid */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                {hasMinLength ? <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <span className="w-2 h-2 rounded-full border border-slate-300 inline-block shrink-0" />}
                <span>{t('driver.password.req_min8')}</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                {hasUppercase ? <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <span className="w-2 h-2 rounded-full border border-slate-300 inline-block shrink-0" />}
                <span>{t('driver.password.req_upper')}</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                {hasNumber ? <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <span className="w-2 h-2 rounded-full border border-slate-300 inline-block shrink-0" />}
                <span>{t('driver.password.req_number')}</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                {hasSpecial ? <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <span className="w-2 h-2 rounded-full border border-slate-300 inline-block shrink-0" />}
                <span>{t('driver.password.req_special')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/profile`)}
            className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !hasMinLength || newPassword !== confirmPassword}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('common.updating') : t('common.update_password', 'Update Password')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FinanceChangePasswordPage;
