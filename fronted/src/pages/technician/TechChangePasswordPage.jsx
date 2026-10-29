import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../api/services/auth.service';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

export const TechChangePasswordPage = () => {
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
      navigate('/technician/profile/security/success');
    } catch {
      /* toast handles error */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Breadcrumb Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Technician', path: '/technician/dashboard' },
              { label: 'Profile', path: '/technician/profile' },
              { label: 'Change Password' },
            ]}
            className="mb-2"
          />

          <div className="flex items-center gap-3 mt-2">
            <button 
              type="button"
              onClick={() => navigate('/technician/profile')} 
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title={t('common.back_to_profile')}
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('technician.password.title')}</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('technician.password.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Security Best Practice Banner */}
      <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <FleetIcons.Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">{t('technician.password.keep_secure')}</h3>
          <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">
            Use a strong password to protect your field technician access and IoT hardware provisioning keys from unauthorized access.
          </p>
        </div>
      </div>

      {/* 3. Change Password Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
        
        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.current_password')}</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t('common.enter_current_password')}
              className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
              title={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? <FleetIcons.EyeOff className="w-4 h-4" /> : <FleetIcons.Eye className="w-4 h-4" />}
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
              placeholder={t('common.enter_min_8_char')}
              className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
              title={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? <FleetIcons.EyeOff className="w-4 h-4" /> : <FleetIcons.Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength Bar */}
          {newPassword && (
            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 dark:text-zinc-400">{t('common.password_strength')}</span>
                <span className={strength === 'Strong' ? 'text-emerald-600 dark:text-emerald-400' : strength === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400'}>
                  {strength}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${strengthColor}`}
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
              placeholder={t('common.reenter_new_password')}
              className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
              title={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <FleetIcons.EyeOff className="w-4 h-4" /> : <FleetIcons.Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-[11px] text-red-500 dark:text-red-400 font-bold">{t('common.passwords_do_not_match')}</p>
          )}
        </div>

        {/* Security Criteria Checklist */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-2">
          <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.password_must_contain')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-zinc-400'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasMinLength ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                {hasMinLength ? '✓' : '○'}
              </span>
              <span>{t('common.at_least_8_chars')}</span>
            </div>
            <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-zinc-400'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasUppercase ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                {hasUppercase ? '✓' : '○'}
              </span>
              <span>{t('common.one_uppercase_letter')}</span>
            </div>
            <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-zinc-400'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasNumber ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                {hasNumber ? '✓' : '○'}
              </span>
              <span>{t('common.one_number')}</span>
            </div>
            <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-zinc-400'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasSpecial ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                {hasSpecial ? '✓' : '○'}
              </span>
              <span>{t('common.one_special_char')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/technician/profile')}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || passedCount < 4 || newPassword !== confirmPassword}
            className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <FleetIcons.Check className="w-4 h-4" />
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default TechChangePasswordPage;
