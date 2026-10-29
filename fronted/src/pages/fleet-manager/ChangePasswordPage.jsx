import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { authService } from '../../api/services/auth.service';

export const ChangePasswordPage = () => {
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
    if (!newPassword || newPassword !== confirmPassword) return;
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
      navigate('/fleet-operator/profile/security/success');
    } catch {
      /* toast handles error */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Operator', path: '/fleet-operator/dashboard' },
          { label: 'Profile', path: '/fleet-operator/profile' },
          { label: 'Change Password' },
        ]}
        className="mb-2"
      />

      {/* Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/fleet-operator/profile')} 
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title={t('common.back_to_profile')}
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('common.change_password')}</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.password.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* 2. Security Best Practice Banner */}
      <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center gap-4 transition-colors">
        <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <FleetIcons.Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">{t('fleet.password.keep_secure')}</h3>
          <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">
            Use a strong password to protect your account and fleet operational data from unauthorized access.
          </p>
        </div>
      </div>

      {/* 3. Change Password Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6 transition-colors">
        
        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.current_password')}</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              placeholder={t('common.enter_current_password')}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            >
              {showCurrent ? <FleetIcons.EyeOff className="w-4 h-4" /> : <FleetIcons.Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.new_password')}</label>
            {newPassword && (
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                Strength: <strong className={passedCount >= 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{strength}</strong>
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              required
              placeholder={t('common.enter_new_password')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            >
              {showNew ? <FleetIcons.EyeOff className="w-4 h-4" /> : <FleetIcons.Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {newPassword && (
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 mt-2 overflow-hidden">
              <div className={`h-full ${strengthColor} transition-all`} style={{ width: `${(passedCount / 4) * 100}%` }}></div>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.confirm_new_password')}</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              placeholder={t('common.reenter_new_password')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            >
              {showConfirm ? <FleetIcons.EyeOff className="w-4 h-4" /> : <FleetIcons.Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-[11px] text-red-500 mt-1">{t('common.password_mismatch')}</p>
          )}
        </div>

        {/* Password Requirements Checklist */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Password Requirements
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-zinc-400'}`}>
              <FleetIcons.Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>{t('driver.password.req_min8')}</span>
            </div>
            <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-zinc-400'}`}>
              <FleetIcons.Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>{t('driver.password.req_upper')}</span>
            </div>
            <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-zinc-400'}`}>
              <FleetIcons.Check className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>{t('driver.password.req_number')}</span>
            </div>
            <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-zinc-400'}`}>
              <FleetIcons.Check className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>{t('driver.password.req_special')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/fleet-operator/profile')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={passedCount < 3 || newPassword !== confirmPassword || loading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <FleetIcons.Lock className="w-4 h-4 text-white" />
            <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
