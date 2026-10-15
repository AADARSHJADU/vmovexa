import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { authService } from '../../api/services/auth.service';
import toast from 'react-hot-toast';

export const SuperChangePasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Requirements checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  // Calculate score (0 to 4)
  const strengthScore = [hasMinLength, hasUpperCase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthColor =
    strengthScore <= 1
      ? 'bg-rose-500'
      : strengthScore <= 3
      ? 'bg-amber-500'
      : 'bg-emerald-500';
  const strengthLabel =
    strengthScore === 0
      ? 'None'
      : strengthScore <= 1
      ? 'Weak'
      : strengthScore <= 3
      ? 'Moderate'
      : 'Strong (Root Compliant)';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (!hasMinLength || !hasUpperCase || !hasNumber || !hasSpecial) {
      setError('Password does not meet root security requirements');
      return;
    }

    setSubmitting(true);
    try {
      await toast.promise(
        authService.changePassword({ currentPassword, newPassword }),
        {
          loading: 'Rotating master root credentials...',
          success: 'Password rotated successfully! Active session refreshed.',
          error: (err) => err?.message || 'Password update failed.',
        }
      );
      navigate('/superadmin/settings/security/success');
    } catch (err) {
      setError(err?.message || 'Password update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'SuperAdmin', to: '/superadmin/dashboard' },
          { label: 'Super Admin Profile', to: '/superadmin/profile' },
          { label: 'Master Key & Password Security' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>🔐</span> {t('security.title', 'Master Key & Password Security')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Update root administrative credentials and rotate platform access keys securely
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Form Column */}
        <div className="lg:col-span-2 space-y-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-4"
          >
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Rotate Root Master Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Previous device tokens will be revoked; your current session will be re-authenticated automatically.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Current Master Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Enter current root password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-xs font-medium cursor-pointer"
                  >
                    {showCurrent ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  New Master Password *
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Enter strong new master password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-xs font-medium cursor-pointer"
                  >
                    {showNew ? 'Hide' : 'Show'}
                  </button>
                </div>

                {/* Strength Meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-500 dark:text-zinc-400">Password Strength:</span>
                      <span className={`text-xs ${strengthScore >= 4 ? 'text-emerald-600 dark:text-emerald-400' : strengthScore >= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {strengthLabel}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full transition-all ${strengthScore >= 1 ? strengthColor : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${strengthScore >= 2 ? strengthColor : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${strengthScore >= 3 ? strengthColor : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${strengthScore >= 4 ? strengthColor : 'bg-transparent'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Confirm New Master Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Re-enter new master password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-xs font-medium cursor-pointer"
                  >
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
                {confirmPassword && !isMatch && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                    Passwords do not match yet.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <Link
                to="/superadmin/profile"
                className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors text-center"
              >
                {t('common.cancel', 'Cancel')}
              </Link>
              <button
                type="submit"
                disabled={submitting || (newPassword && !isMatch)}
                className="px-6 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <FleetIcons.Key className="w-4 h-4" />
                <span>{submitting ? 'Updating Credentials…' : 'Rotate Master Password'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Checklist Column */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span>🛡️</span> Security Validation
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className={`flex items-center gap-2.5 p-2 rounded-lg ${hasMinLength ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>
                <span>{hasMinLength ? '✓' : '○'}</span>
                <span>Minimum 8 characters</span>
              </div>
              <div className={`flex items-center gap-2.5 p-2 rounded-lg ${hasUpperCase ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>
                <span>{hasUpperCase ? '✓' : '○'}</span>
                <span>At least 1 uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-2.5 p-2 rounded-lg ${hasNumber ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>
                <span>{hasNumber ? '✓' : '○'}</span>
                <span>At least 1 numeric digit (0-9)</span>
              </div>
              <div className={`flex items-center gap-2.5 p-2 rounded-lg ${hasSpecial ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>
                <span>{hasSpecial ? '✓' : '○'}</span>
                <span>At least 1 symbol (!@#$%)</span>
              </div>
              <div className={`flex items-center gap-2.5 p-2 rounded-lg ${isMatch ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>
                <span>{isMatch ? '✓' : '○'}</span>
                <span>Passwords match</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">🔐 Sovereign Vault Policy</h4>
            <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
              Passwords are salted and hashed using standard bcrypt algorithms. Master credentials protect platform-wide multi-tenant data, telemetry feeds, and emergency broadcast overrides.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperChangePasswordPage;
