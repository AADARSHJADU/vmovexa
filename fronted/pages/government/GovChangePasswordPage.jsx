import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../api/services/auth.service';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const GovChangePasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      toast.error(t('driver.password.mismatch_error', 'Passwords do not match'));
      return;
    }
    try {
      setLoading(true);
      await toast.promise(
        authService.changePassword(currentPassword, newPassword),
        {
          loading: t('common.updating', 'Updating password...'),
          success: t('driver.password.updated_subtitle', 'Password updated successfully!'),
          error: (err) => err?.message || t('common.failed', 'Failed to change password'),
        }
      );
      navigate('/government/profile/security/success');
    } catch {
      /* toast handles error */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Header with Breadcrumbs */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Government', path: '/government/dashboard' },
              { label: 'Profile', path: '/government/profile' },
              { label: t('gov.password.title', 'Change Password') },
            ]}
            className="mb-2"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/government/profile')}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title={t('gov.account.back_profile')}
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{t('gov.password.title')}</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.password.desc')}</p>
            </div>
          </div>
        </div>

        <Link
          to="/government/profile"
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all self-start sm:self-auto"
        >
          {t('common.cancel', 'Cancel')}
        </Link>
      </div>

      {/* Form matching Fleet Manager & Driver portals */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                {t('ag.government.govchangepasswordpage.change_authority_password', 'Change Authority Password')}
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
                placeholder={t('driver.password.current_ph')}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold"
              >
                {showCurrent ? t('common.hide', 'Hide') : t('common.show', 'Show')}
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
                placeholder={t('driver.password.new_ph')}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold"
              >
                {showNew ? t('common.hide', 'Hide') : t('common.show', 'Show')}
              </button>
            </div>

            {/* Strength indicator */}
            {newPassword.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500 dark:text-zinc-400">{t('gov.password.strength')}</span>
                  <span className={strength === 'Strong' ? 'text-emerald-600 dark:text-emerald-400' : strength === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
                    {strength === 'Strong' ? t('common.strong', 'Strong') : strength === 'Medium' ? t('common.medium', 'Medium') : t('common.weak', 'Weak')}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
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
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.confirm_password')}</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('driver.password.confirm_ph')}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold"
              >
                {showConfirm ? t('common.hide', 'Hide') : t('common.show', 'Show')}
              </button>
            </div>
          </div>

          {/* Requirements Grid */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
            <div className="font-bold text-slate-700 dark:text-zinc-300 text-[11px] uppercase tracking-wider">{t('gov.password.requirements')}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className={hasMinLength ? 'text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5' : 'text-slate-400 dark:text-zinc-500 flex items-center gap-1.5'}>
                {hasMinLength ? <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-600 shrink-0" />}
                <span>{t('driver.password.req_min8', 'Minimum 8 characters')}</span>
              </div>
              <div className={hasUppercase ? 'text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5' : 'text-slate-400 dark:text-zinc-500 flex items-center gap-1.5'}>
                {hasUppercase ? <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-600 shrink-0" />}
                <span>{t('driver.password.req_upper', 'At least 1 uppercase letter')}</span>
              </div>
              <div className={hasNumber ? 'text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5' : 'text-slate-400 dark:text-zinc-500 flex items-center gap-1.5'}>
                {hasNumber ? <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-600 shrink-0" />}
                <span>{t('driver.password.req_number', 'At least 1 number (0-9)')}</span>
              </div>
              <div className={hasSpecial ? 'text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5' : 'text-slate-400 dark:text-zinc-500 flex items-center gap-1.5'}>
                {hasSpecial ? <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-600 shrink-0" />}
                <span>{t('driver.password.req_special', 'At least 1 special character (!@#$)')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/government/profile')}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            disabled={loading || !hasMinLength || newPassword !== confirmPassword}
            className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
          >
            {loading ? t('common.updating', 'Updating...') : t('driver.password.update_btn', 'Update Password')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GovChangePasswordPage;
