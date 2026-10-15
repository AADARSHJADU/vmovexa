import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../api/services/auth.service';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const AdvertiserChangePasswordPage = () => {
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
      navigate('/advertiser/profile/security/success');
    } catch {
      /* toast handles error */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/advertiser/dashboard' },
              { label: 'Profile', to: '/advertiser/profile' },
              { label: 'Security & Password' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Security & Password</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Protect your advertiser account by configuring robust credentials.</p>
        </div>

        <Link
          to="/advertiser/profile"
          className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all self-start sm:self-auto"
        >
          Cancel
        </Link>
      </div>

      {/* Form matching Fleet Manager */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Change Account Password
              </h2>
            </div>
          </div>

          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
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
            <label className="text-xs font-bold text-slate-700">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
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
                  <span className="text-slate-500">Password Strength:</span>
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
            <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
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
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
            <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Password Requirements:</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className={hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                {hasMinLength ? '✓' : '○'} At least 8 characters
              </div>
              <div className={hasUppercase ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                {hasUppercase ? '✓' : '○'} At least 1 uppercase letter
              </div>
              <div className={hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                {hasNumber ? '✓' : '○'} At least 1 number
              </div>
              <div className={hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                {hasSpecial ? '✓' : '○'} At least 1 special char (!@#$)
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/advertiser/profile')}
            className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !hasMinLength || newPassword !== confirmPassword}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvertiserChangePasswordPage;
